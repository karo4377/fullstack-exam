'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

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
    <div className="page">
      <PageHeader
        title="Contact"
        subtitle="Questions about an order, a piece, or wholesale? Send us a message."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <div className="contact-layout">
        <div className="content-prose contact-info">
          <h2>Studio</h2>
          <p>
            ARTSHOP
            <br />
            Example Street 12
            <br />
            1000 Copenhagen, Denmark
          </p>
          <p>
            <a href="mailto:hello@artshop.local" className="text-link">
              hello@artshop.local
            </a>
          </p>
          <p>We reply within one business day.</p>
          <p>
            Order issues? Include your order ID from{' '}
            <Link href="/account/orders" className="text-link">
              order history
            </Link>
            .
          </p>
        </div>
        <div className="contact-form-panel">
          {sent ? (
            <div className="contact-success">
              <h2>Message sent</h2>
              <p>
                Thanks, {name || 'friend'}. This demo does not send email — in production your message
                would reach our team at hello@artshop.local.
              </p>
              <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
