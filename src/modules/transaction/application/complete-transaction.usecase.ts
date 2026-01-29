import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepositoryPort } from '../../product/domain/product.repository.port';
import type { PaymentGatewayPort } from '../domain/payment-gateway.port';
import type { TransactionRepositoryPort } from '../domain/transaction.repository.port';

@Injectable()
export class CompleteTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(transactionId: string, cardToken: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const success = await this.paymentGateway.pay(
      transaction.totalAmount,
      cardToken,
    );

    if (!success) {
      transaction.decline();
      await this.transactionRepository.update(transaction);
      return transaction;
    }

    transaction.approve();

    const product = await this.productRepository.findById(
      transaction.productId,
    );
    if (!product) throw new Error('Product not found');
    product.decreaseStock(1);

    await this.productRepository.save(product);
    await this.transactionRepository.update(transaction);

    return transaction;
  }
}
