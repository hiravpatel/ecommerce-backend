import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VendorKycDocumentStatus,
  VendorKycDocumentType,
} from '../../data/entities/vendor.entity';

export class VendorKycDocumentDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2f11' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e99' })
  vendorId!: string;

  @ApiProperty({ enum: VendorKycDocumentType, example: VendorKycDocumentType.GSTIN })
  docType!: VendorKycDocumentType;

  @ApiProperty({ example: 'https://cdn.example.com/kyc/gstin.pdf' })
  docUrl!: string;

  @ApiProperty({
    enum: VendorKycDocumentStatus,
    example: VendorKycDocumentStatus.PENDING,
  })
  status!: VendorKycDocumentStatus;

  @ApiPropertyOptional({ nullable: true, example: '67e4f0f78a6ef35a3b4f2f55' })
  reviewedBy!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Document is under review' })
  reviewNote!: string | null;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  updatedAt!: string;
}
