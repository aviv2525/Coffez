import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreatePosIntegrationDto {
  @ApiProperty({ example: 'beecomm', description: 'POS provider identifier' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'https://api.beecomm.co.il/orders' })
  @IsUrl()
  apiUrl: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiPropertyOptional({ description: 'Extra provider-specific config (JSON)' })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class UpdatePosIntegrationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  apiUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class CreateMenuItemMappingDto {
  @ApiProperty({ description: 'Our menuItem ID' })
  @IsString()
  menuItemId: string;

  @ApiProperty({ description: 'ID of this item in the POS system' })
  @IsString()
  externalId: string;

  @ApiPropertyOptional({ description: 'Price in POS system (may differ from ours)' })
  @IsOptional()
  externalPrice?: number;
}
