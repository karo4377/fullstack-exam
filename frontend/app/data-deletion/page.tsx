import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { shopContactEmail, shopName } from '@/lib/site';

export default function DataDeletionPage() {
  return (
    <div className="page">
      <PageHeader
        title="User data deletion"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'User data deletion' },
        ]}
      />
      <div className="content-prose">
        <p>
          {shopName} lets you request deletion of personal data we hold about your account. This
          page explains how to do that for accounts created with email/password, Google, or
          Facebook login.
        </p>

        <h2>How to request deletion</h2>
        <ol>
          <li>
            Email us at{' '}
            <a href={`mailto:${shopContactEmail}`}>{shopContactEmail}</a> from the email address
            linked to your account (or the email on your Google/Facebook profile used to sign in).
          </li>
          <li>
            Use the subject line: <strong>Delete my account</strong>.
          </li>
          <li>
            We will confirm your request and delete your account within 30 days.
          </li>
        </ol>

        <h2>What we delete</h2>
        <ul>
          <li>Account profile (name, email, phone, delivery address)</li>
          <li>Linked sign-in providers (Google, Facebook)</li>
          <li>Saved favourites and cart</li>
          <li>Order history tied to your account</li>
        </ul>

        <h2>Facebook Login</h2>
        <p>
          If you signed in with Facebook, you can also remove the app from your Facebook account
          under <strong>Settings → Apps and Websites</strong>. To delete data stored on our servers,
          still email us at <a href={`mailto:${shopContactEmail}`}>{shopContactEmail}</a> as
          described above.
        </p>

        <p>
          See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
