import { Injectable } from '@nestjs/common';
import { Delivery } from '../domain/delivery.entity';
import type { DeliveryRepositoryPort } from '../domain/delivery.repository.port';

@Injectable()
export class DeliveryInMemoryRepository implements DeliveryRepositoryPort {
  private store = new Map<string, Delivery>();

  create(delivery: Delivery): Promise<void> {
    this.store.set(delivery.id, delivery);
    return Promise.resolve();
  }

  findById(id: string): Promise<Delivery | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByTransactionId(transactionId: string): Promise<Delivery | null> {
    for (const delivery of this.store.values()) {
      if (delivery.transactionId === transactionId)
        return Promise.resolve(delivery);
    }
    return Promise.resolve(null);
  }

  update(delivery: Delivery): Promise<void> {
    this.store.set(delivery.id, delivery);
    return Promise.resolve();
  }
}
