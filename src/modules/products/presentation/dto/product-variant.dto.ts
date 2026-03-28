import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariantDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f3101' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f3001' })
  productId!: string;

  @ApiProperty({ example: 'JES-IPHONE16-BLK-128' })
  sku!: string;

  @ApiProperty({ example: 'Black / 128 GB' })
  name!: string;

  @ApiProperty({ example: 79999 })
  price!: number;

  @ApiPropertyOptional({ nullable: true, example: 84999 })
  comparePrice!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 72000 })
  costPrice!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 320 })
  weightGrams!: number | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: 25 })
  quantityOnHand!: number;

  @ApiProperty({ example: 0 })
  quantityReserved!: number;

  @ApiProperty({ example: 25 })
  quantityAvailable!: number;

  @ApiProperty({ example: 5 })
  reorderLevel!: number;
}
