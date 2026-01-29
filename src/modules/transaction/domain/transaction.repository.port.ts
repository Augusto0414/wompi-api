import { Transaction } from './transaction.entity';

export interface TransactionRepositoryPort {
  create(tx: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  update(tx: Transaction): Promise<void>;
}
