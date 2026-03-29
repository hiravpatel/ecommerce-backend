import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2001' })
  id!: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  parentId!: string | null;

  @ApiProperty({ example: 'Mobiles' })
  name!: string;

  @ApiProperty({ example: 'mobiles' })
  slug!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Smartphones and accessories' })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '/uploads/categories/mobiles.png' })
  imageUrl!: string | null;

  @ApiProperty({ example: 'electronics/mobiles' })
  path!: string;

  @ApiProperty({ example: 1 })
  level!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiPropertyOptional({ nullable: true, example: 'Buy mobiles online' })
  metaTitle!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Explore mobile phones and accessories' })
  metaDescription!: string | null;

  @ApiProperty({ example: '2026-03-28T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-28T08:00:00.000Z' })
  updatedAt!: string;
}
