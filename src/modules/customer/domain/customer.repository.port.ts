import type { Customer } from './customer.entity';

export interface CustomerRepositoryPort {
  create(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  update(customer: Customer): Promise<void>;
}
