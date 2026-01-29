import { Customer } from '../domain/customer.entity';

export interface CustomerResponseDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: Date;
}

export class CustomerPresenter {
  static toResponse(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      createdAt: customer.createdAt,
    };
  }

  static toResponseList(customers: Customer[]): CustomerResponseDto[] {
    return customers.map((customer) => CustomerPresenter.toResponse(customer));
  }
}
