import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${siteUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${siteUrl}/study`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${siteUrl}/account`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${siteUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
];

async function fetchProductRoutes(): Promise<MetadataRoute.Sitemap> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${apiUrl}/products`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const products = (await res.json()) as Array<{ id: string; updatedAt?: string }>;
    if (!Array.isArray(products)) return [];
    return products.map((p) => ({
      url: `${siteUrl}/products/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productRoutes = await fetchProductRoutes();
  return [...STATIC_ROUTES, ...productRoutes];
}
