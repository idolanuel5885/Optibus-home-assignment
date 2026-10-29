import { RULES } from '../data.ts';

export default function RulesList() {
  return (
    <details className="rules">
      <summary>Rules enforced ({RULES.length})</summary>
      <ol>
        {RULES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </details>
  );
}
