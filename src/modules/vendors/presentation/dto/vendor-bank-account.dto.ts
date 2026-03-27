import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorBankAccountDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2f00' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e99' })
  vendorId!: string;

  @ApiProperty({ example: 'John Doe' })
  accountHolderName!: string;

  @ApiProperty({ example: '123456789012' })
  accountNumber!: string;

  @ApiProperty({ example: 'HDFC0001234' })
  ifscCode!: string;

  @ApiProperty({ example: 'HDFC Bank' })
  bankName!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Navrangpura' })
  branchName!: string | null;

  @ApiProperty({ example: false })
  isVerified!: boolean;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-27T12:00:00.000Z' })
  updatedAt!: string;
}
