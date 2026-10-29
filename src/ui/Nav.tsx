import Logo from './Logo.tsx';

export type Page = 'setup' | 'review';

interface Props {
  page: Page;
  canReview: boolean;
  disabled: boolean; // while something is loading
  onNavigate: (page: Page) => void;
}

export default function Nav({ page, canReview, disabled: busy, onNavigate }: Props) {
  const item = (id: Page, label: string, disabled = false) => (
    <button className={`nav-item${page === id ? ' active' : ''}`} disabled={disabled || busy} onClick={() => onNavigate(id)}>
      {label}
    </button>
  );
  return (
    <nav className="nav">
      <div className="nav-brand">
        <Logo />
      </div>
      {item('setup', 'Setup & Generate')}
      {item('review', 'Review', !canReview)}
      {!canReview && <p className="nav-hint">Generate the schedule first</p>}
    </nav>
  );
}
