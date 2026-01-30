import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { ProductImageOrmEntity } from '../../modules/product/infrastructure/entities/product-image.orm-entity';
import { ProductOrmEntity } from '../../modules/product/infrastructure/entities/product.orm-entity';
import { S3StorageService } from '../../modules/product/infrastructure/s3-storage.service';

interface ImageMapping {
  productId: string;
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
    // Verificar si ya hay imágenes de productos
    const imageCount = await this.productImageRepository.count();
    if (imageCount > 0) {
      this.logger.log(
        `Product images already seeded (${imageCount} images found)`,
      );
      return;
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
        productId: '9e6d6a8b-ba34-4756-bbf6-0025be3faa6a',
        imageName: 'iphone-17-pro-max-colors.png',
      },
      {
        productId: 'c7dc30aa-31f7-4f75-a169-185d35aff525',
        imageName: 'samsum.jpg',
      },
      {
        productId: 'd009e96d-ea1b-4ba8-93bd-ed5f0cd0d322',
        imageName: '1366_2000.jpg',
      },
      {
        productId: '70ac8403-dc4c-4ca8-a680-3323270c3922',
        imageName: 'images.jpg',
      },
      {
        productId: '32f9b16c-467f-4688-ad14-ce6648ddecf2',
        imageName: 'images.jpg',
      },
      {
        productId: 'd806cd47-fdad-41eb-b7b3-bf1cf0415c55',
        imageName: 'ipad.jpg',
      },
      {
        productId: 'f6416af5-3e18-4c2e-9a34-3124bf479056',
        imageName: 'dj.jpg',
      },
      {
        productId: '04668703-8f2a-4283-be59-0598fa683da5',
        imageName: 'ps5.jpg',
      },
      {
        productId: 'e072f5af-cdf3-46f5-b15d-6a31c1c561c5',
        imageName: 'images.jpg',
      },
      {
        productId: '63adb9b9-4276-4765-8499-d2841598ab4b',
        imageName: 'images.jpg',
      },
    ];
  }

  private async uploadAndLinkImage(mapping: ImageMapping): Promise<void> {
    const { productId, imageName } = mapping;

    // Verificar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found, skipping...`);
      return;
    }

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
