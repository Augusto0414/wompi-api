import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fail, ok, Result } from '../../../shared/result';
import { ProductImage } from '../domain/product-image.entity';
import type { ProductRepositoryPort } from '../domain/product.repository.port';
import { ProductImageMapper } from '../infrastructure/entities/product-image.mapper';
import { ProductImageOrmEntity } from '../infrastructure/entities/product-image.orm-entity';

@Injectable()
export class GetProductImagesUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @InjectRepository(ProductImageOrmEntity)
    private readonly imageRepository: Repository<ProductImageOrmEntity>,
  ) {}

  async execute(productId: string): Promise<Result<ProductImage[], Error>> {
    const productExists = await this.productRepository.findById(productId);
    if (!productExists) {
      return fail(new Error('Producto no encontrado'));
    }

    const images = await this.imageRepository.find({
      where: { productId },
      order: { order: 'ASC' },
    });

    return ok(ProductImageMapper.toDomainList(images));
  }
}
