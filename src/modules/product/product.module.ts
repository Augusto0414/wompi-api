import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteProductImageUseCase } from './application/delete-product-image.usecase';
import { GetAllProductsUseCase } from './application/get-all-products.usecase';
import { GetProductImagesUseCase } from './application/get-product-images.usecase';
import { GetProductUseCase } from './application/get-product.usecase';
import { UploadProductImagesUseCase } from './application/upload-product-images.usecase';
import { ProductImageOrmEntity } from './infrastructure/entities/product-image.orm-entity';
import { ProductOrmEntity } from './infrastructure/entities/product.orm-entity';
import { ProductTypeOrmRepository } from './infrastructure/product.typeorm-repository';
import { S3StorageService } from './infrastructure/s3-storage.service';
import { ProductImageController } from './presentation/product-image.controller';
import { ProductController } from './presentation/product.controller';

const PRODUCT_REPOSITORY = {
  provide: 'ProductRepositoryPort',
  useClass: ProductTypeOrmRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductOrmEntity, ProductImageOrmEntity]),
  ],
  controllers: [ProductController, ProductImageController],
  providers: [
    GetProductUseCase,
    GetAllProductsUseCase,
    UploadProductImagesUseCase,
    GetProductImagesUseCase,
    DeleteProductImageUseCase,
    ProductTypeOrmRepository,
    S3StorageService,
    PRODUCT_REPOSITORY,
  ],
  exports: [PRODUCT_REPOSITORY, TypeOrmModule],
})
export class ProductModule {}
