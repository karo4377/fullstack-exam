const DEMO_IMAGE_HOSTS = ['placehold.co', 'via.placeholder.com', 'dummyimage.com', 'placekitten.com'];

/** True when we should show the grey Lucide placeholder instead of an <img>. */
export function isDemoPlaceholderImage(url?: string | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return true;

  if (trimmed.startsWith('/uploads/')) return false;

  try {
    const { hostname } = new URL(trimmed, 'http://localhost');
    return DEMO_IMAGE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return !trimmed.startsWith('/');
  }
}

export function resolveProductImageSrc(url?: string | null): string | undefined {
  if (isDemoPlaceholderImage(url)) return undefined;
  return url?.trim() || undefined;
}
