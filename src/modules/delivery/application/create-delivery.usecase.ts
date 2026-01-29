import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Result, ok, type AppError } from 'src/shared/result';
import { Delivery } from '../domain/delivery.entity';
import type { DeliveryRepositoryPort } from '../domain/delivery.repository.port';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject('DeliveryRepositoryPort')
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(input: {
    transactionId: string;
    customerId: string;
    address: string;
    city: string;
    department: string;
    zipCode: string;
    instructions?: string;
  }): Promise<Result<Delivery, AppError>> {
    const existingDelivery = await this.deliveryRepository.findByTransactionId(
      input.transactionId,
    );

    if (existingDelivery) {
      return ok(existingDelivery);
    }

    const delivery = Delivery.create({
      id: crypto.randomUUID(),
      ...input,
    });

    await this.deliveryRepository.create(delivery);

    return ok(delivery);
  }
}
