-- Order.userId must be optional for guest checkout (schema already has String?).
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;
