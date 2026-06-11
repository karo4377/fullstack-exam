'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Client-only search params — avoids Suspense fallback hiding the site header. */
export function useClientSearchParams(): URLSearchParams {
  const pathname = usePathname();
  const [params, setParams] = useState(
    () =>
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(),
  );

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  return params;
}
