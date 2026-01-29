import { TransactionStatus } from '../domain/transaction-status.enum';
import { Transaction } from '../domain/transaction.entity';

export interface TransactionResponseDto {
  id: string;
  productId: string;
  customerId: string | null;
  productPrice: number;
  baseCharge: number;
  shippingCost: number;
  totalAmount: number;
  status: TransactionStatus;
  wompiTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionPresenter {
  static toResponse(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      productId: transaction.productId,
      customerId: transaction.customerId ?? null,
      productPrice: transaction.productPrice,
      baseCharge: transaction.baseCharge,
      shippingCost: transaction.shippingCost,
      totalAmount: transaction.totalAmount,
      status: transaction.getStatus(),
      wompiTransactionId: transaction.wompiTransactionId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  static toResponseList(transactions: Transaction[]): TransactionResponseDto[] {
    return transactions.map((transaction) =>
      TransactionPresenter.toResponse(transaction),
    );
  }
}
