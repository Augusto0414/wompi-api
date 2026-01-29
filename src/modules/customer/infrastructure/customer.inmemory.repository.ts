import { Injectable } from '@nestjs/common';
import { Customer } from '../domain/customer.entity';
import type { CustomerRepositoryPort } from '../domain/customer.repository.port';

@Injectable()
export class CustomerInMemoryRepository implements CustomerRepositoryPort {
  private store = new Map<string, Customer>();

  create(customer: Customer): Promise<void> {
    this.store.set(customer.id, customer);
    return Promise.resolve();
  }

  findById(id: string): Promise<Customer | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByEmail(email: string): Promise<Customer | null> {
    for (const customer of this.store.values()) {
      if (customer.email === email) return Promise.resolve(customer);
    }
    return Promise.resolve(null);
  }

  update(customer: Customer): Promise<void> {
    this.store.set(customer.id, customer);
    return Promise.resolve();
  }
}
