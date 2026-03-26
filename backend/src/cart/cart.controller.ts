import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.cartService.getOrCreateCart(user.id);
  }

  @Post('items')
  addItem(@Req() req: Request, @Body() dto: AddCartItemDto) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.cartService.addItem(user.id, dto.productId, dto.quantity ?? 1);
  }

  @Patch('items/:id')
  updateItem(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.cartService.updateItem(user.id, id, dto.quantity);
  }

  @Delete('items/:id')
  removeItem(@Req() req: Request, @Param('id') id: string) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.cartService.removeItem(user.id, id);
  }
}
