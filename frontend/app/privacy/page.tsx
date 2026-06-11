import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { shopContactEmail } from '@/lib/site';

export default function PrivacyPage() {
  return (
    <div className="page">
      <PageHeader
        title="Privacy Policy"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
      />
      <div className="content-prose">
        <p>
          We only store account and order data needed to run this demo shop. Guest checkout emails
          are saved with the order reference for fulfilment in this exam environment.
        </p>
        <p>
          To request deletion of your account and personal data, see our{' '}
          <Link href="/data-deletion">user data deletion instructions</Link> or email{' '}
          <a href={`mailto:${shopContactEmail}`}>{shopContactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
