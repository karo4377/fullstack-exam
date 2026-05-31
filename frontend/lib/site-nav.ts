import { collectionsNavMenu } from '@/lib/site';

const collectionMenuHrefs = collectionsNavMenu.flatMap((group) =>
  group.links.map((link) => link.href),
);

/** Stable query string for comparing /products URLs (sorted keys). */
function productsQueryKey(searchParams: URLSearchParams): string {
  return [...searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

function hrefQueryKey(href: string): string {
  const query = href.includes('?') ? href.split('?')[1] : '';
  return productsQueryKey(new URLSearchParams(query));
}

/** Collections nav is active only on /products with a filter from the collections menu. */
export function isCollectionsNavActive(pathname: string, searchParams: URLSearchParams): boolean {
  if (pathname !== '/products') return false;
  const currentKey = productsQueryKey(searchParams);
  if (!currentKey) return false;
  return collectionMenuHrefs.some((href) => hrefQueryKey(href) === currentKey);
}

/** Shop all is active on /products unless a collections-menu filter is applied. */
export function isShopAllNavActive(pathname: string, searchParams: URLSearchParams): boolean {
  if (pathname !== '/products') return false;
  return !isCollectionsNavActive(pathname, searchParams);
}

export function navLinkClass(pathname: string, href: string, searchParams?: URLSearchParams) {
  if (href === '/products' && searchParams) {
    return isShopAllNavActive(pathname, searchParams)
      ? 'site-nav-link is-active'
      : 'site-nav-link';
  }
  const active =
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return active ? 'site-nav-link is-active' : 'site-nav-link';
}
