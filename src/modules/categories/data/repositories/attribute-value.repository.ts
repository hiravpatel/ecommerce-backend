import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { AttributeValue } from '../entities/category.entity';

@Injectable()
export class AttributeValueRepository extends BaseMongoRepository<AttributeValue> {
  constructor(
    @InjectRepository(AttributeValue)
    repository: MongoRepository<AttributeValue>,
  ) {
    super(repository);
  }

  findByAttributeId(attributeId: ObjectId) {
    return this.findBy({ attributeId });
  }

  deleteByAttributeId(attributeId: ObjectId) {
    return this.deleteManyBy({ attributeId });
  }
}
