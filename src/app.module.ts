import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig, databaseConfig, s3Config, wompiConfig } from './config';
import { ProductImageSeeder } from './database/seeders/product-image.seeder';
import { ProductSeeder } from './database/seeders/product.seeder';
import { CustomerModule } from './modules/customer/customer.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseHost =
          configService.get<string>('database.host') ||
          process.env.DATABASE_HOST ||
          'localhost';
        const databaseUrl =
          configService.get<string>('database.url') || process.env.DATABASE_URL;

        // Detectar si usamos Neon/Vercel (siempre requiere SSL)
        const isNeonDatabase =
          databaseHost?.includes('neon.tech') ||
          databaseUrl?.includes('neon.tech');
        const useSSL = isNeonDatabase || process.env.NODE_ENV === 'production';

        const config = {
          type: 'postgres' as const,
          host:
            configService.get<string>('database.host') ||
            process.env.DATABASE_HOST ||
            'localhost',
          port:
            configService.get<number>('database.port') ||
            parseInt(process.env.DATABASE_PORT || '5432', 10),
          username:
            configService.get<string>('database.username') ||
            process.env.DATABASE_USERNAME ||
            'appuser',
          password:
            configService.get<string>('database.password') ||
            process.env.DATABASE_PASSWORD ||
            'apppass',
          database:
            configService.get<string>('database.database') ||
            process.env.DATABASE_NAME ||
            'appdb',
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
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
  providers: [ProductSeeder, ProductImageSeeder, S3StorageService],
})
export class AppModule {}
