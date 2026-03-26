import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Req() req: Request) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.ordersService.listForUser(user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.ordersService.findOne(id, user.id);
  }

  @Post()
  create(@Req() req: Request) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.ordersService.createFromCart(user.id);
  }
}
