import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f3201' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f3001' })
  productId!: string;

  @ApiPropertyOptional({ nullable: true, example: '67e4f0f78a6ef35a3b4f3101' })
  variantId!: string | null;

  @ApiProperty({ example: 'https://cdn.example.com/products/iphone-16-front.jpg' })
  url!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Front view' })
  altText!: string | null;

  @ApiProperty({ example: true })
  isPrimary!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}
