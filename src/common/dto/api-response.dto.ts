import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<TData = unknown> {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Request completed successfully' })
  message!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: null,
  })
  data!: TData | null;
}
