import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { CategoryAttributeType } from '../../data/entities/category.entity';

export class CreateCategoryAttributeDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'color' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ enum: CategoryAttributeType, example: CategoryAttributeType.SELECT })
  @IsEnum(CategoryAttributeType)
  type!: CategoryAttributeType;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVariantDefining?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;
}
