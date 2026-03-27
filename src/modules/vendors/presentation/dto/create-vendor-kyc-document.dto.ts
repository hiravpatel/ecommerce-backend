import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VendorKycDocumentType } from '../../data/entities/vendor.entity';

export class CreateVendorKycDocumentDto {
  @ApiProperty({ enum: VendorKycDocumentType, example: VendorKycDocumentType.GSTIN })
  @IsEnum(VendorKycDocumentType)
  docType!: VendorKycDocumentType;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/kyc/gstin.pdf' })
  @IsOptional()
  @IsString()
  docUrl?: string;

  @ApiPropertyOptional({ example: '27ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  panNumber?: string;
}
