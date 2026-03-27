import { BeforeInsert, Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';
import { generateOrderNumber } from 'src/common/utils/order-number.util';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUND_REQUESTED = 'refund_requested',
  REFUNDED = 'refunded',
}

export enum SubOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface ProductSnapshot {
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  imageUrl?: string | null;
  attributes?: Array<{
    attribute: string;
    value: string;
  }>;
}

@Entity('orders')
@Index('UQ_ORDERS_ORDER_NUMBER', ['orderNumber'], { unique: true })
@Index('IDX_ORDERS_USER', ['userId'])
@Index('IDX_ORDERS_STATUS', ['status'])
export class Order extends BaseDocumentEntity {
  @Column()
  orderNumber!: string;

  @Column()
  userId!: ObjectId;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column()
  subtotal!: number;

  @Column({ default: 0 })
  discountAmount!: number;

  @Column({ default: 0 })
  taxAmount!: number;

  @Column({ default: 0 })
  shippingAmount!: number;

  @Column()
  totalAmount!: number;

  @Column({ default: 'INR' })
  currency!: string;

  @Column({ nullable: true })
  shippingAddressId?: ObjectId | null;

  @Column()
  shippingAddressSnapshot!: AddressSnapshot;

  @Column({ nullable: true })
  notes?: string | null;

  @Column({ nullable: true })
  ipAddress?: string | null;

  @Column()
  placedAt!: Date;

  @BeforeInsert()
  assignDefaults() {
    if (!this.orderNumber) {
      this.orderNumber = generateOrderNumber();
    }

    if (!this.placedAt) {
      this.placedAt = new Date();
    }
  }
}

@Entity('sub_orders')
@Index('IDX_SUB_ORDERS_ORDER', ['orderId'])
@Index('IDX_SUB_ORDERS_VENDOR', ['vendorId'])
export class SubOrder extends BaseDocumentEntity {
  @Column()
  orderId!: ObjectId;

  @Column()
  vendorId!: ObjectId;

  @Column({
    type: 'enum',
    enum: SubOrderStatus,
    default: SubOrderStatus.PENDING,
  })
  status!: SubOrderStatus;

  @Column()
  subtotal!: number;

  @Column()
  commissionAmount!: number;

  @Column()
  vendorPayoutAmount!: number;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  payoutStatus!: PayoutStatus;
}

@Entity('order_items')
@Index('IDX_ORDER_ITEMS_SUB_ORDER', ['subOrderId'])
@Index('IDX_ORDER_ITEMS_PRODUCT', ['productId'])
export class OrderItem extends BaseDocumentEntity {
  @Column()
  subOrderId!: ObjectId;

  @Column()
  productId!: ObjectId;

  @Column()
  variantId!: ObjectId;

  @Column()
  productSnapshot!: ProductSnapshot;

  @Column()
  quantity!: number;

  @Column()
  unitPrice!: number;

  @Column({ default: 0 })
  discountPerUnit!: number;

  @Column({ default: 0 })
  taxRate!: number;

  @Column({ default: 0 })
  taxAmount!: number;

  @Column()
  totalPrice!: number;

  @Column({ nullable: true })
  reviewId?: ObjectId | null;
}

@Entity('order_status_history')
@Index('IDX_ORDER_STATUS_HISTORY_ORDER', ['orderId'])
@Index('IDX_ORDER_STATUS_HISTORY_SUB_ORDER', ['subOrderId'])
export class OrderStatusHistory extends BaseDocumentEntity {
  @Column({ nullable: true })
  orderId?: ObjectId | null;

  @Column({ nullable: true })
  subOrderId?: ObjectId | null;

  @Column({ nullable: true })
  fromStatus?: string | null;

  @Column()
  toStatus!: string;

  @Column({ nullable: true })
  note?: string | null;

  @Column({ nullable: true })
  changedBy?: ObjectId | null;
}
