import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class GuestCheckoutItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class GuestCheckoutDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GuestCheckoutItemDto)
  items!: GuestCheckoutItemDto[];
}
