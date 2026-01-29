import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDeliveryUseCase } from '../application/create-delivery.usecase';
import { GetDeliveryUseCase } from '../application/get-delivery.usecase';
import { DeliveryPresenter } from './delivery.presenter';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getDeliveryUseCase: GetDeliveryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva entrega para una transacción' })
  @ApiResponse({ status: 201, description: 'Entrega creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    const result = await this.createDeliveryUseCase.execute(createDeliveryDto);
    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return DeliveryPresenter.toResponse(result.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una entrega por ID' })
  @ApiParam({ name: 'id', description: 'ID único de la entrega (UUID)' })
  @ApiResponse({ status: 200, description: 'Entrega encontrada' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada' })
  async findOne(@Param('id') deliveryId: string) {
    const result = await this.getDeliveryUseCase.execute(deliveryId);
    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }
    return DeliveryPresenter.toResponse(result.value);
  }

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: 'Obtener la entrega asociada a una transacción' })
  @ApiParam({
    name: 'transactionId',
    description: 'ID de la transacción asociada',
  })
  @ApiResponse({ status: 200, description: 'Entrega encontrada' })
  @ApiResponse({ status: 404, description: 'Entrega no encontrada' })
  async findByTransaction(@Param('transactionId') transactionId: string) {
    const result = await this.getDeliveryUseCase.byTransaction(transactionId);
    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }
    return DeliveryPresenter.toResponse(result.value);
  }
}
