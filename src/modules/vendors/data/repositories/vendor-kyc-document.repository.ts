import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { VendorKycDocument } from '../entities/vendor.entity';

@Injectable()
export class VendorKycDocumentRepository extends BaseMongoRepository<VendorKycDocument> {
  constructor(
    @InjectRepository(VendorKycDocument)
    repository: MongoRepository<VendorKycDocument>,
  ) {
    super(repository);
  }

  findByVendorId(vendorId: ObjectId) {
    return this.findBy({ vendorId });
  }
}
