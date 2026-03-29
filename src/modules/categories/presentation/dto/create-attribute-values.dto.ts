import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateAttributeValueItemDto {
  @ApiProperty({ example: 'Black' })
  @IsString()
  value!: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  hexColor?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;
}

export class CreateAttributeValuesDto {
  @ApiProperty({ type: [CreateAttributeValueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeValueItemDto)
  values!: CreateAttributeValueItemDto[];
}
