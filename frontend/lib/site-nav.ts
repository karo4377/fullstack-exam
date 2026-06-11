export function navLinkClass(pathname: string, href: string, _searchParams?: URLSearchParams) {
  if (href === '/admin') {
    return pathname.startsWith('/admin') ? 'site-nav-link is-active' : 'site-nav-link';
  }
  if (href === '/products') {
    return pathname === '/products' ? 'site-nav-link is-active' : 'site-nav-link';
  }
  const active =
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return active ? 'site-nav-link is-active' : 'site-nav-link';
}
