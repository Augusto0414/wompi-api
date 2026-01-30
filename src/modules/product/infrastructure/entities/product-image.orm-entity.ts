import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('product_images')
export class ProductImageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500 })
  key: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => ProductOrmEntity, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductOrmEntity;

  @Column({ name: 'product_id' })
  productId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
