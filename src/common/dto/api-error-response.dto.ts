import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: '/api/v1/auth/login' })
  path!: string;

  @ApiProperty({ example: '2026-03-27T10:15:30.000Z' })
  timestamp!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['email must be an email', 'password must be longer than or equal to 8 characters'],
  })
  details?: string[];
}
