import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  sellerId: string;

  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledFor?: string | null;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'] })
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'])
  status: string;
}
