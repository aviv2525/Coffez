import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsUrl, IsEnum, Min } from 'class-validator';

export class CreateProfileMediaDto {
  @ApiProperty({ enum: ['IMAGE', 'VIDEO'] })
  @IsEnum(['IMAGE', 'VIDEO'])
  type: 'IMAGE' | 'VIDEO';

  @ApiProperty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateProfileMediaDto {
  @ApiPropertyOptional({ enum: ['IMAGE', 'VIDEO'] })
  @IsOptional()
  @IsEnum(['IMAGE', 'VIDEO'])
  type?: 'IMAGE' | 'VIDEO';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
