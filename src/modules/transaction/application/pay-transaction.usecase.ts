import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepositoryPort } from 'src/modules/product/domain/product.repository.port';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import type { PaymentGatewayPort } from '../domain/payment-gateway.port';
import type { Transaction } from '../domain/transaction.entity';
import type { TransactionRepositoryPort } from '../domain/transaction.repository.port';

export interface PayTransactionInput {
  transactionId: string;
  cardToken: string;
}

@Injectable()
export class PayTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    input: PayTransactionInput,
  ): Promise<Result<Transaction, AppError>> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );

    if (!transaction) {
      return fail({ code: 'NOT_FOUND', message: 'Transaction not found' });
    }

    if (!transaction.isPending()) {
      return fail({
        code: 'TRANSACTION_ALREADY_PROCESSED',
        message: 'Transaction already processed',
      });
    }

    const paymentResult = await this.paymentGateway.pay(
      transaction.totalAmount,
      input.cardToken,
    );

    if (!paymentResult.success) {
      return this.handlePaymentFailure(
        transaction,
        paymentResult.wompiTransactionId,
        paymentResult.errorMessage,
      );
    }

    return this.handlePaymentSuccess(
      transaction,
      paymentResult.wompiTransactionId,
    );
  }

  private async handlePaymentFailure(
    transaction: Transaction,
    wompiTransactionId?: string,
    errorMessage?: string,
  ): Promise<Result<Transaction, AppError>> {
    transaction.decline(wompiTransactionId);
    await this.transactionRepository.update(transaction);

    return fail({
      code: 'PAYMENT_FAILED',
      message: errorMessage ?? 'Payment declined',
    });
  }

  private async handlePaymentSuccess(
    transaction: Transaction,
    wompiTransactionId?: string,
  ): Promise<Result<Transaction, AppError>> {
    const product = await this.productRepository.findById(
      transaction.productId,
    );

    if (!product) {
      return this.handlePaymentFailure(
        transaction,
        wompiTransactionId,
        'Product not found',
      );
    }

    if (!product.hasStock(1)) {
      return this.handlePaymentFailure(
        transaction,
        wompiTransactionId,
        'Product out of stock',
      );
    }

    product.decreaseStock(1);
    transaction.approve(wompiTransactionId);

    await this.productRepository.save(product);
    await this.transactionRepository.update(transaction);

    return ok(transaction);
  }
}
