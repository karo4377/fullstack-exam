# Database documentation

## Technology

- **PostgreSQL** (server database — not SQLite)
- **Prisma ORM** for schema, migrations, and application access
- Raw SQL migration for exam objects: `prisma/migrations/20260326120000_db_objects/migration.sql`

## ER overview (main entities)

- **User** — customers and admins (`role`: `CUSTOMER` | `ADMIN`)
- **Product** — shop items with price, stock, category
- **ProductImage** — 1–4 images per product
- **Category** — Prints, Stickers, Originals
- **Cart / CartItem** — per-user shopping cart
- **Order / OrderItem** — checkout with price snapshots
- **Review** — one review per user per product
- **Artist** — optional profile linked to user (schema ready)

## Indexes and relations

Defined in `backend/prisma/schema.prisma`:

- Unique: `User.email`, `Product.slug`, `Category.slug`, `Review(productId, userId)`
- Foreign keys with `onDelete: Cascade` where appropriate (e.g. `ProductImage` → `Product`)
- Order placement uses a **transaction** in `OrdersService.createFromCart` (stock decrement + order rows + clear cart)

## Server-side objects (SQL)

Applied via migration `20260326120000_db_objects`:

| Object | Name | Purpose |
|--------|------|---------|
| View | `vw_product_ratings` | Average rating and review count per active product |
| View | `vw_customer_order_totals` | Order count and total spend per user |
| Function | `fn_product_stock(product_id)` | Returns current stock for a product |
| Trigger | `product_set_updated_at` | Sets `updatedAt` on `Product` UPDATE |
| Trigger | `order_set_updated_at` | Sets `updatedAt` on `Order` UPDATE |

### Example queries

```sql
SELECT * FROM vw_product_ratings ORDER BY avg_rating DESC NULLS LAST LIMIT 10;

SELECT * FROM vw_customer_order_totals WHERE order_count > 0;

SELECT fn_product_stock('your-product-cuid-here');
```

## Seed data

```bash
cd backend
npm run seed
```

Creates:

- **Admin:** `admin@artshop.local` / `admin123`
- **Customers:** `customer@artshop.local`, `emma@`, `noah@`, `sofia@`, `lucas@`, `maya@` `@artshop.local` — all password `customer123`
- **~40 products** across categories
- Sample **reviews**, **orders**, and **favourites** per customer

## Security (application level)

- Passwords hashed with **bcrypt**
- App connects with a single DB user via `DATABASE_URL`
- For stricter setups, create separate PostgreSQL roles (`app_user`, `admin_user`) in Neon and document in your report

## Migrations

```bash
npx prisma migrate dev    # local development
npx prisma migrate deploy   # production / Neon / Render
```
