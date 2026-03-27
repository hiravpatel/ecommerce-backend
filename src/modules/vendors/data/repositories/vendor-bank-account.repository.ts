import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { decryptField, encryptField } from 'src/common/utils/field-encryption.util';
import { VendorBankAccount } from '../entities/vendor.entity';

type VendorBankAccountWithPlainAccountNumber = VendorBankAccount & {
  accountNumber?: string;
};

@Injectable()
export class VendorBankAccountRepository extends BaseMongoRepository<VendorBankAccount> {
  constructor(
    @InjectRepository(VendorBankAccount)
    repository: MongoRepository<VendorBankAccount>,
    private readonly configService: ConfigService,
  ) {
    super(repository);
  }

  async saveWithEncryptedAccountNumber(
    entity: VendorBankAccountWithPlainAccountNumber,
  ) {
    const encryptionKey = this.configService.get<string>('security.encryptionKey')!;

    // Queryable fields stay plain in Mongo; only sensitive payload fields are encrypted at rest.
    if (entity.accountNumber) {
      entity.accountNumberEncrypted = encryptField(entity.accountNumber, encryptionKey);
      delete entity.accountNumber;
    }

    return this.save(entity);
  }

  async findOneDecryptedBy(where: FindOptionsWhere<VendorBankAccount>) {
    const entity = await this.findOneBy(where);

    if (!entity) {
      return null;
    }

    return this.decryptAccountNumber(entity);
  }

  private decryptAccountNumber(entity: VendorBankAccount) {
    const encryptionKey = this.configService.get<string>('security.encryptionKey')!;

    return {
      ...entity,
      accountNumber: decryptField(entity.accountNumberEncrypted, encryptionKey),
    };
  }
}
