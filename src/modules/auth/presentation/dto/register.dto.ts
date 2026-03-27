import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/modules/users/data/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'vendor@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ minLength: 8, example: 'StrongPass@123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.CUSTOMER,
    example: UserRole.VENDOR,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Required when role is vendor',
    example: 'John Electronics Store',
  })
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.VENDOR)
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'john-electronics-store' })
  @IsOptional()
  @IsString()
  businessSlug?: string;
}
