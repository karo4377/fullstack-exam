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

/** Apply Cloudinary auto-format/quality when serving stored CDN URLs. */
function optimizeCloudinaryUrl(url: string): string {
  if (!url.includes('res.cloudinary.com') || url.includes('/f_auto') || url.includes('/q_auto')) {
    return url;
  }
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

export function resolveProductImageSrc(url?: string | null): string | undefined {
  if (isDemoPlaceholderImage(url)) return undefined;
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return optimizeCloudinaryUrl(trimmed);
}
