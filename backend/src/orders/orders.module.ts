import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { GuestCheckoutController } from './guest-checkout.controller';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, GuestCheckoutController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

