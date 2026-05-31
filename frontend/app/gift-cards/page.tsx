import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function GiftCardsPage() {
  return (
    <div className="page">
      <PageHeader
        title="Gift cards"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Gift cards' }]}
      />
      <div className="content-prose">
        <p>Gift cards are coming soon. In the meantime, browse our poster collection.</p>
        <p>
          <Link href="/products" className="text-link">
            Shop all posters →
          </Link>
        </p>
      </div>
    </div>
  );
}
