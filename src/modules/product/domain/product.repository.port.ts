import type { Product } from './product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
