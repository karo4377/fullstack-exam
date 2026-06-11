import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { shopName } from '@/lib/site';
import { studyIntro, studySections } from '@/lib/study-content';

export const metadata = {
  title: 'Exam study guide',
  description: `Full-stack exam revision tied to the ${shopName} project.`,
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
                <a href={`#${section.id}`}>
                  {section.title}
                  {section.extra ? ' (extra)' : ''}
                </a>
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
              <h2>
                {section.title}
                {section.extra ? <span className="study-extra-badge">Extra</span> : null}
              </h2>
              <p className="study-question">
                <strong>Exam question:</strong> {section.question ?? section.title}
              </p>
              <h3 className="study-answer-heading">Answer</h3>
              <ul className="study-answer-list">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              {section.snippets?.map((snippet) => (
                <figure key={snippet.caption ?? snippet.code.slice(0, 40)} className="study-code">
                  {snippet.caption ? (
                    <figcaption className="study-code-caption">{snippet.caption}</figcaption>
                  ) : null}
                  <pre>
                    <code>{snippet.code}</code>
                  </pre>
                </figure>
              ))}

              <div className="study-in-project">
                <p className="study-in-project-label">In this project ({shopName})</p>
                <p>{section.inProject}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
