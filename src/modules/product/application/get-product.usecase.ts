import { Inject, Injectable } from '@nestjs/common';
import { Result, fail, ok, type AppError } from 'src/shared/result';
import type { Product } from '../domain/product.entity';
import type { ProductRepositoryPort } from '../domain/product.repository.port';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(productId: string): Promise<Result<Product, AppError>> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return fail({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    return ok(product);
  }
}
