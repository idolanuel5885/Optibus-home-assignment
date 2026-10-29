// Settle pass: lays out a day's screenings in time, theatre by theatre, booking the night
// crew in the order cleanings start. Screenings only ever move later than their desired start;
// pinned screenings never move. Used by the re-plan.
import type { Day, Minutes, Reason, Screening } from '../types.ts';
import { THEATRES, movieById, theatreById } from '../data.ts';
import { type CrewJob, endOfNightCleaning, nextSlot, revenue } from './rules.ts';

export interface Item {
  s: Screening;
  desired: Minutes; // earliest start we'd like; the screening may start later, never earlier
}

export type SettleFail = { kind: 'pinnedDelayed'; pinned: Screening; earliest: Minutes; cause?: Reason };

export type SettleResult =
  | { ok: true; schedule: Screening[]; dropped: Screening[]; causes: Map<string, Reason | undefined> }
  | { ok: false; fail: SettleFail };

const isStartReason = (r: Reason) => r.kind === 'cleaningWait' || r.kind === 'crewWait';

export function settle(day: Day, items: Item[]): SettleResult {
  const queues = new Map<number, Item[]>(THEATRES.map((t) => [t.id, []]));
  for (const it of items) queues.get(it.s.theatreId)!.push({ ...it });
  for (const q of queues.values()) q.sort((a, b) => a.desired - b.desired || Number(b.s.pinned) - Number(a.s.pinned));

  const placed = new Map<number, Screening[]>(THEATRES.map((t) => [t.id, []]));
  const crewJobs: CrewJob[] = [];
  const dropped: Screening[] = [];
  const causes = new Map<string, Reason | undefined>(); // why a screening starts later than desired

  // Next theatre to advance: the one whose pending cleaning starts earliest (first screenings first).
  const nextTheatre = () => {
    let best: number | undefined;
    let bestKey = Infinity;
    for (const t of THEATRES) {
      if (queues.get(t.id)!.length === 0) continue;
      const key = placed.get(t.id)!.at(-1)?.end ?? -1;
      if (key < bestKey) [best, bestKey] = [t.id, key];
    }
    return best;
  };

  for (let tid = nextTheatre(); tid !== undefined; tid = nextTheatre()) {
    const theatre = theatreById(tid);
    const queue = queues.get(tid)!;
    const row = placed.get(tid)!;
    const item = queue.shift()!;
    const movie = movieById(item.s.movieId);
    const prev = row.at(-1);
    const slot = nextSlot(theatre, prev, day.open, crewJobs);

    let start: Minutes;
    if (item.s.pinned) {
      if (slot.start > item.desired) return { ok: false, fail: { kind: 'pinnedDelayed', pinned: item.s, earliest: slot.start, cause: slot.reason } };
      start = item.desired;
    } else {
      start = Math.max(item.desired, slot.start);
      // Would it run into a pinned screening later in this theatre? Then it goes after that one.
      const pinIdx = queue.findIndex((x) => x.s.pinned);
      if (pinIdx >= 0 && start + movie.runtime + theatre.cleaning > queue[pinIdx].desired) {
        queue.splice(pinIdx + 1, 0, { ...item, desired: Math.max(item.desired, queue[pinIdx].desired) });
        continue;
      }
    }
    if (start + movie.runtime > day.close) {
      dropped.push(item.s);
      continue;
    }

    if (prev && slot.prevCleaning) {
      prev.cleaning = slot.prevCleaning;
      if (slot.prevCleaning.crew) crewJobs.push({ theatreId: tid, ...slot.prevCleaning });
    }
    const startReason = prev && start === slot.start ? slot.reason : undefined;
    if (start > item.desired) causes.set(item.s.id, slot.reason);
    const reasons: Reason[] = item.s.reasons.filter((r) => r.kind === 'coverage');
    reasons.push({ kind: 'revenue', amount: revenue(movie, theatre), demand: movie.demand, seats: theatre.seats });
    if (startReason && isStartReason(startReason)) reasons.push(startReason);
    if (item.s.pinned) reasons.push({ kind: 'pinned' });
    row.push({
      ...item.s,
      start,
      end: start + movie.runtime,
      cleaning: endOfNightCleaning(day.close, theatre),
      reasons,
    });
  }

  const schedule = [...placed.values()].flat().sort((a, b) => a.start - b.start || a.theatreId - b.theatreId);
  return { ok: true, schedule, dropped, causes };
}
