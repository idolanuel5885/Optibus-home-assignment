import { RULES } from '../data.ts';

// Each rule shows a green check only if the day's schedule passes it (from the validator).
export default function RulesList({ broken }: { broken: Set<number> }) {
  const met = RULES.length - broken.size;
  return (
    <details className="rules">
      <summary>
        Rules enforced{' '}
        <span className={`rules-count${broken.size ? ' broken' : ''}`}>
          {met} of {RULES.length} met
        </span>
      </summary>
      <ul>
        {RULES.map((r, i) => {
          const ok = !broken.has(i + 1);
          return (
            <li key={r} className={ok ? 'rule-ok' : 'rule-broken'}>
              <span className="rule-mark" aria-label={ok ? 'Met' : 'Not met'}>
                {ok ? '✓' : '✕'}
              </span>
              {r}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
