import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { studyIntro, studySections } from '@/lib/study-content';

export const metadata = {
  title: 'Exam study guide | ARTSHOP',
  description: 'Full-stack exam revision tied to the ARTSHOP project.',
};

export default function StudyPage() {
  return (
    <div className="page page--study">
      <PageHeader
        title="Exam study guide"
        subtitle={studyIntro}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Study guide' }]}
      />

      <div className="study-layout">
        <nav className="study-toc" aria-label="Topics">
          <p className="study-toc-title">Topics</p>
          <ol>
            {studySections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
          <p className="study-toc-note">
            Also see{' '}
            <Link href="/faq">FAQ</Link>, project docs on GitHub, and{' '}
            <a
              href="https://fullstack-exam-49k7.onrender.com/api/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              API docs
            </a>
            .
          </p>
        </nav>

        <div className="study-content content-prose">
          {studySections.map((section) => (
            <section key={section.id} id={section.id} className="study-section">
              <h2>{section.title}</h2>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="study-in-project">
                <p className="study-in-project-label">In this project</p>
                <p>{section.inProject}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
