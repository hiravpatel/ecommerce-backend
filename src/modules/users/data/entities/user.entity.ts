import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

@Entity('users')
@Index('IDX_USERS_ROLE_ACTIVE', ['role', 'isActive'])
export class User extends BaseDocumentEntity {
  @Column()
  @Index('UQ_USERS_UUID', { unique: true })
  uuid!: string;

  @Column()
  @Index('UQ_USERS_EMAIL', { unique: true })
  email!: string;

  @Column({ nullable: true })
  @Index('UQ_USERS_PHONE', { unique: true, sparse: true })
  phone?: string | null;

  @Column()
  passwordHash!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  avatarUrl?: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ default: false })
  isPhoneVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }

    this.email = this.email.trim().toLowerCase();

    if (this.phone) {
      this.phone = this.phone.trim();
    }
  }
}

@Entity('user_addresses')
@Index('IDX_USER_ADDRESSES_USER', ['userId'])
@Index('IDX_USER_ADDRESSES_DEFAULT', ['userId', 'isDefault'])
export class UserAddress extends BaseDocumentEntity {
  @Column()
  userId!: ObjectId;

  @Column()
  label!: string;

  @Column()
  fullName!: string;

  @Column()
  phone!: string;

  @Column()
  addressLine1!: string;

  @Column({ nullable: true })
  addressLine2?: string | null;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  postalCode!: string;

  @Column({ default: 'IN' })
  countryCode!: string;

  @Column({ default: false })
  isDefault!: boolean;
}
