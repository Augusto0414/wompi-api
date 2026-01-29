import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { CreateTransactionUseCase } from './application/create-transaction.usecase';
import { GetTransactionUseCase } from './application/get-transaction.usecase';
import { PayTransactionUseCase } from './application/pay-transaction.usecase';
import { TransactionInMemoryRepository } from './infrastructure/transaction.inmemory.repository';
import { WompiAdapter } from './infrastructure/wompi.adapter';
import { TransactionController } from './presentation/transaction.controller';
import { WompiController } from './presentation/wompi.controller';

const TRANSACTION_REPOSITORY = {
  provide: 'TransactionRepositoryPort',
  useClass: TransactionInMemoryRepository,
};

const PAYMENT_GATEWAY = {
  provide: 'PaymentGatewayPort',
  useClass: WompiAdapter,
};

@Module({
  imports: [ProductModule],
  controllers: [TransactionController, WompiController],
  providers: [
    CreateTransactionUseCase,
    PayTransactionUseCase,
    GetTransactionUseCase,
    TRANSACTION_REPOSITORY,
    PAYMENT_GATEWAY,
    WompiAdapter,
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionModule {}
