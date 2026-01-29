import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../domain/product.entity';
import { ProductRepositoryPort } from '../domain/product.repository.port';
import { ProductMapper } from './entities/product.mapper';
import { ProductOrmEntity } from './entities/product.orm-entity';

@Injectable()
export class ProductTypeOrmRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find({
      order: { name: 'ASC' },
    });
    return ProductMapper.toDomainList(entities);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return ProductMapper.toDomain(entity);
  }

  async save(product: Product): Promise<void> {
    const ormEntity = ProductMapper.toOrm(product);
    await this.repository.save(ormEntity);
  }

  async update(product: Product): Promise<void> {
    const ormEntity = ProductMapper.toOrm(product);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
