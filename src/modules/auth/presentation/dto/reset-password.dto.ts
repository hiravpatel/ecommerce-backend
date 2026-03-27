import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.8f14e45fceea167a5a36dedd4bea2543',
  })
  @IsString()
  token!: string;

  @ApiProperty({ minLength: 8, example: 'NewStrongPass@123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
