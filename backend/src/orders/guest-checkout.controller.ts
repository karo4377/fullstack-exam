import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GuestCheckoutDto } from './dto/guest-checkout.dto';

@Controller('checkout')
export class GuestCheckoutController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('guest')
  createGuest(@Body() dto: GuestCheckoutDto) {
    return this.ordersService.createGuestOrder(dto.email, dto.items);
  }
}
