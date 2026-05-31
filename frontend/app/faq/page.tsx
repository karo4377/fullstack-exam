import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

const faqs = [
  {
    q: 'Do you ship internationally?',
    a: 'Yes. EU delivery is included in our standard rates. Other countries see live shipping quotes at checkout.',
  },
  {
    q: 'How are prints packaged?',
    a: 'Flat prints ship in rigid mailers with corner protection. Framed-ready sizes use double-wall boxes.',
  },
  {
    q: 'Can I change or cancel an order?',
    a: 'Contact us within one hour of placing the order. Once dispatched, standard return rules apply.',
  },
  {
    q: 'Do I need an account to buy?',
    a: 'Yes — a free customer account lets you track orders and save your cart across devices.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'This demo shop simulates checkout after login. A production site would integrate card or wallet payments.',
  },
];

export default function FaqPage() {
  return (
    <div className="page">
      <PageHeader
        title="FAQ"
        subtitle="Quick answers before you order."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
      />
      <dl className="faq-list">
        {faqs.map((item) => (
          <div key={item.q} className="faq-item">
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
      <p className="content-prose" style={{ marginTop: '2rem' }}>
        Still stuck?{' '}
        <Link href="/contact" className="text-link">
          Contact us →
        </Link>
      </p>
    </div>
  );
}
