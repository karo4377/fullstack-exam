import { PageHeader } from '@/components/page-header';

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
      </div>
    </div>
  );
}
