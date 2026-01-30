import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteProductImageUseCase } from '../application/delete-product-image.usecase';
import { GetProductImagesUseCase } from '../application/get-product-images.usecase';
import { UploadProductImagesUseCase } from '../application/upload-product-images.usecase';
import { ProductImage } from '../domain/product-image.entity';
import { ProductImageResponseDto } from './dto/upload-product-images.dto';

const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|gif|webp)$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

@ApiTags('Product Images')
@Controller('products/:productId/images')
export class ProductImageController {
  constructor(
    private readonly uploadImages: UploadProductImagesUseCase,
    private readonly getImages: GetProductImagesUseCase,
    private readonly deleteImage: DeleteProductImageUseCase,
  ) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', MAX_FILES, {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const isValid = ALLOWED_MIME_TYPES.test(file.mimetype);
        if (!isValid) {
          return callback(
            new HttpException(
              'Solo se permiten imágenes (jpeg, png, gif, webp)',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Subir imágenes para un producto' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiQuery({
    name: 'primaryIndex',
    required: false,
    description: 'Índice de la imagen que será la principal',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas exitosamente',
    type: [ProductImageResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Archivo no válido' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async upload(
    @Param('productId') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('primaryIndex') primaryIndex?: string,
  ): Promise<ProductImageResponseDto[]> {
    if (!files?.length) {
      throw new HttpException(
        'Se requiere al menos una imagen',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.uploadImages.execute({
      productId,
      files,
      primaryIndex: primaryIndex ? parseInt(primaryIndex, 10) : undefined,
    });

    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }

    return this.mapToResponse(result.value.images);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las imágenes de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de imágenes del producto',
    type: [ProductImageResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async list(
    @Param('productId') productId: string,
  ): Promise<ProductImageResponseDto[]> {
    const result = await this.getImages.execute(productId);

    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }

    return this.mapToResponse(result.value);
  }

  @Delete(':imageId')
  @ApiOperation({ summary: 'Eliminar una imagen de un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiParam({ name: 'imageId', description: 'ID de la imagen' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async remove(
    @Param('imageId') imageId: string,
  ): Promise<{ message: string }> {
    const result = await this.deleteImage.execute(imageId);

    if (!result.ok) {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }

    return { message: 'Imagen eliminada exitosamente' };
  }

  private mapToResponse(images: ProductImage[]): ProductImageResponseDto[] {
    return images.map(({ id, url, isPrimary, order }) => ({
      id,
      url,
      isPrimary,
      order,
    }));
  }
}
