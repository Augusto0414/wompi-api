import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          type: 'postgres' as const,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          ssl: true,
          extra: {
            ssl: true,
          },
          autoLoadEntities: true,
          synchronize:
            configService.get<string>('app.nodeEnv') === 'development',
          logging: configService.get<string>('app.nodeEnv') === 'development',
        };

        console.log('Database config:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
          ssl: config.ssl,
          extra: config.extra,
        });

        return config;
      },
    }),
  ],
})
export class DatabaseModule {}
