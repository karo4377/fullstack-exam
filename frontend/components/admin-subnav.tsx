'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', match: 'dashboard' as const },
  { href: '/admin/products', label: 'Products', match: 'products' as const },
  { href: '/admin/products/new', label: 'Add product', match: 'add-product' as const },
  { href: '/admin/orders', label: 'Orders', match: 'orders' as const },
  { href: '/admin/users', label: 'Customers', match: 'customers' as const },
];

function isAdminLinkActive(pathname: string, match: (typeof ADMIN_LINKS)[number]['match']) {
  switch (match) {
    case 'dashboard':
      return pathname === '/admin';
    case 'products':
      return pathname === '/admin/products' || /^\/admin\/products\/[^/]+\/edit$/.test(pathname);
    case 'add-product':
      return pathname === '/admin/products/new';
    case 'orders':
      return pathname.startsWith('/admin/orders');
    case 'customers':
      return pathname.startsWith('/admin/users');
    default:
      return false;
  }
}

export function AdminSubnav() {
  const pathname = usePathname();

  return (
    <nav className="admin-subnav" aria-label="Owner area">
      <p className="admin-subnav-eyebrow">Owner area</p>
      <ul className="admin-subnav-list">
        {ADMIN_LINKS.map(({ href, label, match }) => (
          <li key={href}>
            <Link
              href={href}
              className={isAdminLinkActive(pathname, match) ? 'admin-subnav-link is-active' : 'admin-subnav-link'}
            >
              {label}
            </Link>
          </li>
        ))}
        <li className="admin-subnav-list-spacer" aria-hidden />
        <li>
          <Link href="/" className="admin-subnav-link admin-subnav-link--shop">
            Back to shop
          </Link>
        </li>
      </ul>
    </nav>
  );
}
