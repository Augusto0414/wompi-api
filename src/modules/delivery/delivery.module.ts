import { Module } from '@nestjs/common';
import { CreateDeliveryUseCase } from './application/create-delivery.usecase';
import { GetDeliveryUseCase } from './application/get-delivery.usecase';
import { DeliveryInMemoryRepository } from './infrastructure/delivery.inmemory.repository';
import { DeliveryController } from './presentation/delivery.controller';

const DELIVERY_REPOSITORY = {
  provide: 'DeliveryRepositoryPort',
  useClass: DeliveryInMemoryRepository,
};

@Module({
  controllers: [DeliveryController],
  providers: [CreateDeliveryUseCase, GetDeliveryUseCase, DELIVERY_REPOSITORY],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveryModule {}
