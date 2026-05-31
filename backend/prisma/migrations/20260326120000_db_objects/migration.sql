-- Exam deliverable: database views, functions, and triggers (PostgreSQL).

-- View: product average ratings and review counts
CREATE OR REPLACE VIEW vw_product_ratings AS
SELECT
  p.id AS product_id,
  p.title,
  p.slug,
  ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
  COUNT(r.id)::int AS review_count
FROM "Product" p
LEFT JOIN "Review" r ON r."productId" = p.id
WHERE p."isActive" = true
GROUP BY p.id, p.title, p.slug;

-- View: order summary per customer
CREATE OR REPLACE VIEW vw_customer_order_totals AS
SELECT
  u.id AS user_id,
  u.email,
  COUNT(o.id)::int AS order_count,
  COALESCE(SUM(o."totalCents"), 0)::int AS total_spent_cents
FROM "User" u
LEFT JOIN "Order" o ON o."userId" = u.id
GROUP BY u.id, u.email;

-- Function: stock check before order (used for validation / reporting)
CREATE OR REPLACE FUNCTION fn_product_stock(p_product_id text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT stock FROM "Product" WHERE id = p_product_id;
$$;

-- Trigger: keep Product.updatedAt in sync on UPDATE
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_set_updated_at ON "Product";
CREATE TRIGGER product_set_updated_at
  BEFORE UPDATE ON "Product"
  FOR EACH ROW
  EXECUTE PROCEDURE trg_set_updated_at();

DROP TRIGGER IF EXISTS order_set_updated_at ON "Order";
CREATE TRIGGER order_set_updated_at
  BEFORE UPDATE ON "Order"
  FOR EACH ROW
  EXECUTE PROCEDURE trg_set_updated_at();
