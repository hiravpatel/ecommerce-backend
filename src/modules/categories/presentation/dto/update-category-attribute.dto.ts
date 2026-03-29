import { PartialType } from '@nestjs/swagger';
import { CreateCategoryAttributeDto } from './create-category-attribute.dto';

export class UpdateCategoryAttributeDto extends PartialType(CreateCategoryAttributeDto) {}
