import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VendorStatus } from '../../data/entities/vendor.entity';

export class VendorListQueryDto {
  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: VendorStatus, example: VendorStatus.PENDING })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;
}
