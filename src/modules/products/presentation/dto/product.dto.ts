import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../data/entities/product.entity';
import { ProductImageDto } from './product-image.dto';
import { ProductVariantDto } from './product-variant.dto';

export class ProductDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f3001' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  uuid!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e99' })
  vendorId!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2001' })
  categoryId!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  brandId!: string | null;

  @ApiProperty({ example: 'iPhone 16 Pro' })
  name!: string;

  @ApiProperty({ example: 'iphone-16-pro' })
  slug!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Latest flagship smartphone' })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Premium Apple smartphone' })
  shortDescription!: string | null;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.DRAFT })
  status!: ProductStatus;

  @ApiPropertyOptional({ nullable: true, example: null })
  rejectionReason!: string | null;

  @ApiProperty({ example: 79999 })
  basePrice!: number;

  @ApiProperty({ type: [String], example: ['smartphone', 'apple', 'premium'] })
  tags!: string[];

  @ApiProperty({ example: false })
  isFeatured!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 'Buy iPhone 16 Pro online' })
  metaTitle!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Latest iPhone 16 Pro from trusted vendor' })
  metaDescription!: string | null;

  @ApiProperty({ example: 0 })
  rating!: number;

  @ApiProperty({ example: 0 })
  reviewCount!: number;

  @ApiProperty({ type: [ProductVariantDto] })
  variants!: ProductVariantDto[];

  @ApiProperty({ type: [ProductImageDto] })
  images!: ProductImageDto[];

  @ApiProperty({ example: '2026-03-28T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-28T08:00:00.000Z' })
  updatedAt!: string;
}
