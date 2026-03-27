import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorKycStatus, VendorStatus } from '../../data/entities/vendor.entity';

export class VendorProfileDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e99' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e11' })
  userId!: string;

  @ApiProperty({ example: 'John Electronics Store' })
  businessName!: string;

  @ApiProperty({ example: 'john-electronics-store' })
  businessSlug!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Multi-brand electronics seller' })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'https://cdn.example.com/logo.png' })
  logoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'https://cdn.example.com/banner.png' })
  bannerUrl!: string | null;

  @ApiProperty({ enum: VendorStatus, example: VendorStatus.PENDING })
  status!: VendorStatus;

  @ApiProperty({ example: 10 })
  commissionRate!: number;

  @ApiPropertyOptional({ nullable: true, example: '27ABCDE1234F1Z5' })
  gstin!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ABCDE1234F' })
  panNumber!: string | null;

  @ApiProperty({ enum: VendorKycStatus, example: VendorKycStatus.PENDING })
  kycStatus!: VendorKycStatus;

  @ApiPropertyOptional({ nullable: true, example: '67e4f0f78a6ef35a3b4f2f00' })
  bankAccountId!: string | null;

  @ApiProperty({ example: 0 })
  totalRevenue!: number;

  @ApiProperty({ example: 0 })
  rating!: number;

  @ApiProperty({ example: 0 })
  totalOrders!: number;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  updatedAt!: string;
}
