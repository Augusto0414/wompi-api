import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'Transaction ID for this delivery',
    example: 'tx-001',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'Customer ID for the delivery',
    example: 'cust-001',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Delivery address',
    example: 'Calle 123 #45-67',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  address: string;

  @ApiProperty({
    description: 'City name',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Department/State name',
    example: 'Cundinamarca',
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Postal/ZIP code',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  zipCode: string;

  @ApiPropertyOptional({
    description: 'Special delivery instructions',
    example: 'Leave at the reception desk',
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}
