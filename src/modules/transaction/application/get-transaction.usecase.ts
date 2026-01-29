import { Inject, Injectable } from '@nestjs/common';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import type { Transaction } from '../domain/transaction.entity';
import type { TransactionRepositoryPort } from '../domain/transaction.repository.port';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(transactionId: string): Promise<Result<Transaction, AppError>> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      return fail({ code: 'NOT_FOUND', message: 'Transaction not found' });
    }
    return ok(transaction);
  }
}
