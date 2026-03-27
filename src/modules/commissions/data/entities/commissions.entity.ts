import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';
import { PayoutStatus } from 'src/modules/orders/data/entities/orders.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

@Entity('vendor_payouts')
@Index('IDX_VENDOR_PAYOUTS_VENDOR', ['vendorId'])
@Index('IDX_VENDOR_PAYOUTS_BANK_ACCOUNT', ['bankAccountId'])
export class VendorPayout extends BaseDocumentEntity {
  @Column()
  vendorId!: ObjectId;

  @Column()
  bankAccountId!: ObjectId;

  @Column()
  amount!: number;

  @Column()
  referencePeriodStart!: Date;

  @Column()
  referencePeriodEnd!: Date;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status!: PayoutStatus;

  @Column({ nullable: true })
  gatewayTransferId?: string | null;

  @Column({ nullable: true })
  failureReason?: string | null;

  @Column({ nullable: true })
  initiatedAt?: Date | null;

  @Column({ nullable: true })
  completedAt?: Date | null;
}

@Entity('payout_line_items')
@Index('IDX_PAYOUT_LINE_ITEMS_PAYOUT', ['payoutId'])
@Index('IDX_PAYOUT_LINE_ITEMS_SUB_ORDER', ['subOrderId'])
export class PayoutLineItem extends BaseDocumentEntity {
  @Column()
  payoutId!: ObjectId;

  @Column()
  subOrderId!: ObjectId;

  @Column()
  grossAmount!: number;

  @Column()
  commissionAmount!: number;

  @Column()
  netAmount!: number;
}

@Entity('coupons')
@Index('UQ_COUPONS_CODE', ['code'], { unique: true })
export class Coupon extends BaseDocumentEntity {
  @Column()
  code!: string;

  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type!: CouponType;

  @Column()
  value!: number;

  @Column({ default: 0 })
  minOrderAmount!: number;

  @Column({ nullable: true })
  maxDiscountAmount?: number | null;

  @Column({ nullable: true })
  usageLimit?: number | null;

  @Column({ default: 0 })
  usageCount!: number;

  @Column({ default: 1 })
  perUserLimit!: number;

  @Column()
  validFrom!: Date;

  @Column({ nullable: true })
  validUntil?: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    this.code = this.code.trim().toUpperCase();
  }
}
