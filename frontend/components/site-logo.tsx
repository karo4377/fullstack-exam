import Image from 'next/image';
import { shopLogoSrc, shopName } from '@/lib/site';

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
};

export function SiteLogo({ className, priority }: SiteLogoProps) {
  return (
    <Image
      src={shopLogoSrc}
      alt={shopName}
      width={1147}
      height={861}
      className={className}
      priority={priority}
    />
  );
}
