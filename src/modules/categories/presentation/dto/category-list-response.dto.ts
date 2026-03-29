import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from './category.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 24 })
  totalItems!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryDto] })
  items!: CategoryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
