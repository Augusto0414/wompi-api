import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Result, ok, type AppError } from 'src/shared/result';
import { Customer } from '../domain/customer.entity';
import type { CustomerRepositoryPort } from '../domain/customer.repository.port';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('CustomerRepositoryPort')
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(input: {
    email: string;
    fullName: string;
    phone: string;
  }): Promise<Result<Customer, AppError>> {
    const existingCustomer = await this.customerRepository.findByEmail(
      input.email,
    );

    if (existingCustomer) {
      return ok(existingCustomer);
    }

    const customer = Customer.create({
      id: crypto.randomUUID(),
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
    });

    await this.customerRepository.create(customer);

    return ok(customer);
  }
}
