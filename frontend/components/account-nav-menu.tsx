'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { userFirstName } from '@/lib/user-display';

const CUSTOMER_LINKS = [
  { href: '/account', label: 'Account overview', match: (path: string) => path === '/account' },
  { href: '/account/profile', label: 'Profile & delivery', match: (path: string) => path.startsWith('/account/profile') },
  { href: '/account/favorites', label: 'Favourites', match: (path: string) => path.startsWith('/account/favorites') },
  { href: '/account/orders', label: 'Order history', match: (path: string) => path.startsWith('/account/orders') },
] as const;

const ADMIN_LINKS = [
  { href: '/admin', label: 'Owner dashboard', match: (path: string) => path === '/admin' },
  { href: '/admin/products', label: 'Manage products', match: (path: string) => path.startsWith('/admin/products') },
  { href: '/admin/orders', label: 'Manage orders', match: (path: string) => path.startsWith('/admin/orders') },
  { href: '/admin/users', label: 'Customers', match: (path: string) => path.startsWith('/admin/users') },
] as const;

type AccountNavMenuProps = {
  variant?: 'desktop' | 'mobile';
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  onNavigate?: () => void;
};

export function AccountNavMenu({
  variant = 'desktop',
  mobileOpen = false,
  onMobileToggle,
  onNavigate,
}: AccountNavMenuProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const firstName = userFirstName(user);
  const isAdmin = user.role === 'ADMIN';
  const links = isAdmin ? ADMIN_LINKS : CUSTOMER_LINKS;

  const handleLogout = () => {
    onNavigate?.();
    void logout();
  };

  if (variant === 'mobile') {
    return (
      <li className="mobile-nav-accordion">
        <button
          type="button"
          className="mobile-nav-accordion-trigger"
          aria-expanded={mobileOpen}
          aria-controls="account-nav-mobile-panel"
          onClick={onMobileToggle}
        >
          Hi, {firstName}!
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            className={`mobile-nav-chevron-icon${mobileOpen ? ' is-open' : ''}`}
            aria-hidden
          />
        </button>
        {mobileOpen && (
          <div id="account-nav-mobile-panel" className="mobile-nav-accordion-panel">
            <ul className="mobile-nav-sublist">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="mobile-nav-sublink" onClick={onNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" className="mobile-nav-sublink mobile-nav-sublink--button" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="account-nav nav-dropdown">
      <button
        type="button"
        className="account-nav-trigger"
        aria-haspopup="menu"
        aria-label={`Account menu for ${firstName}`}
      >
        <User size={18} strokeWidth={1.75} aria-hidden />
        <span className="account-nav-greeting">Hi, {firstName}!</span>
        <ChevronDown size={16} strokeWidth={1.75} className="nav-dropdown-chevron" aria-hidden />
      </button>
      <div className="account-nav-panel nav-dropdown-panel" role="menu">
        <ul className="account-nav-list">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                role="menuitem"
                className={link.match(pathname) ? 'is-active' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="account-nav-divider" aria-hidden />
          <li>
            <button type="button" className="account-nav-logout" role="menuitem" onClick={handleLogout}>
              Log out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
