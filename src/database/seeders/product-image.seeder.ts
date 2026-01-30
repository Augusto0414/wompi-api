import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { ProductImageOrmEntity } from '../../modules/product/infrastructure/entities/product-image.orm-entity';
import { ProductOrmEntity } from '../../modules/product/infrastructure/entities/product.orm-entity';
import { S3StorageService } from '../../modules/product/infrastructure/s3-storage.service';

interface ImageMapping {
  productName: string;
  imageName: string;
}

@Injectable()
export class ProductImageSeeder implements OnModuleInit {
  private readonly logger = new Logger(ProductImageSeeder.name);
  private readonly imgPath = path.join(process.cwd(), 'src', 'img');

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
    @InjectRepository(ProductImageOrmEntity)
    private readonly productImageRepository: Repository<ProductImageOrmEntity>,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    this.logger.log('Checking current product images...');

    // Limpiar las imágenes existentes para rehacer el seeding con los nuevos IDs
    const existingImages = await this.productImageRepository.find();
    if (existingImages.length > 0) {
      this.logger.log(
        `Removing ${existingImages.length} existing images to reseed with new product IDs...`,
      );
      await this.productImageRepository.remove(existingImages);
    }

    this.logger.log('Seeding product images to S3...');

    const imageMappings = this.getImageMappings();

    for (const mapping of imageMappings) {
      await this.uploadAndLinkImage(mapping);
    }

    this.logger.log(
      `Successfully seeded ${imageMappings.length} product images`,
    );
  }

  private getImageMappings(): ImageMapping[] {
    return [
      {
        productName: 'iPhone 15 Pro',
        imageName: 'iphone-17-pro-max-colors.png',
      },
      {
        productName: 'Samsung Galaxy S24 Ultra',
        imageName: 'samsum.jpg',
      },
      {
        productName: 'MacBook Pro 14"',
        imageName: '1366_2000.jpg',
      },
      {
        productName: 'Sony WH-1000XM5',
        imageName: 'images.jpg',
      },
      {
        productName: 'Apple Watch Ultra 2',
        imageName: 'images.jpg',
      },
      {
        productName: 'iPad Pro 12.9"',
        imageName: 'ipad.jpg',
      },
      {
        productName: 'DJI Mini 4 Pro',
        imageName: 'dj.jpg',
      },
      {
        productName: 'PlayStation 5',
        imageName: 'ps5.jpg',
      },
      {
        productName: 'Nintendo Switch OLED',
        imageName: 'images.jpg',
      },
      {
        productName: 'Bose SoundLink Max',
        imageName: 'images.jpg',
      },
    ];
  }

  private async uploadAndLinkImage(mapping: ImageMapping): Promise<void> {
    const { productName, imageName } = mapping;

    // Buscar el producto por nombre
    const product = await this.productRepository.findOne({
      where: { name: productName },
    });

    if (!product) {
      this.logger.warn(`Product "${productName}" not found, skipping...`);
      return;
    }

    const productId = product.id;

    // Leer el archivo de imagen
    const imagePath = path.join(this.imgPath, imageName);
    if (!fs.existsSync(imagePath)) {
      this.logger.warn(
        `Image ${imageName} not found at ${imagePath}, skipping...`,
      );
      return;
    }

    const buffer = fs.readFileSync(imagePath);
    const mimeType = this.getMimeType(imageName);

    // Crear un objeto similar a Multer.File
    const file: Express.Multer.File = {
      buffer,
      originalname: imageName,
      mimetype: mimeType,
      fieldname: 'image',
      encoding: '7bit',
      size: buffer.length,
      destination: '',
      filename: imageName,
      path: imagePath,
      stream: null as any,
    };

    // Subir a S3
    const uploadResult = await this.s3StorageService.uploadProductImage(
      productId,
      file,
    );

    // Crear registro de imagen
    const productImage = new ProductImageOrmEntity();
    productImage.url = uploadResult.url;
    productImage.key = uploadResult.key;
    productImage.productId = productId;
    productImage.isPrimary = true;
    productImage.order = 0;

    await this.productImageRepository.save(productImage);

    // Actualizar imageUrl del producto
    product.imageUrl = uploadResult.url;
    await this.productRepository.save(product);

    this.logger.log(`Uploaded image for product ${product.name}`);
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
  }
}
