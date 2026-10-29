// The only place engine reasons and change reasons become words. Nothing here is invented:
// each line formats a structured value the engine returned.
import type { Change, ChangeWhy, HistoryEntry, Place, Reason } from '../types.ts';
import { movieById } from '../data.ts';
import { fmt } from '../time.ts';
import { shekels, signedShekels } from './format.ts';

const ordinal = (n: number) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');

export function describeReason(r: Reason): string {
  switch (r.kind) {
    case 'coverage':
      return `${ordinal(r.n)} of ${r.of} required screenings of ${movieById(r.movieId).title} today`;
    case 'revenue':
      return `${shekels(r.amount)} expected: demand ${r.demand} × ${r.seats} seats`;
    case 'cleaningWait':
      return `Start waits for the ${r.minutes}-min cleaning of Theatre ${r.theatreId}`;
    case 'crewWait':
      return `Start waits for the night crew, cleaning Theatre ${r.theatreId} until ${fmt(r.until)}`;
    case 'pinned':
      return 'Pinned by the admin';
  }
}

export function describeWhy(why: ChangeWhy, titleOf: (id: string) => string): string {
  switch (why.kind) {
    case 'dragged':
      return 'dragged by the admin and pinned';
    case 'madeRoom':
      return `shifted later to make room for ${titleOf(why.forId)}`;
    case 'movedToGap':
      return `moved into the gap ${titleOf(why.forId)} left`;
    case 'filledGap':
      return `added in the gap ${titleOf(why.forId)} left`;
    case 'nightCrew':
      return `shifted later for the night crew, cleaning Theatre ${why.theatreId} until ${fmt(why.until)}`;
    case 'noRoom':
      return 'removed, no longer fits before closing';
  }
}

const at = (p: Place) => `T${p.theatreId} ${fmt(p.start)}`;
const move = (from: Place, to: Place) =>
  from.theatreId === to.theatreId ? `${at(from)} → ${fmt(to.start)}` : `${at(from)} → ${at(to)}`;

export function describeChange(c: Change, titleOf: (id: string) => string): string {
  const where = c.kind === 'moved' ? move(c.from, c.to) : c.kind === 'added' ? at(c.to) : at(c.from);
  return `${movieById(c.movieId).title} ${where}: ${describeWhy(c.why, titleOf)}`;
}

// One line per drag: what was dragged, what else changed (counted by reason), revenue change.
export function describeDrag(entry: HistoryEntry): string {
  const dragged = entry.changes.find((c) => c.why.kind === 'dragged');
  const head = dragged?.kind === 'moved' ? `${movieById(dragged.movieId).title} ${move(dragged.from, dragged.to)}` : 'Drag';
  const count = (kinds: ChangeWhy['kind'][]) => entry.changes.filter((c) => kinds.includes(c.why.kind)).length;
  const parts = [
    [count(['madeRoom', 'nightCrew']), 'shifted later'],
    [count(['movedToGap']), 'moved into the gap'],
    [count(['filledGap']), 'added'],
    [count(['noRoom']), 'removed'],
  ]
    .filter(([n]) => n)
    .map(([n, label]) => `${n} ${label}`);
  return [head, ...parts, signedShekels(entry.revenueDelta)].join(' · ');
}

// Title lookup for the screening a change refers to, from the schedule before the drag.
export const titleLookup = (entry: HistoryEntry) => (id: string) => {
  const s = entry.before.find((x) => x.id === id) ?? entry.after.find((x) => x.id === id);
  return s ? movieById(s.movieId).title : 'the dragged screening';
};
