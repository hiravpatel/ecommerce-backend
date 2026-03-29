import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttributeValueDto {
  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f4101' })
  id!: string;

  @ApiProperty({ example: '67e4f0f78a6ef35a3b4f4001' })
  attributeId!: string;

  @ApiProperty({ example: 'Black' })
  value!: string;

  @ApiPropertyOptional({ nullable: true, example: '#000000' })
  hexColor!: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}
