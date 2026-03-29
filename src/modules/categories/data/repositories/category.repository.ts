import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
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

  findBySlug(slug: string) {
    return this.findOneBy({ slug });
  }

  findByParentId(parentId: ObjectId | null) {
    if (parentId) {
      return this.findBy({ parentId });
    }

    return this.findBy({ parentId: null as never });
  }
}
