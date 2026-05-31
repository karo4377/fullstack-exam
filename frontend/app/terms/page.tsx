import { PageHeader } from '@/components/page-header';

export default function TermsPage() {
  return (
    <div className="page">
      <PageHeader
        title="Terms of Service"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]}
      />
      <div className="content-prose">
        <p>
          This is a student exam project. Orders are simulated with no real payment processing.
          By placing an order you agree to use the shop for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
