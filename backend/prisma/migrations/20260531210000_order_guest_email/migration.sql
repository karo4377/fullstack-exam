-- Order.guestEmail was in schema but missing from earlier migrations.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
