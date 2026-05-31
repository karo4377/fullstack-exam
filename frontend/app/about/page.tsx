import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function AboutPage() {
  return (
    <div className="page">
      <PageHeader
        title="About us"
        subtitle="ARTSHOP is a small online gallery focused on accessible art for everyday spaces."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />
      <div className="content-prose">
        <p>
          We work directly with emerging illustrators and painters to offer limited prints and
          originals at fair prices. Every piece is photographed in-house and packed by hand before it
          leaves our studio.
        </p>
        <h2>What we sell</h2>
        <ul>
          <li>Open-edition giclée prints on archival paper</li>
          <li>Small-run screen prints and risographs</li>
          <li>Original works when available — always one of a kind</li>
        </ul>
        <h2>Our promise</h2>
        <p>
          Clear pricing, honest stock levels, and straightforward shipping. If something arrives
          damaged, we replace it or refund you — no lengthy forms.
        </p>
        <p>
          <Link href="/products" className="text-link">
            Browse the collection →
          </Link>
        </p>
      </div>
    </div>
  );
}
