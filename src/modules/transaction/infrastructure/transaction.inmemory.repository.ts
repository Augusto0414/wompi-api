import { Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction.entity';
import { TransactionRepositoryPort } from '../domain/transaction.repository.port';

@Injectable()
export class TransactionInMemoryRepository implements TransactionRepositoryPort {
  private store = new Map<string, Transaction>();

  create(tx: Transaction): Promise<void> {
    this.store.set(tx.id, tx);
    return Promise.resolve();
  }

  findById(id: string): Promise<Transaction | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  update(tx: Transaction): Promise<void> {
    this.store.set(tx.id, tx);
    return Promise.resolve();
  }
}
