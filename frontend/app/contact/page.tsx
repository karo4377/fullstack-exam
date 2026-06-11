'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, Clock, HelpCircle, Mail, MapPin, Package, Truck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { shopContactEmail, shopName } from '@/lib/site';

const QUICK_LINKS = [
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/shipping', label: 'Shipping & returns', icon: Package },
  { href: '/track-order', label: 'Track an order', icon: Truck },
] as const;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="page page--contact">
      <PageHeader
        title="Get in touch"
        subtitle="Questions about orders, prints, or wholesale."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <div className="contact-layout">
        <aside className="contact-sidebar" aria-label="Contact information">
          <ul className="contact-cards">
            <li className="contact-card">
              <span className="contact-card-icon" aria-hidden>
                <Mail size={20} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="contact-card-title">Email</h2>
                <p className="contact-card-text">
                  <a href={`mailto:${shopContactEmail}`} className="text-link">
                    {shopContactEmail}
                  </a>
                </p>
              </div>
            </li>
            <li className="contact-card">
              <span className="contact-card-icon" aria-hidden>
                <MapPin size={20} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="contact-card-title">Studio</h2>
                <p className="contact-card-text">
                  {shopName}
                  <br />
                  Example Street 12
                  <br />
                  1000 Copenhagen, Denmark
                </p>
              </div>
            </li>
            <li className="contact-card">
              <span className="contact-card-icon" aria-hidden>
                <Clock size={20} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="contact-card-title">Response time</h2>
                <p className="contact-card-text">We reply within one business day, Monday–Friday.</p>
              </div>
            </li>
          </ul>

          <nav className="contact-quick-links" aria-label="Helpful links">
            <p className="contact-quick-links-label">Before you write</p>
            <ul>
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="contact-quick-link">
                    <Icon size={16} strokeWidth={1.5} aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="contact-tip">
            Order issues? Include your order ID from{' '}
            <Link href="/account/orders" className="text-link">
              order history
            </Link>{' '}
            so we can help faster.
          </p>
        </aside>

        <div className="contact-form-panel">
          {sent ? (
            <div className="contact-success" role="status">
              <span className="contact-success-icon" aria-hidden>
                <CircleCheck size={32} strokeWidth={1.5} />
              </span>
              <h2>Message sent</h2>
              <p>
                Thanks, {name || 'friend'}. This demo does not send email — in production your
                message would reach our team at {shopContactEmail}.
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <>
              <header className="contact-form-header">
                <h2>Send a message</h2>
                <p>Tell us what you need — no account required.</p>
              </header>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Name</label>
                    <input
                      id="contact-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary contact-form-submit">
                  Send message
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
