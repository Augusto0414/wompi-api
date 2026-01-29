export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public imageUrl?: string | null,
  ) {}

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    this.stock += quantity;
  }

  getStock(): number {
    return this.stock;
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }
}
