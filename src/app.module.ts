import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig, databaseConfig, wompiConfig } from './config';
import { ProductSeeder } from './database/seeders/product.seeder';
import { CustomerModule } from './modules/customer/customer.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ProductOrmEntity } from './modules/product/infrastructure/entities/product.orm-entity';
import { ProductModule } from './modules/product/product.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, wompiConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
        username: process.env.DATABASE_USERNAME ?? 'appuser',
        password: process.env.DATABASE_PASSWORD ?? 'apppass',
        database: process.env.DATABASE_NAME ?? 'appdb',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([ProductOrmEntity]),
    SharedModule,
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
  providers: [ProductSeeder],
})
export class AppModule {}
