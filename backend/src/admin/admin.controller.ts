import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/jpg'];
function imageFileFilter(
  _req: Request,
  file: { mimetype: string },
  cb: (err: Error | null, accept: boolean) => void,
) {
  if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException('Only PNG and JPG images are allowed'), false);
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @Req() req: Request,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string } | undefined,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    if (this.cloudinaryService.isConfigured()) {
      const { url } = await this.cloudinaryService.uploadProductImage(file.buffer, file.mimetype);
      return { url };
    }

    // Fallback when Cloudinary env vars are missing (local dev without CDN)
    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const dest = join(process.cwd(), 'uploads');
    mkdirSync(dest, { recursive: true });
    writeFileSync(join(dest, name), file.buffer);
    const base = `${req.protocol}://${req.get('host')}`;
    return { url: `${base}/uploads/${name}` };
  }

  @Get('users')
  listUsers(@Req() req: Request) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.usersService.listAll(user.id);
  }

  @Patch('users/:id')
  updateUser(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const adminId = (req as Request & { user: { id: string } }).user.id;
    if (id === adminId) {
      throw new BadRequestException('You cannot deactivate yourself');
    }
    return this.usersService.updateActive(id, dto.isActive);
  }

  @Get('products')
  listProducts() {
    return this.productsService.listAllForAdmin();
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.productsService.findByIdForAdmin(id);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create({
      title: dto.title,
      slug: dto.slug,
      description: dto.description,
      priceCents: dto.priceCents,
      stock: dto.stock,
      categoryId: dto.categoryId,
      imageUrls: dto.imageUrls,
    });
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  async deleteOrDeactivateProduct(@Param('id') id: string, @Query('permanent') permanent?: string) {
    if (permanent === 'true') {
      await this.productsService.deletePermanent(id);
      return;
    }
    return this.productsService.remove(id);
  }

  @Get('orders')
  listOrders() {
    return this.ordersService.listAllForAdmin();
  }

  @Get('stats')
  async stats() {
    const [productCount, customerCount, orderCount, revenue, reviewCount, pendingOrders] =
      await Promise.all([
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { totalCents: true },
          where: { status: { in: ['PAID', 'SHIPPED'] } },
        }),
        this.prisma.review.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
      ]);
    return {
      productCount,
      customerCount,
      orderCount,
      reviewCount,
      pendingOrders,
      revenueCents: revenue._sum.totalCents ?? 0,
    };
  }

  @Get('categories')
  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }
}
