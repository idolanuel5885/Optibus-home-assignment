import { useState } from 'react';
import { useReview } from './useReview.ts';
import Nav, { type Page } from './ui/Nav.tsx';
import LoadingOverlay from './ui/LoadingOverlay.tsx';
import { LOADING_MS } from './ui/loading.ts';
import LoginPage from './ui/pages/LoginPage.tsx';
import ReviewPage from './ui/pages/ReviewPage.tsx';
import SetupGeneratePage, { type SetupBox } from './ui/pages/SetupGeneratePage.tsx';

const PAGE_NAMES: Record<Page, string> = { setup: 'Setup & Generate', review: 'Review' };

export default function App() {
  const review = useReview();
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>('setup');
  const [opening, setOpening] = useState<Page>(); // page switch in progress
  const [setupFocus, setSetupFocus] = useState<SetupBox>();
  const generated = review.week !== undefined;

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  // Switch page after a short simulated loading.
  const open = (p: Page, focus?: SetupBox) => {
    if (p === page || opening) return;
    setOpening(p);
    setTimeout(() => {
      setOpening(undefined);
      setSetupFocus(focus);
      setPage(p);
    }, LOADING_MS.page);
  };

  return (
    <div className="app">
      <Nav page={opening ?? page} canReview={generated} disabled={opening !== undefined || review.pending !== undefined} onNavigate={(p) => open(p)} />
      <main className="main">
        {page === 'setup' && (
          <SetupGeneratePage
            focus={setupFocus}
            generated={generated}
            onGenerate={() => {
              review.generate();
              setPage('review');
            }}
          />
        )}
        {page === 'review' && generated && <ReviewPage review={review} onEditRules={() => open('setup', 'theatres')} />}
        {opening && <LoadingOverlay message={`Opening ${PAGE_NAMES[opening]}…`} />}
      </main>
    </div>
  );
}
