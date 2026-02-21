import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class KeysDto {
  @ApiProperty()
  @IsString()
  p256dh: string;

  @ApiProperty()
  @IsString()
  auth: string;
}

class SubscriptionDto {
  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty({ type: KeysDto })
  @IsObject()
  @ValidateNested()
  @Type(() => KeysDto)
  keys: KeysDto;
}

export class SubscribeDto {
  @ApiProperty({ type: SubscriptionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SubscriptionDto)
  subscription: SubscriptionDto;
}

export class UnsubscribeDto {
  @ApiProperty()
  @IsString()
  endpoint: string;
}
