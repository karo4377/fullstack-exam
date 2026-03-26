import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [AuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

