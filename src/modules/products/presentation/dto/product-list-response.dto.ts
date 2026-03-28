import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

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

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductDto] })
  items!: ProductDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
