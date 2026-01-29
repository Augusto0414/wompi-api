import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAllProductsUseCase } from '../application/get-all-products.usecase';
import { GetProductUseCase } from '../application/get-product.usecase';
import { ProductPresenter } from './product.presenter';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductUseCase: GetProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getAll() {
    const result = await this.getAllProductsUseCase.execute();
    if (!result.ok) {
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return ProductPresenter.toResponseList(result.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID único del producto (UUID)' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getProduct(@Param('id') id: string) {
    const result = await this.getProductUseCase.execute(id);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return ProductPresenter.toResponse(result.value);
  }
}
