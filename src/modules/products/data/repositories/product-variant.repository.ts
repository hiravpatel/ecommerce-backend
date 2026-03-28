import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { ProductVariant } from '../entities/product.entity';

@Injectable()
export class ProductVariantRepository extends BaseMongoRepository<ProductVariant> {
  constructor(
    @InjectRepository(ProductVariant)
    repository: MongoRepository<ProductVariant>,
  ) {
    super(repository);
  }

  findByProductId(productId: ObjectId) {
    return this.findBy({ productId });
  }

  findBySku(sku: string) {
    return this.findOneBy({ sku });
  }

  deleteByProductId(productId: ObjectId) {
    return this.deleteManyBy({ productId });
  }
}
