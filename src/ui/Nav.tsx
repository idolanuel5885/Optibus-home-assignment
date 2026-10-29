export type Page = 'setup' | 'generate' | 'review';

interface Props {
  page: Page;
  canReview: boolean;
  onNavigate: (page: Page) => void;
}

export default function Nav({ page, canReview, onNavigate }: Props) {
  const item = (id: Page, label: string, disabled = false, hint?: string) => (
    <button className={`nav-item${page === id ? ' active' : ''}`} disabled={disabled} title={hint} onClick={() => onNavigate(id)}>
      {label}
    </button>
  );
  return (
    <nav className="nav">
      <div className="nav-brand">PSR Schedule</div>
      {item('setup', 'Setup')}
      {item('generate', 'Generate')}
      {item('review', 'Review', !canReview, canReview ? undefined : 'Generate the schedule first')}
      {!canReview && <p className="nav-hint">Generate the schedule first</p>}
    </nav>
  );
}
