import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class TokenizeCardDto {
  @ApiProperty({
    description: 'Credit card number (16 digits)',
    example: '4242424242424242',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'Card number must be between 13 and 19 digits',
  })
  cardNumber: string;

  @ApiProperty({
    description: 'Card security code (CVV/CVC)',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 4)
  @Matches(/^\d{3,4}$/, { message: 'CVC must be 3 or 4 digits' })
  cvc: string;

  @ApiProperty({
    description: 'Expiration month (01-12)',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Month must be 01-12' })
  expMonth: string;

  @ApiProperty({
    description: 'Expiration year (2 digits)',
    example: '28',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(/^\d{2}$/, { message: 'Year must be 2 digits' })
  expYear: string;

  @ApiProperty({
    description: 'Cardholder name as it appears on the card',
    example: 'JOHN DOE',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  cardHolder: string;
}
