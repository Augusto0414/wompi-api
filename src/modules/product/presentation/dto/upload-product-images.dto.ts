import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UploadProductImagesDto {
  @ApiProperty({
    description: 'Índice de la imagen que será la principal (0-based)',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  setPrimaryIndex?: number;
}

export class ProductImageResponseDto {
  @ApiProperty({ description: 'ID único de la imagen' })
  id: string;

  @ApiProperty({ description: 'URL de la imagen en S3' })
  url: string;

  @ApiProperty({ description: 'Indica si es la imagen principal' })
  isPrimary: boolean;

  @ApiProperty({ description: 'Orden de la imagen' })
  order: number;
}
