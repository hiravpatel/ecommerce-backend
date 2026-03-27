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

export enum CategoryAttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
}

@Entity('categories')
@Index('UQ_CATEGORIES_SLUG', ['slug'], { unique: true })
@Index('IDX_CATEGORIES_PARENT', ['parentId'])
@Index('IDX_CATEGORIES_PATH', ['path'])
export class Category extends BaseDocumentEntity {
  @Column({ nullable: true })
  parentId?: ObjectId | null;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ nullable: true })
  imageUrl?: string | null;

  @Column()
  path!: string;

  @Column({ default: 0 })
  level!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @Column({ nullable: true })
  metaTitle?: string | null;

  @Column({ nullable: true })
  metaDescription?: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.slug) {
      this.slug = slugify(this.name);
    }
  }
}

@Entity('category_attributes')
@Index('IDX_CATEGORY_ATTRIBUTES_CATEGORY', ['categoryId'])
@Index('IDX_CATEGORY_ATTRIBUTES_CATEGORY_SLUG', ['categoryId', 'slug'], {
  unique: true,
})
export class CategoryAttribute extends BaseDocumentEntity {
  @Column()
  categoryId!: ObjectId;

  @Column()
  name!: string;

  @Column()
  slug!: string;

  @Column({
    type: 'enum',
    enum: CategoryAttributeType,
  })
  type!: CategoryAttributeType;

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: true })
  isFilterable!: boolean;

  @Column({ default: false })
  isVariantDefining!: boolean;

  @Column({ default: 0 })
  sortOrder!: number;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    if (!this.slug) {
      this.slug = slugify(this.name);
    }
  }
}

@Entity('attribute_values')
@Index('IDX_ATTRIBUTE_VALUES_ATTRIBUTE', ['attributeId'])
export class AttributeValue extends BaseDocumentEntity {
  @Column()
  attributeId!: ObjectId;

  @Column()
  value!: string;

  @Column({ nullable: true })
  hexColor?: string | null;

  @Column({ default: 0 })
  sortOrder!: number;
}
