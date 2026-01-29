import { Inject, Injectable } from '@nestjs/common';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import type { Delivery } from '../domain/delivery.entity';
import type { DeliveryRepositoryPort } from '../domain/delivery.repository.port';

@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject('DeliveryRepositoryPort')
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(deliveryId: string): Promise<Result<Delivery, AppError>> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      return fail({ code: 'NOT_FOUND', message: 'Delivery not found' });
    }
    return ok(delivery);
  }

  async byTransaction(
    transactionId: string,
  ): Promise<Result<Delivery, AppError>> {
    const delivery =
      await this.deliveryRepository.findByTransactionId(transactionId);
    if (!delivery) {
      return fail({
        code: 'NOT_FOUND',
        message: 'Delivery not found for this transaction',
      });
    }
    return ok(delivery);
  }
}
