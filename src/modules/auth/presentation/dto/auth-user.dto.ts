import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/modules/users/data/entities/user.entity';

export class AuthUserDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f2e11' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiPropertyOptional({ nullable: true, example: '+919876543210' })
  phone!: string | null;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isEmailVerified!: boolean;

  @ApiProperty({ example: false })
  isPhoneVerified!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    format: 'date-time',
    example: '2026-03-27T09:30:00.000Z',
  })
  lastLoginAt!: string | null;
}
