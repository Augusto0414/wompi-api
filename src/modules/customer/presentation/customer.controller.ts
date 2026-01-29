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
import { CreateCustomerUseCase } from '../application/create-customer.usecase';
import { GetCustomerUseCase } from '../application/get-customer.usecase';
import { CustomerPresenter } from './customer.presenter';
import { CreateCustomerDto } from './dto/create-customer.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const result = await this.createCustomerUseCase.execute(createCustomerDto);
    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return CustomerPresenter.toResponse(result.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID único del cliente (UUID)' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') customerId: string) {
    const result = await this.getCustomerUseCase.execute(customerId);
    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }
    return CustomerPresenter.toResponse(result.value);
  }
}
