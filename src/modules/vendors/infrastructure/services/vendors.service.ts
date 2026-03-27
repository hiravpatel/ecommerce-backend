import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { objectIdToString, toObjectId } from 'src/common/database/object-id.util';
import { slugify } from 'src/common/utils/slug.util';
import { UserRepository } from 'src/modules/users/data/repositories/user.repository';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { VendorBankAccountRepository } from '../../data/repositories/vendor-bank-account.repository';
import { VendorKycDocumentRepository } from '../../data/repositories/vendor-kyc-document.repository';
import { VendorRepository } from '../../data/repositories/vendor.repository';
import {
  Vendor,
  VendorBankAccount,
  VendorKycDocument,
  VendorKycDocumentStatus,
  VendorKycStatus,
} from '../../data/entities/vendor.entity';
import { CreateVendorBankAccountDto } from '../../presentation/dto/create-vendor-bank-account.dto';
import { CreateVendorKycDocumentDto } from '../../presentation/dto/create-vendor-kyc-document.dto';
import { UpdateVendorBankAccountDto } from '../../presentation/dto/update-vendor-bank-account.dto';
import { UpdateVendorProfileDto } from '../../presentation/dto/update-vendor-profile.dto';

@Injectable()
export class VendorsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly vendorRepository: VendorRepository,
    private readonly vendorBankAccountRepository: VendorBankAccountRepository,
    private readonly vendorKycDocumentRepository: VendorKycDocumentRepository,
  ) {}

  async getMyProfile(userUuid: string) {
    const { vendor } = await this.getVendorContext(userUuid);
    return this.serializeVendor(vendor);
  }

  async updateMyProfile(userUuid: string, dto: UpdateVendorProfileDto) {
    return this.updateMyProfileAssets(userUuid, dto);
  }

  async updateMyProfileAssets(
    userUuid: string,
    dto: UpdateVendorProfileDto,
    assets?: {
      logoUrl?: string | null;
      bannerUrl?: string | null;
    },
  ) {
    const { vendor } = await this.getVendorContext(userUuid);

    if (dto.businessName !== undefined) {
      vendor.businessName = dto.businessName.trim();
    }

    if (dto.businessSlug !== undefined || dto.businessName !== undefined) {
      const nextSlug = dto.businessSlug?.trim()
        ? slugify(dto.businessSlug)
        : slugify(vendor.businessName);

      const existingVendor = await this.vendorRepository.findByBusinessSlug(nextSlug);
      if (existingVendor && objectIdToString(existingVendor._id) !== objectIdToString(vendor._id)) {
        throw new ConflictException(RESPONSE_MESSAGES.VENDOR.BUSINESS_SLUG_ALREADY_EXISTS);
      }

      vendor.businessSlug = nextSlug;
    }

    if (dto.gstin !== undefined) {
      const nextGstin = dto.gstin.trim().toUpperCase();
      if (nextGstin) {
        await this.ensureUniqueGstin(nextGstin, vendor._id);
        vendor.gstin = nextGstin;
      } else {
        vendor.gstin = null;
      }
    }

    if (dto.panNumber !== undefined) {
      const nextPan = dto.panNumber.trim().toUpperCase();
      vendor.panNumber = nextPan || null;
    }

    if (dto.description !== undefined) {
      vendor.description = dto.description.trim() || null;
    }

    if (assets?.logoUrl !== undefined) {
      vendor.logoUrl = assets.logoUrl;
    } else if (dto.logoUrl !== undefined) {
      vendor.logoUrl = dto.logoUrl.trim() || null;
    }

    if (assets?.bannerUrl !== undefined) {
      vendor.bannerUrl = assets.bannerUrl;
    } else if (dto.bannerUrl !== undefined) {
      vendor.bannerUrl = dto.bannerUrl.trim() || null;
    }

    await this.vendorRepository.save(vendor);
    return this.serializeVendor(vendor);
  }

  async listBankAccounts(userUuid: string) {
    const { vendor } = await this.getVendorContext(userUuid);
    const bankAccounts = await this.vendorBankAccountRepository.findDecryptedByVendorId(vendor._id);
    return bankAccounts.map((bankAccount) => this.serializeBankAccount(bankAccount));
  }

  async createBankAccount(userUuid: string, dto: CreateVendorBankAccountDto) {
    const { vendor } = await this.getVendorContext(userUuid);

    const bankAccount = this.vendorBankAccountRepository.create({
      vendorId: vendor._id,
      accountHolderName: dto.accountHolderName.trim(),
      accountNumber: dto.accountNumber.trim(),
      ifscCode: dto.ifscCode.trim().toUpperCase(),
      bankName: dto.bankName.trim(),
      branchName: dto.branchName?.trim() || null,
      isVerified: false,
    } as VendorBankAccount & { accountNumber: string });

    const savedBankAccount =
      await this.vendorBankAccountRepository.saveWithEncryptedAccountNumber(bankAccount);

    if (!vendor.bankAccountId) {
      vendor.bankAccountId = savedBankAccount._id;
      await this.vendorRepository.save(vendor);
    }

    const decryptedBankAccount = await this.vendorBankAccountRepository.findOneDecryptedBy({
      _id: savedBankAccount._id,
      vendorId: vendor._id,
    });

    return this.serializeBankAccount(decryptedBankAccount!);
  }

  async updateBankAccount(
    userUuid: string,
    bankAccountId: string,
    dto: UpdateVendorBankAccountDto,
  ) {
    const { vendor } = await this.getVendorContext(userUuid);
    const accountObjectId = toObjectId(bankAccountId)!;
    const bankAccount = await this.vendorBankAccountRepository.findOneBy({
      _id: accountObjectId,
      vendorId: vendor._id,
    });

    if (!bankAccount) {
      throw new NotFoundException(RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_NOT_FOUND);
    }

    if (dto.accountHolderName !== undefined) {
      bankAccount.accountHolderName = dto.accountHolderName.trim();
    }

    if (dto.ifscCode !== undefined) {
      bankAccount.ifscCode = dto.ifscCode.trim().toUpperCase();
    }

    if (dto.bankName !== undefined) {
      bankAccount.bankName = dto.bankName.trim();
    }

    if (dto.branchName !== undefined) {
      bankAccount.branchName = dto.branchName.trim() || null;
    }

    const payload = Object.assign(bankAccount, {
      accountNumber: dto.accountNumber?.trim(),
    });

    await this.vendorBankAccountRepository.saveWithEncryptedAccountNumber(
      payload as VendorBankAccount & { accountNumber?: string },
    );

    const decryptedBankAccount = await this.vendorBankAccountRepository.findOneDecryptedBy({
      _id: accountObjectId,
      vendorId: vendor._id,
    });

    return this.serializeBankAccount(decryptedBankAccount!);
  }

  async listKycDocuments(userUuid: string) {
    const { vendor } = await this.getVendorContext(userUuid);
    const documents = await this.vendorKycDocumentRepository.findByVendorId(vendor._id);
    return documents.map((document) => this.serializeKycDocument(document));
  }

  async createKycDocument(
    userUuid: string,
    dto: CreateVendorKycDocumentDto,
    documentUrl?: string | null,
  ) {
    const { vendor } = await this.getVendorContext(userUuid);
    const resolvedDocumentUrl = documentUrl ?? dto.docUrl?.trim() ?? '';

    if (!resolvedDocumentUrl) {
      throw new BadRequestException('KYC document file or URL is required');
    }

    if (dto.gstin?.trim()) {
      const nextGstin = dto.gstin.trim().toUpperCase();
      await this.ensureUniqueGstin(nextGstin, vendor._id);
      vendor.gstin = nextGstin;
    }

    if (dto.panNumber?.trim()) {
      vendor.panNumber = dto.panNumber.trim().toUpperCase();
    }

    vendor.kycStatus = VendorKycStatus.SUBMITTED;

    const document = this.vendorKycDocumentRepository.create({
      vendorId: vendor._id,
      docType: dto.docType,
      docUrl: resolvedDocumentUrl,
      status: VendorKycDocumentStatus.PENDING,
      reviewedBy: null,
      reviewNote: null,
    });

    const [savedDocument] = await Promise.all([
      this.vendorKycDocumentRepository.save(document),
      this.vendorRepository.save(vendor),
    ]);

    return this.serializeKycDocument(savedDocument);
  }

  private async getVendorContext(userUuid: string) {
    const user = await this.userRepository.findActiveByUuid(userUuid);

    if (!user || user.role !== UserRole.VENDOR) {
      throw new NotFoundException(RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND);
    }

    const vendor = await this.vendorRepository.findByUserId(user._id);

    if (!vendor) {
      throw new NotFoundException(RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND);
    }

    return { user, vendor };
  }

  private async ensureUniqueGstin(gstin: string, currentVendorId: ObjectId) {
    const existingVendor = await this.vendorRepository.findOneBy({ gstin });

    if (existingVendor && objectIdToString(existingVendor._id) !== objectIdToString(currentVendorId)) {
      throw new ConflictException(RESPONSE_MESSAGES.VENDOR.GSTIN_ALREADY_EXISTS);
    }
  }

  private serializeVendor(vendor: Vendor) {
    return {
      id: objectIdToString(vendor._id)!,
      userId: objectIdToString(vendor.userId)!,
      businessName: vendor.businessName,
      businessSlug: vendor.businessSlug,
      description: vendor.description ?? null,
      logoUrl: vendor.logoUrl ?? null,
      bannerUrl: vendor.bannerUrl ?? null,
      status: vendor.status,
      commissionRate: vendor.commissionRate,
      gstin: vendor.gstin ?? null,
      panNumber: vendor.panNumber ?? null,
      kycStatus: vendor.kycStatus,
      bankAccountId: objectIdToString(vendor.bankAccountId) ?? null,
      totalRevenue: vendor.totalRevenue,
      rating: vendor.rating,
      totalOrders: vendor.totalOrders,
      createdAt: vendor.createdAt.toISOString(),
      updatedAt: vendor.updatedAt.toISOString(),
    };
  }

  private serializeBankAccount(
    bankAccount: VendorBankAccount & { accountNumber?: string },
  ) {
    return {
      id: objectIdToString(bankAccount._id)!,
      vendorId: objectIdToString(bankAccount.vendorId)!,
      accountHolderName: bankAccount.accountHolderName,
      accountNumber: bankAccount.accountNumber ?? '',
      ifscCode: bankAccount.ifscCode,
      bankName: bankAccount.bankName,
      branchName: bankAccount.branchName ?? null,
      isVerified: bankAccount.isVerified,
      createdAt: bankAccount.createdAt.toISOString(),
      updatedAt: bankAccount.updatedAt.toISOString(),
    };
  }

  private serializeKycDocument(document: VendorKycDocument) {
    return {
      id: objectIdToString(document._id)!,
      vendorId: objectIdToString(document.vendorId)!,
      docType: document.docType,
      docUrl: document.docUrl,
      status: document.status,
      reviewedBy: objectIdToString(document.reviewedBy) ?? null,
      reviewNote: document.reviewNote ?? null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }
}
