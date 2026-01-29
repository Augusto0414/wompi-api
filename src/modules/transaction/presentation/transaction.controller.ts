import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../application/create-transaction.usecase';
import { GetTransactionUseCase } from '../application/get-transaction.usecase';
import { PayTransactionUseCase } from '../application/pay-transaction.usecase';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { TransactionPresenter } from './transaction.presenter';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly payTransactionUseCase: PayTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Creates a transaction in PENDING status for a product. The transaction must be paid using the /pay endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product out of stock' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    const result = await this.createTransactionUseCase.execute({
      productId: createTransactionDto.productId,
      customerId: createTransactionDto.customerId,
      shippingCost: createTransactionDto.shippingCost,
    });

    if (!result.ok) {
      const status =
        result.error.code === 'NOT_FOUND'
          ? HttpStatus.NOT_FOUND
          : result.error.code === 'INSUFFICIENT_STOCK'
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
      throw new HttpException(result.error, status);
    }

    return TransactionPresenter.toResponse(result.value);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description:
      'Retrieves transaction details including status, amounts, and Wompi transaction ID if payment was processed.',
  })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') transactionId: string) {
    const result = await this.getTransactionUseCase.execute(transactionId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return TransactionPresenter.toResponse(result.value);
  }

  @Post(':id/pay')
  @ApiOperation({
    summary: 'Pay a transaction',
    description:
      'Processes payment for a PENDING transaction using a Wompi card token. Updates stock on successful payment.',
  })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 402, description: 'Payment declined' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 409, description: 'Transaction already processed' })
  async pay(
    @Param('id') transactionId: string,
    @Body() payTransactionDto: PayTransactionDto,
  ) {
    const result = await this.payTransactionUseCase.execute({
      transactionId: transactionId,
      cardToken: payTransactionDto.cardToken,
    });

    if (!result.ok) {
      const status =
        result.error.code === 'NOT_FOUND'
          ? HttpStatus.NOT_FOUND
          : result.error.code === 'PAYMENT_FAILED'
            ? HttpStatus.PAYMENT_REQUIRED
            : result.error.code === 'TRANSACTION_ALREADY_PROCESSED'
              ? HttpStatus.CONFLICT
              : HttpStatus.BAD_REQUEST;
      throw new HttpException(result.error, status);
    }

    return TransactionPresenter.toResponse(result.value);
  }
}
