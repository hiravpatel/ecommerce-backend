import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
  COD = 'cod',
}

export enum PaymentStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('payments')
@Index('UQ_PAYMENTS_ORDER_ID', ['orderId'], { unique: true })
@Index('IDX_PAYMENTS_GATEWAY_ORDER_ID', ['gatewayOrderId'])
@Index('UQ_PAYMENTS_GATEWAY_PAYMENT_ID', ['gatewayPaymentId'], {
  unique: true,
  sparse: true,
})
export class Payment extends BaseDocumentEntity {
  @Column()
  orderId!: ObjectId;

  @Column({
    type: 'enum',
    enum: PaymentGateway,
  })
  gateway!: PaymentGateway;

  @Column({ nullable: true })
  gatewayOrderId?: string | null;

  @Column({ nullable: true })
  gatewayPaymentId?: string | null;

  @Column({ nullable: true })
  gatewaySignature?: string | null;

  @Column()
  amount!: number;

  @Column({ default: 'INR' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIATED,
  })
  status!: PaymentStatus;

  @Column({ nullable: true })
  method?: string | null;

  @Column({ nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ nullable: true })
  paidAt?: Date | null;
}

@Entity('refunds')
@Index('IDX_REFUNDS_PAYMENT', ['paymentId'])
@Index('IDX_REFUNDS_RETURN', ['returnId'])
export class Refund extends BaseDocumentEntity {
  @Column()
  paymentId!: ObjectId;

  @Column({ nullable: true })
  returnId?: ObjectId | null;

  @Column()
  amount!: number;

  @Column({ nullable: true })
  reason?: string | null;

  @Column({ nullable: true })
  gatewayRefundId?: string | null;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status!: RefundStatus;

  @Column({ nullable: true })
  processedAt?: Date | null;
}
