// Independent check of the five hard rules. Recomputes everything from the schedule; trusts no flags.
import type { Day, DaySchedule } from '../types.ts';
import { MOVIES, NIGHT_CREW_FROM, REQUIRED_PER_DAY, START_STEP, THEATRES, movieById } from '../data.ts';
import { fmt } from '../time.ts';

export interface Violation {
  rule: 1 | 2 | 3 | 4 | 5;
  message: string;
}

export function validateDay(day: Day, schedule: DaySchedule): Violation[] {
  const v: Violation[] = [];
  const label = (s: DaySchedule[number]) => `${movieById(s.movieId).title} T${s.theatreId} ${fmt(s.start)}`;
  const crewCleanings: { theatreId: number; start: number; end: number; what: string }[] = [];

  for (const s of schedule) {
    // Rule 1: within opening hours, ends by closing; runtime is the movie's.
    if (s.start < day.open) v.push({ rule: 1, message: `${label(s)} starts before opening` });
    if (s.end > day.close) v.push({ rule: 1, message: `${label(s)} ends at ${fmt(s.end)}, after closing` });
    if (s.end - s.start !== movieById(s.movieId).runtime) v.push({ rule: 1, message: `${label(s)} has wrong runtime` });
    // Rule 5: 5-minute steps.
    if (s.start % START_STEP !== 0) v.push({ rule: 5, message: `${label(s)} not on a ${START_STEP}-minute step` });
  }

  // Rule 2: cleaning between consecutive screenings in the same theatre.
  for (const t of THEATRES) {
    const row = schedule.filter((s) => s.theatreId === t.id).sort((a, b) => a.start - b.start);
    row.forEach((s, i) => {
      const next = row[i + 1];
      const c = s.cleaning;
      if (c.start < s.end || c.end - c.start !== t.cleaning)
        v.push({ rule: 2, message: `${label(s)}: cleaning ${fmt(c.start)}–${fmt(c.end)} is wrong` });
      if (next && next.start < c.end)
        v.push({ rule: 2, message: `${label(next)} starts before cleaning of T${t.id} ends at ${fmt(c.end)}` });
      if (next && c.start >= NIGHT_CREW_FROM) crewCleanings.push({ theatreId: t.id, ...c, what: label(s) });
    });
  }

  // Rule 3: the single night crew cleans one theatre at a time.
  crewCleanings.sort((a, b) => a.start - b.start);
  for (let i = 1; i < crewCleanings.length; i++) {
    const a = crewCleanings[i - 1];
    const b = crewCleanings[i];
    if (b.start < a.end)
      v.push({ rule: 3, message: `Night crew double-booked: T${a.theatreId} until ${fmt(a.end)} and T${b.theatreId} from ${fmt(b.start)}` });
  }

  // Rule 4: coverage.
  for (const m of MOVIES) {
    const n = schedule.filter((s) => s.movieId === m.id).length;
    if (n < REQUIRED_PER_DAY) v.push({ rule: 4, message: `${m.title} plays ${n}× (needs ${REQUIRED_PER_DAY})` });
  }
  return v;
}
