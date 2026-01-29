import { Module } from '@nestjs/common';
import { CreateCustomerUseCase } from './application/create-customer.usecase';
import { GetCustomerUseCase } from './application/get-customer.usecase';
import { CustomerInMemoryRepository } from './infrastructure/customer.inmemory.repository';
import { CustomerController } from './presentation/customer.controller';

const CUSTOMER_REPOSITORY = {
  provide: 'CustomerRepositoryPort',
  useClass: CustomerInMemoryRepository,
};

@Module({
  controllers: [CustomerController],
  providers: [CreateCustomerUseCase, GetCustomerUseCase, CUSTOMER_REPOSITORY],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
