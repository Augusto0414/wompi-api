import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { ProductRepositoryPort } from 'src/modules/product/domain/product.repository.port';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import { Transaction } from '../domain/transaction.entity';
import type { TransactionRepositoryPort } from '../domain/transaction.repository.port';

export interface CreateTransactionInput {
  productId: string;
  customerId?: string;
  shippingCost?: number;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<Transaction, AppError>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return fail({ code: 'NOT_FOUND', message: 'Product not found' });
    }

    if (!product.hasStock(1)) {
      return fail({
        code: 'INSUFFICIENT_STOCK',
        message: 'Product out of stock',
      });
    }

    const transaction = Transaction.create({
      id: crypto.randomUUID(),
      productId: input.productId,
      customerId: input.customerId,
      productPrice: product.price,
      shippingCost: input.shippingCost,
    });

    await this.transactionRepository.create(transaction);

    return ok(transaction);
  }
}
