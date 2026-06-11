'use client';

import { Printer } from 'lucide-react';

export function StudyPrintButton() {
  return (
    <div className="study-print-bar">
      <p className="study-print-hint">
        Prints without the sidebar or table of contents — all black text, several topics per page.
        Turn off &ldquo;Background graphics&rdquo; to save ink.
      </p>
      <button type="button" className="btn btn-secondary btn-sm study-print-btn" onClick={() => window.print()}>
        <Printer size={16} aria-hidden />
        Print study guide
      </button>
    </div>
  );
}
