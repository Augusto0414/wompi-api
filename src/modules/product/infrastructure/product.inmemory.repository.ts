import { Injectable } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import type { ProductRepositoryPort } from '../domain/product.repository.port';

@Injectable()
export class ProductInMemoryRepository implements ProductRepositoryPort {
  private store = new Map<string, Product>();

  constructor() {
    this.seedProducts();
  }

  private seedProducts(): void {
    const products = [
      new Product(
        'prod-001',
        'Wireless Headphones Pro',
        'Premium wireless headphones with active noise cancellation and 30-hour battery life',
        299000,
        10,
      ),
      new Product(
        'prod-002',
        'Smart Watch Ultra',
        'Advanced smartwatch with GPS, heart rate monitor, and water resistance',
        450000,
        5,
      ),
      new Product(
        'prod-003',
        'Portable Speaker',
        'Compact Bluetooth speaker with 360° sound and 12-hour playtime',
        150000,
        15,
      ),
      new Product(
        'prod-004',
        'USB-C Hub',
        'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery',
        89000,
        20,
      ),
      new Product(
        'prod-005',
        'Mechanical Keyboard',
        'RGB mechanical keyboard with Cherry MX switches and aluminum frame',
        220000,
        8,
      ),
    ];

    for (const product of products) {
      this.store.set(product.id, product);
    }
  }

  findAll(): Promise<Product[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  save(product: Product): Promise<void> {
    this.store.set(product.id, product);
    return Promise.resolve();
  }
}
