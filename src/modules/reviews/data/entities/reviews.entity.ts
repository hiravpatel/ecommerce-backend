import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('reviews')
@Index('IDX_REVIEWS_PRODUCT', ['productId'])
@Index('IDX_REVIEWS_USER', ['userId'])
@Index('IDX_REVIEWS_ORDER_ITEM', ['orderItemId'])
export class Review extends BaseDocumentEntity {
  @Column()
  productId!: ObjectId;

  @Column()
  userId!: ObjectId;

  @Column({ nullable: true })
  orderItemId?: ObjectId | null;

  @Column()
  rating!: number;

  @Column({ nullable: true })
  title?: string | null;

  @Column({ nullable: true })
  body?: string | null;

  @Column({ nullable: true })
  images?: string[] | null;

  @Column({ default: false })
  isVerifiedPurchase!: boolean;

  @Column({ default: 0 })
  helpfulCount!: number;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status!: ReviewStatus;
}
