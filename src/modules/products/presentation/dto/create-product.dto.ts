import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { parseJsonFormValue, parseStringArrayFormValue } from 'src/common/utils/form-data.util';
import { ProductStatus } from '../../data/entities/product.entity';
import { CreateProductImageDto } from './create-product-image.dto';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2001' })
  @IsMongoId()
  categoryId!: string;

  @ApiPropertyOptional({ example: '67e4f0f78a6ef35a3b4f2101' })
  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @ApiProperty({ example: 'iPhone 16 Pro' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ example: 'iphone-16-pro' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Latest flagship smartphone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Premium Apple smartphone' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
    default: ProductStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ type: [String], example: ['smartphone', 'apple', 'premium'] })
  @IsOptional()
  @Transform(({ value }) => parseStringArrayFormValue(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Buy iPhone 16 Pro online' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Latest iPhone 16 Pro from trusted vendor' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({ type: [CreateProductVariantDto] })
  @Transform(({ value }) => parseJsonFormValue<CreateProductVariantDto[]>(value))
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];

  @ApiPropertyOptional({ type: [CreateProductImageDto] })
  @IsOptional()
  @Transform(({ value }) => parseJsonFormValue<CreateProductImageDto[]>(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
