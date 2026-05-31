import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function TrackOrderPage() {
  return (
    <div className="page">
      <PageHeader
        title="Track order"
        subtitle="Look up delivery status for your purchase."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Track order' }]}
      />
      <div className="content-prose">
        <p>
          Registered customers can view all orders in{' '}
          <Link href="/account/orders" className="text-link">
            order history
          </Link>
          . Guest orders receive a reference number on the confirmation screen — save it to contact
          support.
        </p>
        <p>
          Questions? <Link href="/contact" className="text-link">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
