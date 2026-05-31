export const shopName = 'ARTSHOP';
export const shopTagline = 'Nordic prints for kids\' rooms';

export type NavMenuGroup = {
  title: string;
  links: { label: string; href: string }[];
};

export const shopAllLink = { href: '/products', label: 'Shop all' } as const;

export const collectionsNavMenu: NavMenuGroup[] = [
  {
    title: 'By theme',
    links: [
      { label: 'Geometric Botanicals', href: '/products?search=botanical' },
      { label: 'Polish Folklore', href: '/products?search=folklore' },
      { label: 'Abstract', href: '/products?search=abstract' },
    ],
  },
  {
    title: 'By format',
    links: [
      { label: 'Framed Prints', href: '/products?search=framed' },
      { label: 'Canvas', href: '/products?search=canvas' },
      { label: 'Posters Only', href: '/products?search=poster' },
    ],
  },
  {
    title: 'Curated',
    links: [
      { label: 'Bestsellers', href: '/products?collection=bestsellers' },
      { label: 'New Arrivals', href: '/products?collection=new' },
    ],
  },
];

export const mainNav = [
  { href: '/about', label: 'About' },
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
