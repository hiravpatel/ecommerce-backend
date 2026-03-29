import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeValue,
  Category,
  CategoryAttribute,
} from './data/entities/category.entity';
import { AttributeValueRepository } from './data/repositories/attribute-value.repository';
import { CategoryAttributeRepository } from './data/repositories/category-attribute.repository';
import { CategoryRepository } from './data/repositories/category.repository';
import { CategoriesService } from './infrastructure/services/categories.service';
import { CategoriesController } from './presentation/controllers/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryAttribute, AttributeValue])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoryRepository,
    CategoryAttributeRepository,
    AttributeValueRepository,
  ],
  exports: [CategoryRepository, CategoryAttributeRepository, AttributeValueRepository],
})
export class CategoriesModule {}
