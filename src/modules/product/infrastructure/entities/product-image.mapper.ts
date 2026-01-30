import { ProductImage } from '../../domain/product-image.entity';
import { ProductImageOrmEntity } from './product-image.orm-entity';

export class ProductImageMapper {
  static toDomain(ormEntity: ProductImageOrmEntity): ProductImage {
    return new ProductImage(
      ormEntity.id,
      ormEntity.url,
      ormEntity.key,
      ormEntity.productId,
      ormEntity.isPrimary,
      ormEntity.order,
    );
  }

  static toOrm(domain: ProductImage): ProductImageOrmEntity {
    const ormEntity = new ProductImageOrmEntity();
    ormEntity.id = domain.id;
    ormEntity.url = domain.url;
    ormEntity.key = domain.key;
    ormEntity.productId = domain.productId;
    ormEntity.isPrimary = domain.isPrimary;
    ormEntity.order = domain.order;
    return ormEntity;
  }

  static toDomainList(ormEntities: ProductImageOrmEntity[]): ProductImage[] {
    return ormEntities.map((entity) => ProductImageMapper.toDomain(entity));
  }
}
