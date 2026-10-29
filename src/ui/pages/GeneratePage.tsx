import { useEffect, useState } from 'react';

const FAKE_LOADING_MS = 1200;

export default function GeneratePage({ generated, onGenerate }: { generated: boolean; onGenerate: () => void }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      setLoading(false);
      onGenerate();
    }, FAKE_LOADING_MS);
    return () => clearTimeout(t);
  }, [loading, onGenerate]);

  return (
    <div className="page generate-page">
      <h1>Generate</h1>
      <p className="muted">The engine builds the week from the inputs in Setup.</p>
      <button className="primary big" disabled={loading || generated} onClick={() => setLoading(true)}>
        {loading ? 'Generating…' : 'Generate schedule for the week of 6 June'}
      </button>
      {loading && <div className="spinner" aria-label="Generating" />}
      {generated && <p className="muted">Generated. Use Reset in Review to go back to the engine's schedule.</p>}
    </div>
  );
}
