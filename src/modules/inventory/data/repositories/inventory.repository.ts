import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryRepository extends BaseMongoRepository<Inventory> {
  constructor(
    @InjectRepository(Inventory)
    repository: MongoRepository<Inventory>,
  ) {
    super(repository);
  }

  findByVariantId(variantId: ObjectId) {
    return this.findOneBy({ variantId });
  }

  deleteByVariantId(variantId: ObjectId) {
    return this.deleteManyBy({ variantId });
  }
}
