import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseMongoRepository<Product> {
  constructor(
    @InjectRepository(Product)
    repository: MongoRepository<Product>,
  ) {
    super(repository);
  }

  findByVendorId(vendorId: ObjectId) {
    return this.findBy({ vendorId });
  }

  findByVendorIdAndId(vendorId: ObjectId, productId: ObjectId) {
    return this.findOneBy({ vendorId, _id: productId });
  }

  findBySlug(slug: string) {
    return this.findOneBy({ slug });
  }
}
