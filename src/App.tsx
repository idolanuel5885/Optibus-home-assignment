import { useState } from 'react';
import { useReview } from './useReview.ts';
import Nav, { type Page } from './ui/Nav.tsx';
import ReviewPage from './ui/pages/ReviewPage.tsx';
import SetupGeneratePage, { type SetupBox } from './ui/pages/SetupGeneratePage.tsx';

export default function App() {
  const review = useReview();
  const [page, setPage] = useState<Page>('setup');
  const [setupFocus, setSetupFocus] = useState<SetupBox>();
  const generated = review.week !== undefined;

  const navigate = (p: Page) => {
    setSetupFocus(undefined);
    setPage(p);
  };

  return (
    <div className="app">
      <Nav page={page} canReview={generated} onNavigate={navigate} />
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
        {page === 'review' && generated && (
          <ReviewPage
            review={review}
            onEditRules={() => {
              setSetupFocus('cleaning');
              setPage('setup');
            }}
          />
        )}
      </main>
    </div>
  );
}
