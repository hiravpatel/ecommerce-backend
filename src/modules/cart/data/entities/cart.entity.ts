import { BeforeInsert, Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

@Entity('carts')
@Index('IDX_CARTS_USER', ['userId'])
@Index('IDX_CARTS_SESSION', ['sessionId'])
export class Cart extends BaseDocumentEntity {
  @Column({ nullable: true })
  userId?: ObjectId | null;

  @Column({ nullable: true })
  sessionId?: string | null;

  @Column({ nullable: true })
  expiresAt?: Date | null;
}

@Entity('cart_items')
@Index('IDX_CART_ITEMS_CART', ['cartId'])
export class CartItem extends BaseDocumentEntity {
  @Column()
  cartId!: ObjectId;

  @Column()
  productId!: ObjectId;

  @Column()
  variantId!: ObjectId;

  @Column({ default: 1 })
  quantity!: number;

  @Column()
  priceSnapshot!: number;

  @Column()
  addedAt!: Date;

  @BeforeInsert()
  assignAddedAt() {
    if (!this.addedAt) {
      this.addedAt = new Date();
    }
  }
}
