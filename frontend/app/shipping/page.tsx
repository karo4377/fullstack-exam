import { PageHeader } from '@/components/page-header';
import { formatDkk, freeShippingThresholdDkk } from '@/lib/currency';

export default function ShippingPage() {
  return (
    <div className="page">
      <PageHeader
        title="Shipping & returns"
        subtitle="Delivery times, costs, and how to return an order."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shipping & returns' }]}
      />
      <div className="content-prose">
        <h2>Shipping</h2>
        <ul>
          <li>
            <strong>Denmark standard</strong> — 2–4 business days, {formatDkk(3700)} (free over{' '}
            {freeShippingThresholdDkk} kr.)
          </li>
          <li>
            <strong>Denmark express</strong> — 1–2 business days, {formatDkk(7500)}
          </li>
          <li>
            <strong>Non-EU</strong> — calculated at checkout; customs may apply
          </li>
        </ul>
        <p>
          Orders placed before 14:00 CET on weekdays are usually dispatched the same day. You receive
          a tracking link by email once the parcel is handed to the carrier.
        </p>
        <h2>Returns</h2>
        <p>
          You may return unused prints in original packaging within 14 days of delivery for a full
          refund. Original artwork is final sale unless damaged in transit.
        </p>
        <p>
          To start a return, email us at{' '}
          <a href="mailto:hello@artshop.local" className="text-link">
            hello@artshop.local
          </a>{' '}
          with your order number. We send a prepaid label for EU returns when applicable.
        </p>
        <h2>Damaged items</h2>
        <p>
          Photograph the packaging and artwork within 48 hours of delivery. We arrange a replacement
          or refund without asking you to ship fragile work back when possible.
        </p>
      </div>
    </div>
  );
}
