import { Delivery } from '../domain/delivery.entity';

export interface DeliveryResponseDto {
  id: string;
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  department: string;
  zipCode: string;
  instructions: string | null;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  createdAt: Date;
}

export class DeliveryPresenter {
  static toResponse(delivery: Delivery): DeliveryResponseDto {
    return {
      id: delivery.id,
      transactionId: delivery.transactionId,
      customerId: delivery.customerId,
      address: delivery.address,
      city: delivery.city,
      department: delivery.department,
      zipCode: delivery.zipCode,
      instructions: delivery.instructions,
      status: delivery.status,
      createdAt: delivery.createdAt,
    };
  }

  static toResponseList(deliveries: Delivery[]): DeliveryResponseDto[] {
    return deliveries.map((delivery) => DeliveryPresenter.toResponse(delivery));
  }
}
