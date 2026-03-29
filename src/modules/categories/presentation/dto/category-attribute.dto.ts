import { ApiProperty } from '@nestjs/swagger';
import { CategoryAttributeType } from '../../data/entities/category.entity';
import { AttributeValueDto } from './attribute-value.dto';

export class CategoryAttributeDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f4001' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2001' })
  categoryId!: string;

  @ApiProperty({ example: 'Color' })
  name!: string;

  @ApiProperty({ example: 'color' })
  slug!: string;

  @ApiProperty({ enum: CategoryAttributeType, example: CategoryAttributeType.SELECT })
  type!: CategoryAttributeType;

  @ApiProperty({ example: true })
  isRequired!: boolean;

  @ApiProperty({ example: true })
  isFilterable!: boolean;

  @ApiProperty({ example: true })
  isVariantDefining!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ type: [AttributeValueDto] })
  values!: AttributeValueDto[];
}
