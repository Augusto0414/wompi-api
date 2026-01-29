import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetAllProductsUseCase } from './application/get-all-products.usecase';
import { GetProductUseCase } from './application/get-product.usecase';
import { ProductOrmEntity } from './infrastructure/entities/product.orm-entity';
import { ProductTypeOrmRepository } from './infrastructure/product.typeorm-repository';
import { ProductController } from './presentation/product.controller';

const PRODUCT_REPOSITORY = {
  provide: 'ProductRepositoryPort',
  useClass: ProductTypeOrmRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    GetProductUseCase,
    GetAllProductsUseCase,
    ProductTypeOrmRepository,
    PRODUCT_REPOSITORY,
  ],
  exports: [PRODUCT_REPOSITORY, TypeOrmModule],
})
export class ProductModule {}
