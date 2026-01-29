import { Inject, Injectable } from '@nestjs/common';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import type { Customer } from '../domain/customer.entity';
import type { CustomerRepositoryPort } from '../domain/customer.repository.port';

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject('CustomerRepositoryPort')
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(customerId: string): Promise<Result<Customer, AppError>> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      return fail({ code: 'NOT_FOUND', message: 'Customer not found' });
    }
    return ok(customer);
  }
}
