export const shopName = 'Tiny Frames';
export const shopLogoSrc = '/elephant.svg';
export const shopFaviconSrc = '/elephant.png';
export const shopTagline = 'Nordic prints for kids\' rooms';
export const shopHeroTitle = 'Art for little walls';
export const shopHeroIllustrationSrc = '/elephant-illustration-transparent.png';
export const shopContactEmail = 'hello@tinyframes.local';

export const shopAllLink = { href: '/products', label: 'Shop all' } as const;

export const mainNav = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact us' },
] as const;

export const footerShopLinks = [
  { href: '/products', label: 'All Posters' },
  { href: '/gift-cards', label: 'Gift Cards' },
  { href: '/products?collection=bestsellers', label: 'Bestsellers' },
] as const;

export const footerCustomerServiceLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/shipping', label: 'Shipping & Returns' },
  { href: '/faq', label: 'FAQ' },
  { href: '/track-order', label: 'Track Order' },
] as const;

export const footerLegalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/data-deletion', label: 'User data deletion' },
  { href: '/study', label: 'Exam study guide' },
] as const;

export const footerTrustPoints = [
  { title: 'DK shipping', detail: 'Free over 375 kr.' },
  { title: '14-day returns', detail: 'On prints' },
  { title: 'Secure checkout', detail: 'Protected orders' },
  { title: 'Hand packed', detail: 'From our studio' },
] as const;

export const registeredPerksNote =
  'Registered members get free shipping on orders over 150 DKK and can view order history anytime.';
