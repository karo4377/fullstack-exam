'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { NavMegaMenu } from '@/components/nav-mega-menu';
import { freeShippingThresholdDkk } from '@/lib/currency';
import {
  collectionsNavMenu,
  mainNav,
  shopAllLink,
  shopName,
  shopTagline,
} from '@/lib/site';
import { navLinkClass } from '@/lib/site-nav';

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminRoute = pathname.startsWith('/admin');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setCollectionsOpen(false);
    setCartOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      const id = window.requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [searchOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchOpen(false);
    closeMobile();
  };

  const toggleSearch = () => {
    setCartOpen(false);
    setMobileOpen(false);
    setSearchOpen((open) => !open);
  };

  if (isAdminRoute) {
    return (
      <header className="site-header site-header--admin">
        <div className="site-header-main">
          <Link href="/admin" className="site-brand">
            {shopName} <span className="site-brand-tag">Admin</span>
          </Link>
          <nav className="site-nav site-nav--admin" aria-label="Admin">
            <Link href="/" className="site-nav-link">
              View shop
            </Link>
          </nav>
          <div className="site-header-utilities">
            <span className="site-user-email">{user?.email}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
              Log out
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="site-header-banner">
        <p>
          Free shipping over {freeShippingThresholdDkk} kr. · {shopTagline}
        </p>
      </div>
      <div className="site-header-inner">
        <div className="site-header-main">
          <button
            type="button"
            className="site-header-menu-btn"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-nav"
            onClick={() => {
              setSearchOpen(false);
              setCartOpen(false);
              setMobileOpen((open) => !open);
            }}
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.75} />
            ) : (
              <Menu size={22} strokeWidth={1.75} />
            )}
          </button>

          <Link href="/" className="site-brand">
            {shopName}
          </Link>

          <nav className="site-nav site-nav--desktop" aria-label="Main">
            <Link
              href={shopAllLink.href}
              className={navLinkClass(pathname, shopAllLink.href, searchParams)}
            >
              {shopAllLink.label}
            </Link>
            <NavMegaMenu
              id="collections"
              label="Collections"
              groups={collectionsNavMenu}
              pathname={pathname}
            />
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(pathname, item.href, searchParams)}
              >
                {item.label}
              </Link>
            ))}
            {!loading && isAdmin && (
              <Link href="/admin" className="site-nav-link site-nav-link--owner">
                Owner dashboard
              </Link>
            )}
          </nav>

          <div className="site-header-utilities">
            <button
              type="button"
              className="site-header-icon-btn"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              aria-controls="site-header-search"
              onClick={toggleSearch}
            >
              {searchOpen ? (
                <X size={20} strokeWidth={1.75} />
              ) : (
                <Search size={20} strokeWidth={1.75} />
              )}
            </button>
            {!loading && (
              <Link
                href={user ? (isAdmin ? '/admin' : '/account') : '/login'}
                className="site-header-icon-btn"
                aria-label={user ? (isAdmin ? 'Owner dashboard' : 'Account') : 'Log in'}
                title={user?.email ?? 'Log in'}
              >
                <User size={20} strokeWidth={1.75} />
              </Link>
            )}
            {!loading && user && (
              <button
                type="button"
                className="btn btn-ghost btn-sm site-header-logout"
                onClick={() => logout()}
              >
                Log out
              </button>
            )}
            {!isAdmin && (
              <div className="site-header-cart-wrap">
                <button
                  id="cart-drawer-trigger"
                  type="button"
                  className="site-header-icon-btn site-header-cart"
                  aria-label="Open cart"
                  aria-expanded={cartOpen}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setSearchOpen(false);
                    setCartOpen((open) => !open);
                  }}
                >
                  <ShoppingBag size={20} strokeWidth={1.75} />
                  {itemCount > 0 && (
                    <span className="site-header-cart-badge" aria-hidden>
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>
                <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
              </div>
            )}
          </div>
        </div>

        <div
          id="site-header-search"
          className={`site-header-search-panel${searchOpen ? ' is-open' : ''}`}
          hidden={!searchOpen}
        >
          <form className="site-header-search-form" onSubmit={submitSearch}>
            <Search size={18} strokeWidth={1.75} aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search posters…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </div>

        <div
          id="site-mobile-nav"
          className={`site-header-mobile-panel${mobileOpen ? ' is-open' : ''}`}
          hidden={!mobileOpen}
        >
          <ul className="mobile-nav-list">
            <li>
              <Link href={shopAllLink.href} className="mobile-nav-link" onClick={closeMobile}>
                {shopAllLink.label}
              </Link>
            </li>
            <NavMegaMenu
              id="mobile-collections"
              label="Collections"
              groups={collectionsNavMenu}
              pathname={pathname}
              variant="mobile"
              mobileOpen={collectionsOpen}
              onMobileToggle={() => setCollectionsOpen((open) => !open)}
              onNavigate={closeMobile}
            />
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="mobile-nav-link" onClick={closeMobile}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="mobile-nav-link mobile-nav-link--button"
                onClick={() => {
                  closeMobile();
                  setSearchOpen(false);
                  setCartOpen(true);
                }}
              >
                Cart {itemCount > 0 ? `(${itemCount})` : ''}
              </button>
            </li>
            {!loading && !user && (
              <li>
                <Link href="/login" className="mobile-nav-link" onClick={closeMobile}>
                  Log in
                </Link>
              </li>
            )}
            {!loading && user && (
              <>
                <li>
                  <Link
                    href={isAdmin ? '/admin' : '/account'}
                    className="mobile-nav-link"
                    onClick={closeMobile}
                  >
                    {isAdmin ? 'Owner dashboard' : 'My account'}
                  </Link>
                </li>
                {!isAdmin && (
                  <li>
                    <Link href="/account/favorites" className="mobile-nav-link" onClick={closeMobile}>
                      Favourites
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    className="mobile-nav-link mobile-nav-link--button"
                    onClick={() => {
                      closeMobile();
                      logout();
                    }}
                  >
                    Log out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
