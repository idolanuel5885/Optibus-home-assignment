import type { Change } from '../types.ts';
import { signedShekels } from './format.ts';

export default function ChangeSummary({ changes, revenueDelta }: { changes: Change[]; revenueDelta: number }) {
  const n = changes.length;
  return (
    <div className="change-summary">
      {n} {n === 1 ? 'screening' : 'screenings'} changed · revenue change for this drag: <strong>{signedShekels(revenueDelta)}</strong>
    </div>
  );
}
