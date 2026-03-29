import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VendorStatus } from '../../data/entities/vendor.entity';

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: VendorStatus, example: VendorStatus.APPROVED })
  @IsEnum(VendorStatus)
  status!: VendorStatus;
}
