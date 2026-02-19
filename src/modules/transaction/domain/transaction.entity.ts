import { TransactionStatus } from './transaction-status.enum';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly customerId: string | null,
    public readonly productPrice: number,
    public readonly baseCharge: number,
    public readonly shippingCost: number,
    public readonly vatAmount: number,
    public readonly totalAmount: number,
    private status: TransactionStatus,
    public wompiTransactionId: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(props: {
    id: string;
    productId: string;
    customerId?: string;
    productPrice: number;
    baseCharge?: number;
    shippingCost?: number;
  }): Transaction {
    const baseCharge = props.baseCharge ?? 5000;
    const shippingCost = props.shippingCost ?? 0;
    const vatAmount = props.productPrice * 0.19;
    const totalAmount = props.productPrice + vatAmount + baseCharge + shippingCost;

    return new Transaction(
      props.id,
      props.productId,
      props.customerId ?? null,
      props.productPrice,
      baseCharge,
      shippingCost,
      vatAmount,
      totalAmount,
      TransactionStatus.PENDING,
    );
  }

  approve(wompiTransactionId?: string): void {
    this.status = TransactionStatus.APPROVED;
    this.wompiTransactionId = wompiTransactionId ?? null;
    this.updatedAt = new Date();
  }

  decline(wompiTransactionId?: string): void {
    this.status = TransactionStatus.DECLINED;
    this.wompiTransactionId = wompiTransactionId ?? null;
    this.updatedAt = new Date();
  }

  getStatus(): TransactionStatus {
    return this.status;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }
}
