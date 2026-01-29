import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  fullName: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '3001234567',
  })
  @IsString()
  @IsNotEmpty()
  @Length(7, 15)
  phone: string;
}
