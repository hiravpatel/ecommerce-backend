import { Column, Entity, Index } from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

@Entity('notifications')
@Index('IDX_NOTIFICATIONS_USER', ['userId'])
@Index('IDX_NOTIFICATIONS_TYPE', ['type'])
export class Notification extends BaseDocumentEntity {
  @Column()
  userId!: ObjectId;

  @Column()
  type!: string;

  @Column()
  title!: string;

  @Column()
  body!: string;

  @Column({ nullable: true })
  data?: Record<string, unknown> | null;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel!: NotificationChannel;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  readAt?: Date | null;

  @Column({ nullable: true })
  sentAt?: Date | null;
}
