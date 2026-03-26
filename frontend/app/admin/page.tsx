'use client';

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="title-page">Admin dashboard</h1>
      <p className="subtitle">Manage your shop from here.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <Link href="/admin/products" className="card card-link" style={{ padding: '1rem 1.25rem' }}>
          <strong>Products</strong> – View, add, and edit products
        </Link>
        <Link href="/admin/users" className="card card-link" style={{ padding: '1rem 1.25rem' }}>
          <strong>Users</strong> – View registered users
        </Link>
        <Link href="/admin/orders" className="card card-link" style={{ padding: '1rem 1.25rem' }}>
          <strong>Orders</strong> – View all orders
        </Link>
      </div>
    </>
  );
}
