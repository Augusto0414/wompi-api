import type { Delivery } from './delivery.entity';

export interface DeliveryRepositoryPort {
  create(delivery: Delivery): Promise<void>;
  findById(id: string): Promise<Delivery | null>;
  findByTransactionId(transactionId: string): Promise<Delivery | null>;
  update(delivery: Delivery): Promise<void>;
}
