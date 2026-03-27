import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum InventoryChangeType {
  RESTOCK = 'restock',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  RESERVE = 'reserve',
  RELEASE = 'release',
}

@Entity('inventory')
@Index('UQ_INVENTORY_VARIANT_ID', ['variantId'], { unique: true })
export class Inventory extends BaseDocumentEntity {
  @Column()
  variantId!: ObjectId;

  @Column({ default: 0 })
  quantityOnHand!: number;

  @Column({ default: 0 })
  quantityReserved!: number;

  @Column({ default: 0 })
  quantityAvailable!: number;

  @Column({ default: 10 })
  reorderLevel!: number;

  @BeforeInsert()
  @BeforeUpdate()
  syncAvailability() {
    this.quantityAvailable = this.quantityOnHand - this.quantityReserved;
  }
}

@Entity('inventory_logs')
@Index('IDX_INVENTORY_LOGS_VARIANT', ['variantId'])
export class InventoryLog extends BaseDocumentEntity {
  @Column()
  variantId!: ObjectId;

  @Column({
    type: 'enum',
    enum: InventoryChangeType,
  })
  changeType!: InventoryChangeType;

  @Column()
  quantityChange!: number;

  @Column()
  quantityBefore!: number;

  @Column()
  quantityAfter!: number;

  @Column({ nullable: true })
  referenceType?: string | null;

  @Column({ nullable: true })
  referenceId?: string | null;

  @Column({ nullable: true })
  note?: string | null;

  @Column({ nullable: true })
  createdBy?: ObjectId | null;
}
