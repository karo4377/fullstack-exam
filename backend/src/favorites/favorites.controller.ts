import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private userId(req: Request) {
    return (req as Request & { user: { id: string } }).user.id;
  }

  @Get()
  list(@Req() req: Request) {
    return this.favoritesService.listForUser(this.userId(req));
  }

  @Get('ids')
  listIds(@Req() req: Request) {
    return this.favoritesService.listProductIdsForUser(this.userId(req));
  }

  @Post(':productId')
  add(@Req() req: Request, @Param('productId') productId: string) {
    return this.favoritesService.add(this.userId(req), productId);
  }

  @Delete(':productId')
  remove(@Req() req: Request, @Param('productId') productId: string) {
    return this.favoritesService.remove(this.userId(req), productId);
  }
}
