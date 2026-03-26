import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsUrl({}, { each: true })
  imageUrls: string[];
}
