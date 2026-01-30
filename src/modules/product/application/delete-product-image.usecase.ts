import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { fail, ok, Result } from '../../../shared/result';
import type { ProductRepositoryPort } from '../domain/product.repository.port';
import { ProductImageOrmEntity } from '../infrastructure/entities/product-image.orm-entity';
import { S3StorageService } from '../infrastructure/s3-storage.service';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @InjectRepository(ProductImageOrmEntity)
    private readonly imageRepository: Repository<ProductImageOrmEntity>,
    private readonly storageService: S3StorageService,
  ) {}

  async execute(imageId: string): Promise<Result<void, Error>> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      return fail(new Error('Imagen no encontrada'));
    }

    await this.storageService.deleteProductImage(image.key);

    if (image.isPrimary) {
      await this.reassignPrimaryImage(image.productId, imageId);
    }

    await this.imageRepository.delete(imageId);

    return ok(undefined);
  }

  private async reassignPrimaryImage(
    productId: string,
    excludeImageId: string,
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) return;

    const nextImage = await this.imageRepository.findOne({
      where: { productId, id: Not(excludeImageId) },
      order: { order: 'ASC' },
    });

    if (nextImage) {
      nextImage.isPrimary = true;
      await this.imageRepository.save(nextImage);
      product.imageUrl = nextImage.url;
    } else {
      product.imageUrl = null;
    }

    await this.productRepository.save(product);
  }
}
