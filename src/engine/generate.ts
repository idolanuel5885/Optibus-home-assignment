// The fake engine's "generate": deterministic greedy, each day independent.
import type { Day, DaySchedule, Movie, Reason, Screening, Theatre, WeekSchedule } from '../types.ts';
import { DAYS, MOVIES, REQUIRED_PER_DAY, THEATRES } from '../data.ts';
import { type CrewJob, endOfNightCleaning, nextSlot, revenue } from './rules.ts';

export const generateWeek = (): WeekSchedule => DAYS.map(generateDay);

const byDemand = [...MOVIES].sort((a, b) => b.demand - a.demand);
const bySize = [...THEATRES].sort((a, b) => b.seats - a.seats);

export function generateDay(day: Day): DaySchedule {
  const rows = new Map<number, Screening[]>(THEATRES.map((t) => [t.id, []]));
  const crewJobs: CrewJob[] = [];
  const coverageIds = new Set<string>();

  const last = (t: Theatre) => rows.get(t.id)!.at(-1);
  const slotFor = (t: Theatre) => nextSlot(t, last(t), day.open, crewJobs);

  // Theatre that can start soonest; ties go to the larger theatre.
  const earliest = (theatres: Theatre[]) =>
    theatres.reduce((best, t) => (slotFor(t).start < slotFor(best).start ? t : best));

  const fits = (t: Theatre, m: Movie) => slotFor(t).start + m.runtime <= day.close;

  const place = (t: Theatre, m: Movie) => {
    const slot = slotFor(t);
    const prev = last(t);
    if (prev && slot.prevCleaning) {
      prev.cleaning = slot.prevCleaning;
      if (slot.prevCleaning.crew) crewJobs.push({ theatreId: t.id, ...slot.prevCleaning });
    }
    const end = slot.start + m.runtime;
    const reasons: Reason[] = [{ kind: 'revenue', amount: revenue(m, t), demand: m.demand, seats: t.seats }];
    if (slot.reason) reasons.push(slot.reason);
    const s: Screening = {
      id: `d${day.index}-t${t.id}-${rows.get(t.id)!.length + 1}`,
      day: day.index,
      theatreId: t.id,
      movieId: m.id,
      start: slot.start,
      end,
      cleaning: endOfNightCleaning(day.close, t), // replaced if another screening follows
      pinned: false,
      reasons,
    };
    rows.get(t.id)!.push(s);
    return s;
  };

  // 1. Coverage: two rounds of every movie, strongest first, each into the theatre free soonest.
  for (let round = 0; round < REQUIRED_PER_DAY; round++) {
    for (const m of byDemand) {
      const candidates = bySize.filter((t) => fits(t, m));
      if (candidates.length === 0) throw new Error(`Cannot cover ${m.title} on ${day.name}`);
      coverageIds.add(place(earliest(candidates), m).id);
    }
  }

  // 2. Fill: the theatre free soonest gets the strongest movie that still ends by closing.
  let open = [...bySize];
  while (open.length > 0) {
    const t = earliest(open);
    const m = byDemand.find((m) => fits(t, m));
    if (m) place(t, m);
    else open = open.filter((x) => x !== t);
  }

  const all = [...rows.values()].flat().sort((a, b) => a.start - b.start || a.theatreId - b.theatreId);

  // Coverage reasons, numbered in time order.
  for (const m of MOVIES) {
    all
      .filter((s) => s.movieId === m.id && coverageIds.has(s.id))
      .forEach((s, i) => s.reasons.unshift({ kind: 'coverage', movieId: m.id, n: i + 1, of: REQUIRED_PER_DAY }));
  }
  return all;
}
