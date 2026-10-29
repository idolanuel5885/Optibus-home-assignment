import type { Screening } from '../types.ts';
import { movieById } from '../data.ts';
import { fmt } from '../time.ts';
import { describeReason } from './describe.ts';

export default function ScreeningReasons({ screening }: { screening?: Screening }) {
  if (!screening) return <p className="muted">Click a screening to see why the engine placed it there.</p>;
  const m = movieById(screening.movieId);
  return (
    <div className="reasons">
      <h3>{m.title}</h3>
      <p className="muted">
        Theatre {screening.theatreId} · {fmt(screening.start)}–{fmt(screening.end)} · {m.runtime} min
      </p>
      <ul>
        {screening.reasons.map((r, i) => (
          <li key={i} className={`reason reason-${r.kind}`}>
            {describeReason(r)}
          </li>
        ))}
      </ul>
    </div>
  );
}
