import { SITE, WEEK_LABEL } from '../data.ts';

export default function Header({ status }: { status: 'Draft' | 'Published' }) {
  return (
    <header className="header">
      <h1>{SITE}</h1>
      <span className="week">Week of {WEEK_LABEL}</span>
      <span className={`status status-${status.toLowerCase()}`}>{status}</span>
    </header>
  );
}
