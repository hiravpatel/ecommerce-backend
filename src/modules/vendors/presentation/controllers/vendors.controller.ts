import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { RESPONSE_MESSAGES } from 'src/common/constants/response-messages.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiStandardErrorResponse,
  ApiSuccessResponse,
} from 'src/common/swagger/api-response.decorator';
import { buildUploadUrl, createDiskStorage } from 'src/common/utils/file-upload.util';
import { UserRole } from 'src/modules/users/data/entities/user.entity';
import { VendorsService } from '../../infrastructure/services/vendors.service';
import { CreateVendorBankAccountDto } from '../dto/create-vendor-bank-account.dto';
import { CreateVendorKycDocumentDto } from '../dto/create-vendor-kyc-document.dto';
import { UpdateVendorBankAccountDto } from '../dto/update-vendor-bank-account.dto';
import { UpdateVendorProfileDto } from '../dto/update-vendor-profile.dto';
import { VendorBankAccountDto } from '../dto/vendor-bank-account.dto';
import { VendorKycDocumentDto } from '../dto/vendor-kyc-document.dto';
import { VendorProfileDto } from '../dto/vendor-profile.dto';

type UploadedFormFile = {
  filename: string;
};

@ApiTags('Vendor')
@ApiBearerAuth('bearer')
@Roles(UserRole.VENDOR)
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('me')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.PROFILE_FETCHED)
  @ApiOperation({ summary: 'Get the current vendor profile' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_FETCHED,
    type: VendorProfileDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2e99',
      userId: '67e4f0f78a6ef35a3b4f2e11',
      businessName: 'John Electronics Store',
      businessSlug: 'john-electronics-store',
      description: 'Multi-brand electronics seller',
      logoUrl: 'https://cdn.example.com/logo.png',
      bannerUrl: 'https://cdn.example.com/banner.png',
      status: 'pending',
      commissionRate: 10,
      gstin: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'pending',
      bankAccountId: null,
      totalRevenue: 0,
      rating: 0,
      totalOrders: 0,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T12:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.NOT_FOUND,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_NOT_FOUND,
    error: 'Not Found',
  })
  me(@CurrentUser('uuid') userUuid: string) {
    return this.vendorsService.getMyProfile(userUuid);
  }

  @Put('me')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      {
        storage: createDiskStorage('vendors/profile'),
      },
    ),
  )
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.PROFILE_UPDATED)
  @ApiOperation({ summary: 'Update the current vendor profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        businessName: { type: 'string', example: 'John Electronics World' },
        businessSlug: { type: 'string', example: 'john-electronics-world' },
        description: {
          type: 'string',
          example: 'Trusted seller for mobiles, laptops, and accessories',
        },
        logoUrl: { type: 'string', example: 'https://cdn.example.com/logo.png' },
        bannerUrl: { type: 'string', example: 'https://cdn.example.com/banner.png' },
        gstin: { type: 'string', example: '27ABCDE1234F1Z5' },
        panNumber: { type: 'string', example: 'ABCDE1234F' },
        logo: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.PROFILE_UPDATED,
    type: VendorProfileDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2e99',
      userId: '67e4f0f78a6ef35a3b4f2e11',
      businessName: 'John Electronics World',
      businessSlug: 'john-electronics-world',
      description: 'Trusted seller for mobiles, laptops, and accessories',
      logoUrl: 'https://cdn.example.com/logo.png',
      bannerUrl: 'https://cdn.example.com/banner.png',
      status: 'pending',
      commissionRate: 10,
      gstin: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'pending',
      bankAccountId: null,
      totalRevenue: 0,
      rating: 0,
      totalOrders: 0,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T13:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.CONFLICT,
    message: RESPONSE_MESSAGES.VENDOR.BUSINESS_SLUG_ALREADY_EXISTS,
    error: 'Conflict',
  })
  updateMe(
    @CurrentUser('uuid') userUuid: string,
    @Body() dto: UpdateVendorProfileDto,
    @UploadedFiles()
    files: {
      logo?: UploadedFormFile[];
      banner?: UploadedFormFile[];
    },
  ) {
    return this.vendorsService.updateMyProfileAssets(userUuid, dto, {
      logoUrl: files?.logo?.[0]
        ? buildUploadUrl('vendors/profile', files.logo[0].filename)
        : undefined,
      bannerUrl: files?.banner?.[0]
        ? buildUploadUrl('vendors/profile', files.banner[0].filename)
        : undefined,
    });
  }

  @Get('me/bank-accounts')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNTS_FETCHED)
  @ApiOperation({ summary: 'List the current vendor bank accounts' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNTS_FETCHED,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f2f00',
        vendorId: '67e4f0f78a6ef35a3b4f2e99',
        accountHolderName: 'John Doe',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Navrangpura',
        isVerified: false,
        createdAt: '2026-03-27T12:00:00.000Z',
        updatedAt: '2026-03-27T12:00:00.000Z',
      },
    ],
  })
  listBankAccounts(@CurrentUser('uuid') userUuid: string) {
    return this.vendorsService.listBankAccounts(userUuid);
  }

  @Post('me/bank-accounts')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_CREATED)
  @ApiOperation({ summary: 'Create a vendor bank account' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accountHolderName: { type: 'string', example: 'John Doe' },
        accountNumber: { type: 'string', example: '123456789012' },
        ifscCode: { type: 'string', example: 'HDFC0001234' },
        bankName: { type: 'string', example: 'HDFC Bank' },
        branchName: { type: 'string', example: 'Navrangpura' },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_CREATED,
    type: VendorBankAccountDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2f00',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      accountHolderName: 'John Doe',
      accountNumber: '123456789012',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branchName: 'Navrangpura',
      isVerified: false,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T12:00:00.000Z',
    },
  })
  createBankAccount(
    @CurrentUser('uuid') userUuid: string,
    @Body() dto: CreateVendorBankAccountDto,
  ) {
    return this.vendorsService.createBankAccount(userUuid, dto);
  }

  @Put('me/bank-accounts/:bankAccountId')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_UPDATED)
  @ApiOperation({ summary: 'Update a vendor bank account' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accountHolderName: { type: 'string', example: 'John Doe' },
        accountNumber: { type: 'string', example: '123456789012' },
        ifscCode: { type: 'string', example: 'HDFC0005678' },
        bankName: { type: 'string', example: 'HDFC Bank' },
        branchName: { type: 'string', example: 'Satellite' },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_UPDATED,
    type: VendorBankAccountDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2f00',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      accountHolderName: 'John Doe',
      accountNumber: '123456789012',
      ifscCode: 'HDFC0005678',
      bankName: 'HDFC Bank',
      branchName: 'Satellite',
      isVerified: false,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T13:00:00.000Z',
    },
  })
  @ApiStandardErrorResponse({
    status: HttpStatus.NOT_FOUND,
    message: RESPONSE_MESSAGES.VENDOR.BANK_ACCOUNT_NOT_FOUND,
    error: 'Not Found',
  })
  updateBankAccount(
    @CurrentUser('uuid') userUuid: string,
    @Param('bankAccountId') bankAccountId: string,
    @Body() dto: UpdateVendorBankAccountDto,
  ) {
    return this.vendorsService.updateBankAccount(userUuid, bankAccountId, dto);
  }

  @Get('me/kyc-documents')
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.KYC_DOCUMENTS_FETCHED)
  @ApiOperation({ summary: 'List vendor KYC documents' })
  @ApiSuccessResponse({
    status: HttpStatus.OK,
    message: RESPONSE_MESSAGES.VENDOR.KYC_DOCUMENTS_FETCHED,
    example: [
      {
        id: '67e4f0f78a6ef35a3b4f2f11',
        vendorId: '67e4f0f78a6ef35a3b4f2e99',
        docType: 'gstin',
        docUrl: 'https://cdn.example.com/kyc/gstin.pdf',
        status: 'pending',
        reviewedBy: null,
        reviewNote: null,
        createdAt: '2026-03-27T12:00:00.000Z',
        updatedAt: '2026-03-27T12:00:00.000Z',
      },
    ],
  })
  listKycDocuments(@CurrentUser('uuid') userUuid: string) {
    return this.vendorsService.listKycDocuments(userUuid);
  }

  @Post('me/kyc-documents')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: createDiskStorage('vendors/kyc'),
    }),
  )
  @ResponseMessage(RESPONSE_MESSAGES.VENDOR.KYC_DOCUMENT_CREATED)
  @ApiOperation({ summary: 'Create a vendor KYC document entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        docType: { type: 'string', example: 'gstin' },
        docUrl: { type: 'string', example: 'https://cdn.example.com/kyc/gstin.pdf' },
        gstin: { type: 'string', example: '27ABCDE1234F1Z5' },
        panNumber: { type: 'string', example: 'ABCDE1234F' },
        document: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiSuccessResponse({
    status: HttpStatus.CREATED,
    message: RESPONSE_MESSAGES.VENDOR.KYC_DOCUMENT_CREATED,
    type: VendorKycDocumentDto,
    example: {
      id: '67e4f0f78a6ef35a3b4f2f11',
      vendorId: '67e4f0f78a6ef35a3b4f2e99',
      docType: 'gstin',
      docUrl: 'https://cdn.example.com/kyc/gstin.pdf',
      status: 'pending',
      reviewedBy: null,
      reviewNote: null,
      createdAt: '2026-03-27T12:00:00.000Z',
      updatedAt: '2026-03-27T12:00:00.000Z',
    },
  })
  createKycDocument(
    @CurrentUser('uuid') userUuid: string,
    @Body() dto: CreateVendorKycDocumentDto,
    @UploadedFile() document?: UploadedFormFile,
  ) {
    return this.vendorsService.createKycDocument(
      userUuid,
      dto,
      document ? buildUploadUrl('vendors/kyc', document.filename) : undefined,
    );
  }
}
