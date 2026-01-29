export class Delivery {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly customerId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly department: string,
    public readonly zipCode: string,
    public readonly instructions: string | null,
    public status: 'PENDING' | 'SHIPPED' | 'DELIVERED',
    public readonly createdAt: Date = new Date(),
  ) {}

  static create(props: {
    id: string;
    transactionId: string;
    customerId: string;
    address: string;
    city: string;
    department: string;
    zipCode: string;
    instructions?: string;
  }): Delivery {
    return new Delivery(
      props.id,
      props.transactionId,
      props.customerId,
      props.address,
      props.city,
      props.department,
      props.zipCode,
      props.instructions ?? null,
      'PENDING',
    );
  }

  ship(): void {
    this.status = 'SHIPPED';
  }

  markDelivered(): void {
    this.status = 'DELIVERED';
  }
}
