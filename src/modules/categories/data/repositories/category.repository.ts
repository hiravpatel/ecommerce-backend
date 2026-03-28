import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends BaseMongoRepository<Category> {
  constructor(
    @InjectRepository(Category)
    repository: MongoRepository<Category>,
  ) {
    super(repository);
  }
}
