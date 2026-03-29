import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/data/entities/user.entity';
import { UserRepository } from '../users/data/repositories/user.repository';
import {
  Vendor,
  VendorBankAccount,
  VendorKycDocument,
} from './data/entities/vendor.entity';
import { VendorBankAccountRepository } from './data/repositories/vendor-bank-account.repository';
import { VendorKycDocumentRepository } from './data/repositories/vendor-kyc-document.repository';
import { VendorRepository } from './data/repositories/vendor.repository';
import { VendorsService } from './infrastructure/services/vendors.service';
import { AdminVendorsController } from './presentation/controllers/admin-vendors.controller';
import { VendorsController } from './presentation/controllers/vendors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vendor, VendorBankAccount, VendorKycDocument])],
  controllers: [VendorsController, AdminVendorsController],
  providers: [
    VendorsService,
    UserRepository,
    VendorRepository,
    VendorBankAccountRepository,
    VendorKycDocumentRepository,
  ],
})
export class VendorsModule {}
