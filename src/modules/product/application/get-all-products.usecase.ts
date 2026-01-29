import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, type AppError } from 'src/shared/result';
import type { Product } from '../domain/product.entity';
import type { ProductRepositoryPort } from '../domain/product.repository.port';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[], AppError>> {
    const products = await this.productRepository.findAll();
    return ok(products);
  }
}
