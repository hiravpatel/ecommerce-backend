import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { ProductImage } from '../entities/product.entity';

@Injectable()
export class ProductImageRepository extends BaseMongoRepository<ProductImage> {
  constructor(
    @InjectRepository(ProductImage)
    repository: MongoRepository<ProductImage>,
  ) {
    super(repository);
  }

  findByProductId(productId: ObjectId) {
    return this.findBy({ productId });
  }

  deleteByProductId(productId: ObjectId) {
    return this.deleteManyBy({ productId });
  }
}
