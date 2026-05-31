'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { admin as adminApi } from '@/lib/api';
import { formatDkk } from '@/lib/currency';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats(),
    staleTime: 60_000,
  });

  return (
    <>
      <h1 className="title-page">Shop owner dashboard</h1>
      <p className="subtitle">Overview of ARTSHOP — products, customers, and orders.</p>

      {isLoading && <p className="muted-text">Loading stats…</p>}
      {error && <p className="form-error">Could not load dashboard stats.</p>}

      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Active products</span>
            <strong className="admin-stat-value">{stats.productCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Customers</span>
            <strong className="admin-stat-value">{stats.customerCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Orders</span>
            <strong className="admin-stat-value">{stats.orderCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Reviews</span>
            <strong className="admin-stat-value">{stats.reviewCount}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Revenue (paid/shipped)</span>
            <strong className="admin-stat-value">{formatDkk(stats.revenueCents)}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Pending orders</span>
            <strong className="admin-stat-value">{stats.pendingOrders}</strong>
          </div>
        </div>
      )}

      <h2 className="admin-section-title">Manage</h2>
      <div className="admin-dashboard-links">
        <Link href="/admin/products" className="card card-link admin-dash-link">
          <strong>Products</strong>
          <span>View, add, and edit catalogue items</span>
        </Link>
        <Link href="/admin/orders" className="card card-link admin-dash-link">
          <strong>Orders</strong>
          <span>Review customer and guest checkout orders</span>
        </Link>
        <Link href="/admin/users" className="card card-link admin-dash-link">
          <strong>Customers</strong>
          <span>Registered accounts and access</span>
        </Link>
        <Link href="/" className="card card-link admin-dash-link">
          <strong>View storefront</strong>
          <span>Open the public shop</span>
        </Link>
      </div>
    </>
  );
}
