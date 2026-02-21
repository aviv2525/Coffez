import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class CreateSellerProfileDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  locationText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;
}

export class UpdateSellerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  locationText?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;
}
