export class ProductImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly key: string,
    public readonly productId: string,
    public isPrimary: boolean = false,
    public order: number = 0,
  ) {}

  static create(
    id: string,
    url: string,
    key: string,
    productId: string,
    isPrimary: boolean = false,
    order: number = 0,
  ): ProductImage {
    return new ProductImage(id, url, key, productId, isPrimary, order);
  }

  setPrimary(isPrimary: boolean): void {
    this.isPrimary = isPrimary;
  }

  setOrder(order: number): void {
    this.order = order;
  }
}
