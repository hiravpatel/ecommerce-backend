import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';
import { slugify } from 'src/common/utils/slug.util';

export enum VendorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum VendorKycStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum VendorKycDocumentType {
  PAN = 'pan',
  GSTIN = 'gstin',
  AADHAAR = 'aadhaar',
  BUSINESS_REGISTRATION = 'business_registration',
  OTHER = 'other',
}

export enum VendorKycDocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('vendors')
@Index('UQ_VENDORS_USER_ID', ['userId'], { unique: true })
@Index('UQ_VENDORS_BUSINESS_SLUG', ['businessSlug'], { unique: true })
@Index('UQ_VENDORS_GSTIN', ['gstin'], { unique: true, sparse: true })
@Index('IDX_VENDORS_STATUS', ['status'])
export class Vendor extends BaseDocumentEntity {
  @Column()
  userId!: ObjectId;

  @Column()
  businessName!: string;

  @Column()
  businessSlug!: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ nullable: true })
  logoUrl?: string | null;

  @Column({ nullable: true })
  bannerUrl?: string | null;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status!: VendorStatus;

  @Column({ default: 10 })
  commissionRate!: number;

  @Column({ nullable: true })
  gstin?: string | null;

  @Column({ nullable: true })
  panNumber?: string | null;

  @Column({
    type: 'enum',
    enum: VendorKycStatus,
    default: VendorKycStatus.PENDING,
  })
  kycStatus!: VendorKycStatus;

  @Column({ nullable: true })
  bankAccountId?: ObjectId | null;

  @Column({ default: 0 })
  totalRevenue!: number;

  @Column({ default: 0 })
  rating!: number;

  @Column({ default: 0 })
  totalOrders!: number;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.businessSlug) {
      this.businessSlug = slugify(this.businessName);
    }
  }
}

@Entity('vendor_bank_accounts')
@Index('IDX_VENDOR_BANK_ACCOUNTS_VENDOR', ['vendorId'])
export class VendorBankAccount extends BaseDocumentEntity {
  @Column()
  vendorId!: ObjectId;

  @Column()
  accountHolderName!: string;

  @Column()
  accountNumberEncrypted!: string;

  @Column()
  ifscCode!: string;

  @Column()
  bankName!: string;

  @Column({ nullable: true })
  branchName?: string | null;

  @Column({ default: false })
  isVerified!: boolean;
}

@Entity('vendor_kyc_documents')
@Index('IDX_VENDOR_KYC_DOCUMENTS_VENDOR', ['vendorId'])
export class VendorKycDocument extends BaseDocumentEntity {
  @Column()
  vendorId!: ObjectId;

  @Column({
    type: 'enum',
    enum: VendorKycDocumentType,
  })
  docType!: VendorKycDocumentType;

  @Column()
  docUrl!: string;

  @Column({
    type: 'enum',
    enum: VendorKycDocumentStatus,
    default: VendorKycDocumentStatus.PENDING,
  })
  status!: VendorKycDocumentStatus;

  @Column({ nullable: true })
  reviewedBy?: ObjectId | null;

  @Column({ nullable: true })
  reviewNote?: string | null;
}
