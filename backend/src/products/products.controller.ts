import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('collection') collection?: string,
  ) {
    return this.productsService.list(search, categoryId, collection);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
}
