import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';
import type { AddressSnapshot } from 'src/modules/orders/data/entities/orders.entity';

export enum ShipmentStatus {
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity('shipments')
@Index('UQ_SHIPMENTS_SUB_ORDER', ['subOrderId'], { unique: true })
@Index('IDX_SHIPMENTS_TRACKING_NUMBER', ['trackingNumber'])
export class Shipment extends BaseDocumentEntity {
  @Column()
  subOrderId!: ObjectId;

  @Column()
  courierName!: string;

  @Column({ nullable: true })
  trackingNumber?: string | null;

  @Column({ nullable: true })
  trackingUrl?: string | null;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.LABEL_CREATED,
  })
  status!: ShipmentStatus;

  @Column({ nullable: true })
  estimatedDelivery?: Date | null;

  @Column({ nullable: true })
  actualDelivery?: Date | null;

  @Column()
  pickupAddressSnapshot!: AddressSnapshot;

  @Column()
  deliveryAddressSnapshot!: AddressSnapshot;
}

@Entity('shipment_tracking_events')
@Index('IDX_SHIPMENT_TRACKING_EVENTS_SHIPMENT', ['shipmentId'])
export class ShipmentTrackingEvent extends BaseDocumentEntity {
  @Column()
  shipmentId!: ObjectId;

  @Column()
  status!: string;

  @Column({ nullable: true })
  location?: string | null;

  @Column({ nullable: true })
  description?: string | null;

  @Column()
  occurredAt!: Date;
}
