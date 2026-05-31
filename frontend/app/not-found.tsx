import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h1 className="title-page">Page not found</h1>
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
        The page you are looking for does not exist.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
