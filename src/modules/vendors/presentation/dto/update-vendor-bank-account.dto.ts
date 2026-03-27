import { PartialType } from '@nestjs/swagger';
import { CreateVendorBankAccountDto } from './create-vendor-bank-account.dto';

export class UpdateVendorBankAccountDto extends PartialType(CreateVendorBankAccountDto) {}
