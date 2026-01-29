export class Customer {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly phone: string,
    public readonly createdAt: Date = new Date(),
  ) {}

  static create(props: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
  }): Customer {
    return new Customer(props.id, props.email, props.fullName, props.phone);
  }
}
