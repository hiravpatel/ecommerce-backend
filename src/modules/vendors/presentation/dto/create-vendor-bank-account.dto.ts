import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVendorBankAccountDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  accountHolderName!: string;

  @ApiProperty({ example: '123456789012' })
  @IsString()
  @MinLength(6)
  accountNumber!: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  ifscCode!: string;

  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  bankName!: string;

  @ApiPropertyOptional({ example: 'Navrangpura' })
  @IsOptional()
  @IsString()
  branchName?: string;
}
