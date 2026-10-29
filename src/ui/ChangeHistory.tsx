import { useState } from 'react';
import type { Change, HistoryEntry } from '../types.ts';
import { describeChange, describeDrag, titleLookup } from './describe.ts';

const placeOf = (c: Change) => (c.kind === 'added' ? c.to : c.from);
const byDraggedThenTime = (a: Change, b: Change) =>
  Number(b.why.kind === 'dragged') - Number(a.why.kind === 'dragged') || placeOf(a).start - placeOf(b).start;

export default function ChangeHistory({ entries }: { entries: HistoryEntry[] }) {
  const [open, setOpen] = useState<HistoryEntry>();
  if (entries.length === 0) return <p className="muted">No changes to this day yet.</p>;
  return (
    <ol className="history">
      {entries.map((e, i) => {
        const titleOf = titleLookup(e);
        return (
          <li key={i}>
            <button className="history-line" onClick={() => setOpen(open === e ? undefined : e)}>
              {open === e ? '▾' : '▸'} {describeDrag(e)}
            </button>
            {open === e && (
              <ul className="history-changes">
                {[...e.changes].sort(byDraggedThenTime).map((c) => (
                  <li key={c.screeningId}>{describeChange(c, titleOf)}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
