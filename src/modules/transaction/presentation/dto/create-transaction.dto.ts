import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Product ID to purchase',
    example: 'prod-001',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Customer ID (optional)',
    example: 'cust-001',
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Shipping cost in COP cents',
    example: 8000,
    default: 8000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCost?: number;
}
