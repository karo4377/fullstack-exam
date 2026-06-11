import Link from 'next/link';
import { Frame, HandHeart, Leaf, Package } from 'lucide-react';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { PageHeader } from '@/components/page-header';
const VALUES = [
  {
    icon: Leaf,
    title: 'Calm by design',
    text: 'Soft palettes and simple shapes that help little rooms feel restful — not loud or overstimulating.',
  },
  {
    icon: HandHeart,
    title: 'Made with care',
    text: 'Every print is checked, wrapped, and sent from our studio. We treat each order like a gift.',
  },
  {
    icon: Package,
    title: 'Honest & simple',
    text: 'Clear prices, real stock counts, and straightforward returns. No surprises at checkout.',
  },
] as const;

const OFFERINGS = [
  {
    title: 'Giclée prints',
    detail: 'Open-edition posters on archival paper — ready to frame above a cot or reading corner.',
  },
  {
    title: 'Sticker sets',
    detail: 'Matte vinyl for journals, laptops, and little creative corners.',
  },
  {
    title: 'Original pieces',
    detail: 'One-of-a-kind studio work when available — always photographed in natural light.',
  },
] as const;

export default function AboutPage() {
  return (
    <div className="page page--about">
      <PageHeader
        title="Our story"
        subtitle="Calm, honest art for children's rooms."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="about-intro" aria-labelledby="about-intro-title">
        <div className="about-intro-copy">
          <p className="about-eyebrow">Since 2024 · Copenhagen</p>
          <h2 id="about-intro-title" className="about-intro-title">
            A small gallery for everyday walls
          </h2>
          <p>
            We work with emerging illustrators across the Nordics to offer prints and originals at
            fair prices — the kind of pieces you&apos;d happily hang above a reading nook or swap
            out as tastes grow.
          </p>
          <p>
            Nothing leaves the studio until we&apos;ve checked colour, crop, and packaging. It&apos;s
            a small operation, and we like it that way.
          </p>
          <p>
            Tiny Frames began when we went looking for nursery art that felt thoughtful rather than
            disposable — prints with personality, but without the loud colours and licensed characters
            that seem to take over every shelf. We wanted pieces that could sit quietly on the wall
            for years, then move to a sibling&apos;s room or a grandparent&apos;s hallway when the
            time came.
          </p>
          <p>
            Today we partner closely with each illustrator, from first sketch to final giclée proof.
            Papers are archival and FSC-certified where possible; inks are chosen for longevity, not
            just punch on screen. Most of what we sell is open edition, so you never have to rush —
            but when a limited original appears, we photograph it in daylight and list it honestly,
            flaws included.
          </p>
          <p>
            Whether you&apos;re framing a first print for a newborn or refreshing a corner for a
            curious six-year-old, we&apos;re glad you&apos;re here. Browse at your own pace, and if
            you&apos;re unsure about size or pairing,{' '}
            <Link href="/contact" className="text-link">drop us a line</Link> — we answer every
            message from the studio.
          </p>
        </div>
        <figure className="about-intro-visual">
          <ImagePlaceholder label="Our Copenhagen studio" className="about-studio-placeholder" />
          <figcaption className="about-caption">Our studio — where every order is packed by hand</figcaption>
        </figure>
      </section>

      <section className="about-values" aria-labelledby="about-values-title">
        <h2 id="about-values-title" className="about-section-title">
          What we stand for
        </h2>
        <ul className="about-values-grid">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="about-value-card">
              <span className="about-value-icon" aria-hidden>
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-offerings" aria-labelledby="about-offerings-title">
        <div className="about-offerings-head">
          <h2 id="about-offerings-title" className="about-section-title">
            What you&apos;ll find in the shop
          </h2>
          <p className="about-offerings-lead">
            Prints for nurseries, playrooms, and anywhere you want a touch of quiet colour.
          </p>
        </div>
        <ol className="about-offerings-list">
          {OFFERINGS.map(({ title, detail }, index) => (
            <li key={title}>
              <span className="about-offerings-step" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-promise card" aria-labelledby="about-promise-title">
        <span className="about-promise-icon" aria-hidden>
          <Frame size={28} strokeWidth={1.5} />
        </span>
        <div>
          <h2 id="about-promise-title" className="about-promise-title">
            Our promise
          </h2>
          <p>
            If a print arrives bent or damaged, tell us within 48 hours — we&apos;ll replace it or
            refund you. No lengthy forms, no chasing. We want the walls to be the exciting part.
          </p>
        </div>
      </section>

      <section className="about-cta">
        <p className="about-cta-text">Ready to find something for your space?</p>
        <div className="about-cta-actions">
          <Link href="/products" className="btn btn-primary btn-pill">
            Browse the collection
          </Link>
          <Link href="/contact" className="btn btn-secondary btn-pill">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
