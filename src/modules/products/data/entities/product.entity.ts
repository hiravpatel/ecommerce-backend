import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { BaseDocumentEntity } from 'src/common/database/base-document.entity';
import { slugify } from 'src/common/utils/slug.util';

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

@Entity('brands')
@Index('UQ_BRANDS_NAME', ['name'], { unique: true })
@Index('UQ_BRANDS_SLUG', ['slug'], { unique: true })
export class Brand extends BaseDocumentEntity {
  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ nullable: true })
  logoUrl?: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.slug) {
      this.slug = slugify(this.name);
    }
  }
}

@Entity('products')
@Index('UQ_PRODUCTS_UUID', ['uuid'], { unique: true })
@Index('UQ_PRODUCTS_SLUG', ['slug'], { unique: true })
@Index('IDX_PRODUCTS_VENDOR_STATUS', ['vendorId', 'status'])
@Index('IDX_PRODUCTS_CATEGORY', ['categoryId'])
export class Product extends BaseDocumentEntity {
  @Column()
  uuid!: string;

  @Column()
  vendorId!: ObjectId;

  @Column()
  categoryId!: ObjectId;

  @Column({ nullable: true })
  brandId?: ObjectId | null;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ nullable: true })
  shortDescription?: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ nullable: true })
  rejectionReason?: string | null;

  @Column()
  basePrice!: number;

  @Column({ nullable: true })
  tags?: string[] | null;

  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ nullable: true })
  metaTitle?: string | null;

  @Column({ nullable: true })
  metaDescription?: string | null;

  @Column({ default: 0 })
  rating!: number;

  @Column({ default: 0 })
  reviewCount!: number;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }

    if (!this.slug) {
      this.slug = slugify(this.name);
    }
  }
}

@Entity('product_variants')
@Index('UQ_PRODUCT_VARIANTS_SKU', ['sku'], { unique: true })
@Index('IDX_PRODUCT_VARIANTS_PRODUCT', ['productId'])
export class ProductVariant extends BaseDocumentEntity {
  @Column()
  productId!: ObjectId;

  @Column()
  sku!: string;

  @Column()
  name!: string;

  @Column()
  price!: number;

  @Column({ nullable: true })
  comparePrice?: number | null;

  @Column({ nullable: true })
  costPrice?: number | null;

  @Column({ nullable: true })
  weightGrams?: number | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;
}

@Entity('variant_attribute_values')
@Index('IDX_VARIANT_ATTRIBUTE_VALUES_VARIANT', ['variantId'])
export class VariantAttributeValue extends BaseDocumentEntity {
  @Column()
  variantId!: ObjectId;

  @Column()
  attributeId!: ObjectId;

  @Column({ nullable: true })
  valueId?: ObjectId | null;

  @Column({ nullable: true })
  customValue?: string | null;
}

@Entity('product_images')
@Index('IDX_PRODUCT_IMAGES_PRODUCT', ['productId'])
@Index('IDX_PRODUCT_IMAGES_VARIANT', ['variantId'])
export class ProductImage extends BaseDocumentEntity {
  @Column()
  productId!: ObjectId;

  @Column({ nullable: true })
  variantId?: ObjectId | null;

  @Column()
  url!: string;

  @Column({ nullable: true })
  altText?: string | null;

  @Column({ default: false })
  isPrimary!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;
}
