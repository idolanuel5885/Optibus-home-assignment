import { useState } from 'react';
import { useReview } from './useReview.ts';
import Nav, { type Page } from './ui/Nav.tsx';
import GeneratePage from './ui/pages/GeneratePage.tsx';
import ReviewPage from './ui/pages/ReviewPage.tsx';
import SetupPage, { type SetupSection } from './ui/pages/SetupPage.tsx';

export default function App() {
  const review = useReview();
  const [page, setPage] = useState<Page>('generate');
  const [setupFocus, setSetupFocus] = useState<SetupSection>();
  const generated = review.week !== undefined;

  const navigate = (p: Page) => {
    setSetupFocus(undefined);
    setPage(p);
  };

  return (
    <div className="app">
      <Nav page={page} canReview={generated} onNavigate={navigate} />
      <main className="main">
        {page === 'setup' && <SetupPage focus={setupFocus} />}
        {page === 'generate' && (
          <GeneratePage
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
