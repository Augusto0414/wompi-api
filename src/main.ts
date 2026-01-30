import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wompi Payment API')
    .setDescription(
      `
## API for Wompi Payment Integration

This API handles the payment flow for a product store with Wompi integration.

### Features:
- **Products**: List and retrieve products with stock management
- **Transactions**: Create, pay, and track payment transactions
- **Customers**: Manage customer information
- **Deliveries**: Handle delivery information for orders
- **Wompi Integration**: Card tokenization and payment processing

### Security Notes:
- Card data is tokenized using Wompi's API
- Raw card numbers are never stored
- Uses Wompi Sandbox environment for testing
    `,
    )
    .setVersion('1.0')
    .addTag('Products', 'Product catalog and stock management')
    .addTag('Transactions', 'Payment transaction management')
    .addTag('Customers', 'Customer information management')
    .addTag('Deliveries', 'Delivery and shipping management')
    .addTag('Wompi', 'Wompi payment gateway integration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Wompi API Documentation',
    customfavIcon: 'https://wompi.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}
void bootstrap();
