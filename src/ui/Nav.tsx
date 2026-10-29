import Logo from './Logo.tsx';

export type Page = 'setup' | 'review';

interface Props {
  page: Page;
  canReview: boolean;
  onNavigate: (page: Page) => void;
}

export default function Nav({ page, canReview, onNavigate }: Props) {
  const item = (id: Page, label: string, disabled = false) => (
    <button className={`nav-item${page === id ? ' active' : ''}`} disabled={disabled} onClick={() => onNavigate(id)}>
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
