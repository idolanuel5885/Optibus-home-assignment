// Shared rule helpers used by generate (and later by re-plan and validate).
import type { Cleaning, Minutes, Movie, Reason, Screening, Theatre } from '../types.ts';
import { NIGHT_CREW_FROM, TICKET_PRICE } from '../data.ts';
import { ceilStep } from '../time.ts';

export const revenue = (movie: Movie, theatre: Theatre): number =>
  Math.round((movie.demand / 10) * theatre.seats * TICKET_PRICE);

export interface CrewJob {
  theatreId: number;
  start: Minutes;
  end: Minutes;
}

// Earliest start ≥ from at which the single night crew is free for `duration` minutes.
export function crewSlot(jobs: CrewJob[], from: Minutes, duration: Minutes): { start: Minutes; blockedBy?: CrewJob } {
  let start = from;
  let blockedBy: CrewJob | undefined;
  for (const job of [...jobs].sort((a, b) => a.start - b.start)) {
    if (job.end <= start) continue;
    if (job.start >= start + duration) break;
    start = job.end;
    blockedBy = job;
  }
  return { start, blockedBy };
}

export interface NextSlot {
  start: Minutes;
  prevCleaning?: Cleaning; // the cleaning between `prev` and the new screening
  reason?: Reason; // what set the start time
}

// When can the next screening start in `theatre`, given the previous screening there (if any)?
export function nextSlot(theatre: Theatre, prev: Screening | undefined, open: Minutes, crewJobs: CrewJob[]): NextSlot {
  if (!prev) return { start: open };
  let cleanStart = prev.end;
  let reason: Reason = { kind: 'cleaningWait', theatreId: theatre.id, minutes: theatre.cleaning };
  const crew = cleanStart >= NIGHT_CREW_FROM;
  if (crew) {
    const slot = crewSlot(crewJobs, cleanStart, theatre.cleaning);
    if (slot.blockedBy) reason = { kind: 'crewWait', theatreId: slot.blockedBy.theatreId, until: slot.blockedBy.end };
    cleanStart = slot.start;
  }
  const cleanEnd = cleanStart + theatre.cleaning;
  return { start: ceilStep(cleanEnd), prevCleaning: { start: cleanStart, end: cleanEnd, crew }, reason };
}

// The cleaning after the last screening of the day happens after closing; no crew constraint.
export const endOfNightCleaning = (close: Minutes, theatre: Theatre): Cleaning => ({
  start: close,
  end: close + theatre.cleaning,
  crew: false,
});
