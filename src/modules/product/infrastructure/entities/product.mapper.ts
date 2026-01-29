import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(ormEntity: ProductOrmEntity): Product {
    return new Product(
      ormEntity.id,
      ormEntity.name,
      ormEntity.description,
      ormEntity.price,
      ormEntity.stock,
      ormEntity.imageUrl,
    );
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();
    ormEntity.id = domain.id;
    ormEntity.name = domain.name;
    ormEntity.description = domain.description;
    ormEntity.price = domain.price;
    ormEntity.stock = domain.stock;
    ormEntity.imageUrl = domain.imageUrl ?? null;
    return ormEntity;
  }

  static toDomainList(ormEntities: ProductOrmEntity[]): Product[] {
    return ormEntities.map((entity) => ProductMapper.toDomain(entity));
  }
}
