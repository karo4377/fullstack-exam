'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2 } from 'lucide-react';
import {
  footerCustomerServiceLinks,
  footerLegalLinks,
  footerShopLinks,
  footerTrustPoints,
  shopName,
  shopTagline,
} from '@/lib/site';

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-trust">
        <div className="site-footer-trust-inner">
          <ul className="site-footer-trust-list">
            {footerTrustPoints.map((item) => (
              <li key={item.title}>
                <span className="site-footer-trust-label">{item.title}</span>
                <span className="site-footer-trust-detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="site-footer-main">
        <section className="site-footer-newsletter" aria-labelledby="footer-newsletter-title">
          <h2 id="footer-newsletter-title">Stay connected</h2>
          <p className="site-footer-newsletter-text">
            {shopTagline}. Get new drops and studio notes in your inbox.
          </p>
          <form
            className="site-footer-newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label className="visually-hidden" htmlFor="newsletter-email">
              Email for newsletter
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Subscribe
            </button>
          </form>
        </section>

        <nav className="site-footer-links" aria-label="Footer">
          <p className="site-footer-links-heading">Explore the shop</p>
          <div className="site-footer-links-grid">
            <div className="site-footer-col">
              <h3>Shop</h3>
              <ul>
                {footerShopLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer-col">
              <h3>Customer service</h3>
              <ul>
                {footerCustomerServiceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="site-footer-col">
              <h3>Legal &amp; info</h3>
              <ul>
                {footerLegalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
      <div className="site-footer-bottom">
        <div className="site-footer-brand-row">
          <Link href="/" className="site-footer-logo">
            {shopName}
          </Link>
          <div className="site-footer-social" aria-label="Social media">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Share2 size={20} strokeWidth={1.75} />
            </a>
          </div>
        </div>
        <p className="site-footer-copy">© {new Date().getFullYear()} {shopName}</p>
      </div>
    </footer>
  );
}
