import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other',
}

export enum ReturnRequestStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PICKED_UP = 'picked_up',
  RECEIVED = 'received',
  REFUND_INITIATED = 'refund_initiated',
  COMPLETED = 'completed',
}

@Entity('return_requests')
@Index('IDX_RETURN_REQUESTS_ORDER_ITEM', ['orderItemId'])
@Index('IDX_RETURN_REQUESTS_USER', ['userId'])
export class ReturnRequest extends BaseDocumentEntity {
  @Column()
  orderItemId!: ObjectId;

  @Column()
  userId!: ObjectId;

  @Column({
    type: 'enum',
    enum: ReturnReason,
  })
  reason!: ReturnReason;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ nullable: true })
  images?: string[] | null;

  @Column()
  quantity!: number;

  @Column({
    type: 'enum',
    enum: ReturnRequestStatus,
    default: ReturnRequestStatus.REQUESTED,
  })
  status!: ReturnRequestStatus;

  @Column({ nullable: true })
  adminNote?: string | null;

  @Column({ nullable: true })
  reviewedBy?: ObjectId | null;
}
