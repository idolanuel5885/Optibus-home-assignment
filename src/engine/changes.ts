// Before/after diff of a day → the engine's list of changes, and revenue totals.
import type { Change, ChangeWhy, DaySchedule, Screening } from '../types.ts';
import { MOVIES, REQUIRED_PER_DAY, movieById, theatreById } from '../data.ts';
import { revenue } from './rules.ts';

export const dayRevenue = (schedule: DaySchedule): number =>
  schedule.reduce((sum, s) => sum + revenue(movieById(s.movieId), theatreById(s.theatreId)), 0);

const place = (s: Screening) => ({ theatreId: s.theatreId, start: s.start });

export function diff(before: DaySchedule, after: DaySchedule, why: (id: string) => ChangeWhy): Change[] {
  const changes: Change[] = [];
  const afterById = new Map(after.map((s) => [s.id, s]));
  const beforeIds = new Set(before.map((s) => s.id));
  for (const b of before) {
    const a = afterById.get(b.id);
    if (!a) changes.push({ kind: 'removed', screeningId: b.id, movieId: b.movieId, from: place(b), why: why(b.id) });
    else if (a.theatreId !== b.theatreId || a.start !== b.start)
      changes.push({ kind: 'moved', screeningId: b.id, movieId: b.movieId, from: place(b), to: place(a), why: why(b.id) });
  }
  for (const a of after)
    if (!beforeIds.has(a.id)) changes.push({ kind: 'added', screeningId: a.id, movieId: a.movieId, to: place(a), why: why(a.id) });
  return changes;
}

// Movies left with fewer than the required screenings.
export const coverageGaps = (schedule: DaySchedule) =>
  MOVIES.filter((m) => schedule.filter((s) => s.movieId === m.id).length < REQUIRED_PER_DAY);

// Keep coverage reasons on the screenings that carried them; if one was removed, the earliest
// other screening of that movie takes over. Numbered in time order. Returns new screening objects.
export function refreshCoverage(schedule: DaySchedule): DaySchedule {
  const required = new Set<string>();
  for (const m of MOVIES) {
    const own = schedule.filter((s) => s.movieId === m.id).sort((a, b) => a.start - b.start);
    const flagged = own.filter((s) => s.reasons.some((r) => r.kind === 'coverage')).slice(0, REQUIRED_PER_DAY);
    for (const s of own) if (flagged.length < REQUIRED_PER_DAY && !flagged.includes(s)) flagged.push(s);
    flagged.forEach((s) => required.add(s.id));
  }
  const n = new Map<string, number>();
  return schedule.map((s) => {
    const reasons = s.reasons.filter((r) => r.kind !== 'coverage');
    if (!required.has(s.id)) return { ...s, reasons };
    const k = (n.get(s.movieId) ?? 0) + 1;
    n.set(s.movieId, k);
    return { ...s, reasons: [{ kind: 'coverage', movieId: s.movieId, n: k, of: REQUIRED_PER_DAY }, ...reasons] };
  });
}

// How many screenings differ between two versions of a day (moved, added or removed).
export const countChanged = (before: DaySchedule, after: DaySchedule): number =>
  diff(before, after, () => ({ kind: 'dragged' })).length; // the reason doesn't matter for a count
