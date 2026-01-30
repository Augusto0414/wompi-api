import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fail, ok, Result } from '../../../shared/result';
import { ProductImage } from '../domain/product-image.entity';
import type { ProductRepositoryPort } from '../domain/product.repository.port';
import { ProductImageMapper } from '../infrastructure/entities/product-image.mapper';
import { ProductImageOrmEntity } from '../infrastructure/entities/product-image.orm-entity';
import { S3StorageService } from '../infrastructure/s3-storage.service';

export interface UploadImagesInput {
  productId: string;
  files: Express.Multer.File[];
  primaryIndex?: number;
}

export interface UploadImagesOutput {
  images: ProductImage[];
}

@Injectable()
export class UploadProductImagesUseCase {
  constructor(
    @Inject('ProductRepositoryPort')
    private readonly productRepository: ProductRepositoryPort,
    @InjectRepository(ProductImageOrmEntity)
    private readonly imageRepository: Repository<ProductImageOrmEntity>,
    private readonly storageService: S3StorageService,
  ) {}

  async execute(
    input: UploadImagesInput,
  ): Promise<Result<UploadImagesOutput, Error>> {
    const { productId, files, primaryIndex } = input;

    const product = await this.productRepository.findById(productId);
    if (!product) {
      return fail(new Error('Producto no encontrado'));
    }

    const currentImageCount = await this.imageRepository.count({
      where: { productId },
    });

    const uploadResults = await this.storageService.uploadMultipleProductImages(
      productId,
      files,
    );

    const isFirstUpload = currentImageCount === 0;
    const hasPrimaryIndex = primaryIndex !== undefined;

    const imageEntities = uploadResults.map((result, index) =>
      this.createImageEntity({
        url: result.url,
        key: result.key,
        productId,
        isPrimary: hasPrimaryIndex
          ? index === primaryIndex
          : isFirstUpload && index === 0,
        order: currentImageCount + index,
      }),
    );

    if (hasPrimaryIndex) {
      await this.imageRepository.update({ productId }, { isPrimary: false });
    }

    const savedImages = await this.imageRepository.save(imageEntities);

    await this.updateProductPrimaryImage(product, savedImages);

    return ok({
      images: ProductImageMapper.toDomainList(savedImages),
    });
  }

  private createImageEntity(data: {
    url: string;
    key: string;
    productId: string;
    isPrimary: boolean;
    order: number;
  }): ProductImageOrmEntity {
    const entity = new ProductImageOrmEntity();
    entity.url = data.url;
    entity.key = data.key;
    entity.productId = data.productId;
    entity.isPrimary = data.isPrimary;
    entity.order = data.order;
    return entity;
  }

  private async updateProductPrimaryImage(
    product: { imageUrl?: string | null },
    images: ProductImageOrmEntity[],
  ): Promise<void> {
    const primary = images.find((img) => img.isPrimary);
    if (!primary) return;

    product.imageUrl = primary.url;
    await this.productRepository.save(product as any);
  }
}
