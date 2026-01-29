import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../../modules/product/infrastructure/entities/product.orm-entity';

@Injectable()
export class ProductSeeder implements OnModuleInit {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    const count = await this.productRepository.count();

    if (count > 0) {
      this.logger.log(`Products already seeded (${count} products found)`);
      return;
    }

    this.logger.log('Seeding products...');

    const products = this.getInitialProducts();

    await this.productRepository.save(products);

    this.logger.log(`Successfully seeded ${products.length} products`);
  }

  private getInitialProducts(): Partial<ProductOrmEntity>[] {
    return [
      {
        name: 'iPhone 15 Pro',
        description:
          'Apple iPhone 15 Pro 256GB - Titanium Natural. A17 Pro chip, 48MP camera system.',
        price: 499900000,
        stock: 25,
        imageUrl:
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch_GEO_US?wid=800&hei=800',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description:
          'Samsung Galaxy S24 Ultra 512GB - Titanium Gray. Snapdragon 8 Gen 3, S Pen included.',
        price: 549900000,
        stock: 18,
        imageUrl:
          'https://images.samsung.com/is/image/samsung/p6pim/co/2401/gallery/co-galaxy-s24-sm-s928bzkcltc-thumb-539573328',
      },
      {
        name: 'MacBook Pro 14"',
        description:
          'Apple MacBook Pro 14" M3 Pro chip, 18GB RAM, 512GB SSD. Space Black.',
        price: 899900000,
        stock: 12,
        imageUrl:
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=800&hei=800',
      },
      {
        name: 'Sony WH-1000XM5',
        description:
          'Sony WH-1000XM5 Wireless Noise Canceling Headphones. 30hr battery, multipoint connection.',
        price: 169900000,
        stock: 45,
        imageUrl:
          'https://www.sony.com/image/5d02da5df552836db894cead8a68f5f3?fmt=png-alpha&wid=800',
      },
      {
        name: 'Apple Watch Ultra 2',
        description:
          'Apple Watch Ultra 2 GPS + Cellular 49mm. Titanium case with Alpine Loop.',
        price: 379900000,
        stock: 20,
        imageUrl:
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-2-702702-702702?wid=800&hei=800',
      },
      {
        name: 'iPad Pro 12.9"',
        description:
          'Apple iPad Pro 12.9" M2 chip, 256GB, WiFi. Liquid Retina XDR display.',
        price: 549900000,
        stock: 15,
        imageUrl:
          'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210?wid=800&hei=800',
      },
      {
        name: 'DJI Mini 4 Pro',
        description:
          'DJI Mini 4 Pro Drone with RC 2 Controller. 4K/60fps HDR video, 48MP photos.',
        price: 449900000,
        stock: 8,
        imageUrl:
          'https://dji-official-fe.djicdn.com/dps/0bc4bdb7f3d9d4a8d2f1f6fc9e4a5c7e.png',
      },
      {
        name: 'PlayStation 5',
        description:
          'Sony PlayStation 5 Disc Edition. 825GB SSD, DualSense controller included.',
        price: 269900000,
        stock: 30,
        imageUrl:
          'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$800px$',
      },
      {
        name: 'Nintendo Switch OLED',
        description:
          'Nintendo Switch OLED Model - White. 7" OLED screen, 64GB internal storage.',
        price: 179900000,
        stock: 35,
        imageUrl:
          'https://assets.nintendo.com/image/upload/c_fill,w_800/q_auto:best/f_auto/dpr_2.0/ncom/en_US/switch/site-design-update/oled-background',
      },
      {
        name: 'Bose SoundLink Max',
        description:
          'Bose SoundLink Max Portable Speaker. 20hr battery, IP67 waterproof, PositionIQ.',
        price: 149900000,
        stock: 22,
        imageUrl:
          'https://assets.bose.com/content/dam/cloudassets/Bose_DAM/Web/consumer_electronics/global/products/speakers/soundlink_max/product_silo_images/aem_pdp_silo_soundlink-max_bk_EC-800x800.png/jcr:content/renditions/cq5dam.web.600.600.png',
      },
    ];
  }
}
