import { Product } from '../domain/product.entity';

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
}

export class ProductPresenter {
  static toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      available: product.stock > 0,
    };
  }

  static toResponseList(products: Product[]): ProductResponseDto[] {
    return products.map((product) => ProductPresenter.toResponse(product));
  }
}
