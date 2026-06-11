'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSubnav } from '@/components/admin-subnav';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/context/auth-context';
import { shopName } from '@/lib/site';

function getAdminPageMeta(pathname: string) {
  if (pathname === '/admin') {
    return {
      title: 'Dashboard',
      subtitle: 'Overview of products, customers, and orders.',
    };
  }
  if (pathname === '/admin/products') {
    return {
      title: 'Products',
      subtitle: 'View, add, and edit catalogue items.',
    };
  }
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit product',
      subtitle: 'Update listing details and inventory.',
    };
  }
  if (pathname === '/admin/products/new') {
    return {
      title: 'Add product',
      subtitle: 'Create a new listing for the shop.',
    };
  }
  if (pathname.startsWith('/admin/orders')) {
    return {
      title: 'Orders',
      subtitle: 'All orders across the shop.',
    };
  }
  if (pathname.startsWith('/admin/users')) {
    return {
      title: 'Customers',
      subtitle: 'Registered accounts and access.',
    };
  }
  return {
    title: 'Owner area',
    subtitle: `Manage your ${shopName}.`,
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();
  const pageMeta = getAdminPageMeta(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="page page--admin">
        <p className="muted-text">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page page--admin">
      <PageHeader
        title={pageMeta.title}
        subtitle={pageMeta.subtitle}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Owner area', href: '/admin' },
          ...(pathname !== '/admin' ? [{ label: pageMeta.title }] : []),
        ]}
        actions={
          <Link href="/" className="btn btn-secondary btn-sm">
            View storefront
          </Link>
        }
      />
      <AdminSubnav />
      <div className="admin-content">{children}</div>
    </div>
  );
}
