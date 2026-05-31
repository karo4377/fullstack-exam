#!/bin/sh
set -e
echo "Running database migrations..."
npx prisma migrate deploy
echo "Seeding database (safe to re-run)..."
npm run seed || true
echo "Starting API..."
exec node dist/main.js
