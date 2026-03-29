import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from './category.dto';

export class CategoryTreeDto extends CategoryDto {
  @ApiProperty({ type: () => [CategoryTreeDto] })
  children!: CategoryTreeDto[];
}
