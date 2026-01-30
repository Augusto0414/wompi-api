import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig, databaseConfig, s3Config, wompiConfig } from './config';
import { ProductImageSeeder } from './database/seeders/product-image.seeder';
import { ProductSeeder } from './database/seeders/product.seeder';
import { CustomerModule } from './modules/customer/customer.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ProductImageOrmEntity } from './modules/product/infrastructure/entities/product-image.orm-entity';
import { ProductOrmEntity } from './modules/product/infrastructure/entities/product.orm-entity';
import { S3StorageService } from './modules/product/infrastructure/s3-storage.service';
import { ProductModule } from './modules/product/product.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, wompiConfig, s3Config],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Detectar si usamos Neon/Vercel (siempre requiere SSL)
        const isNeonDatabase =
          process.env.DATABASE_HOST?.includes('neon.tech') ||
          process.env.DATABASE_URL?.includes('neon.tech');
        const useSSL = isNeonDatabase || process.env.NODE_ENV === 'production';

        const config = {
          type: 'postgres' as const,
          host: process.env.DATABASE_HOST ?? 'localhost',
          port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
          username: process.env.DATABASE_USERNAME ?? 'appuser',
          password: process.env.DATABASE_PASSWORD ?? 'apppass',
          database: process.env.DATABASE_NAME ?? 'appdb',
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV === 'development',
          logging: process.env.NODE_ENV === 'development',
        };

        if (useSSL) {
          return {
            ...config,
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        return config;
      },
    }),
    TypeOrmModule.forFeature([ProductOrmEntity, ProductImageOrmEntity]),
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
  providers: [ProductSeeder, ProductImageSeeder, S3StorageService],
})
export class AppModule {}
