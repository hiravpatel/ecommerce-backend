import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { Vendor } from '../entities/vendor.entity';

@Injectable()
export class VendorRepository extends BaseMongoRepository<Vendor> {
  constructor(
    @InjectRepository(Vendor)
    repository: MongoRepository<Vendor>,
  ) {
    super(repository);
  }

  findByBusinessSlug(businessSlug: string) {
    return this.findOneBy({ businessSlug });
  }
}
