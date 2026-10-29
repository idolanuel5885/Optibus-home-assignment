// The fake engine's local re-plan after a drag. Pure and deterministic.
import type { Change, ChangeWhy, Day, DaySchedule, Drag, ReplanResult, Screening } from '../types.ts';
import { MOVIES, movieById, theatreById } from '../data.ts';
import { ceilStep, fmt } from '../time.ts';
import { type Item, type SettleFail, settle } from './settle.ts';
import { coverageGaps, dayRevenue, diff, refreshCoverage } from './changes.ts';

const byDemand = [...MOVIES].sort((a, b) => b.demand - a.demand);

type Candidate = { schedule: DaySchedule; changes: Change[]; revenue: number };
type Fail = SettleFail | { kind: 'coverage'; movieId: string; count: number };

export function replan(day: Day, schedule: DaySchedule, drag: Drag): ReplanResult {
  const dragged = schedule.find((s) => s.id === drag.screeningId);
  if (!dragged) throw new Error(`Unknown screening ${drag.screeningId}`);
  const movie = movieById(dragged.movieId);
  const target = theatreById(drag.theatreId);
  const source = theatreById(dragged.theatreId);
  const p = drag.start;
  const end = p + movie.runtime;
  const cant = `Can't move ${movie.title} to Theatre ${target.id} at ${fmt(p)}`;

  if (dragged.theatreId === target.id && dragged.start === p)
    return { ok: true, schedule, changes: [], revenueDelta: 0 };

  // Blocked before any re-planning.
  if (p < day.open)
    return { ok: false, block: 'opening', message: `${cant}: it would start before opening (${fmt(day.open)}).` };
  if (end > day.close)
    return { ok: false, block: 'closing', message: `${cant}: it would end at ${fmt(end)}, after closing (${fmt(day.close)}).` };
  const others = schedule.filter((s) => s.id !== dragged.id);
  const pinnedClash = others.find(
    (s) => s.pinned && s.theatreId === target.id && s.start < end + target.cleaning && p < s.end + target.cleaning,
  );
  if (pinnedClash)
    return { ok: false, block: 'pinned', message: `${cant}: it would overlap ${describe(pinnedClash)}, which is pinned.` };

  const pinned: Screening = { ...dragged, theatreId: target.id, start: p, end, pinned: true };
  // Target-theatre screenings overlapping the new slot (with cleaning) or after it.
  const displaced = new Set(
    others.filter((s) => s.theatreId === target.id && !s.pinned && s.end + target.cleaning > p).map((s) => s.id),
  );

  const candidates: Candidate[] = [];
  const fails: Fail[] = [];

  // Candidate per choice of which displaced screening (if any) goes into the source gap.
  for (const toGap of [undefined, ...displaced]) {
    const items: Item[] = others
      .filter((s) => s.id !== toGap)
      .map((s) => ({ s, desired: displaced.has(s.id) ? Math.max(s.start, p) : s.start }));
    items.push({ s: pinned, desired: p });
    const first = settle(day, items);
    if (!first.ok) {
      fails.push(first.fail);
      continue;
    }

    // The gap the drag left in the source theatre: move one displaced screening in, then fill.
    const gap = findGap(day, first.schedule, source.id, dragged);
    const added: Screening[] = [];
    if (toGap) {
      const s = others.find((x) => x.id === toGap)!;
      const start = gap ? ceilStep(gap.from) : Infinity;
      if (!gap || start + movieById(s.movieId).runtime > gap.limit) continue; // doesn't fit; not a candidate
      added.push({ ...s, theatreId: source.id, start, end: start + movieById(s.movieId).runtime });
    }
    if (gap) {
      let from = added.length ? added[0].end + source.cleaning : gap.from;
      for (;;) {
        const start = ceilStep(from);
        const m = byDemand.find((m) => start + m.runtime <= gap.limit);
        if (!m) break;
        const id = uniqueId(`d${day.index}-t${source.id}-a${start}`, [...first.schedule, ...added]);
        added.push({ ...dragged, id, movieId: m.id, theatreId: source.id, start, end: start + m.runtime, pinned: false, reasons: [] });
        from = start + m.runtime + source.cleaning;
      }
    }

    // Settle again: the new screenings may change night-crew cleanings.
    const second = settle(day, [...first.schedule, ...added].map((s) => ({ s, desired: s.start })));
    if (!second.ok) {
      fails.push(second.fail);
      continue;
    }
    const result = refreshCoverage(second.schedule);
    const gaps = coverageGaps(result);
    if (gaps.length) {
      const m = gaps[0];
      fails.push({ kind: 'coverage', movieId: m.id, count: result.filter((s) => s.movieId === m.id).length });
      continue;
    }

    const why = (id: string): ChangeWhy => {
      if (id === dragged.id) return { kind: 'dragged' };
      if (id === toGap) return { kind: 'movedToGap', forId: dragged.id };
      if (!result.some((s) => s.id === id)) return { kind: 'noRoom', forId: dragged.id };
      if (!schedule.some((s) => s.id === id)) return { kind: 'filledGap', forId: dragged.id };
      const cause = second.causes.get(id) ?? first.causes.get(id);
      if (cause?.kind === 'crewWait') return { kind: 'nightCrew', theatreId: cause.theatreId, until: cause.until };
      return { kind: 'madeRoom', forId: dragged.id };
    };
    candidates.push({ schedule: result, changes: diff(schedule, result, why), revenue: dayRevenue(result) });
  }

  const best = candidates.reduce<Candidate | undefined>(
    (b, c) => (!b || c.revenue > b.revenue || (c.revenue === b.revenue && c.changes.length < b.changes.length) ? c : b),
    undefined,
  );
  if (best) return { ok: true, schedule: best.schedule, changes: best.changes, revenueDelta: best.revenue - dayRevenue(schedule) };

  const fail = fails[0];
  if (fail.kind === 'coverage') {
    const title = movieById(fail.movieId).title;
    const n = fail.count === 1 ? '1 screening' : `${fail.count} screenings`;
    return { ok: false, block: 'coverage', message: `${cant}: it would leave ${title} with only ${n} today (2 required).` };
  }
  if (fail.pinned.id === dragged.id && fail.cause?.kind === 'crewWait')
    return {
      ok: false,
      block: 'nightCrew',
      message: `${cant}: the night crew is cleaning Theatre ${fail.cause.theatreId} until ${fmt(fail.cause.until)}, so Theatre ${target.id} would only be ready at ${fmt(fail.earliest)}.`,
    };
  return { ok: false, block: 'pinned', message: `${cant}: it would delay ${describe(fail.pinned)}, which is pinned.` };
}

const describe = (s: Screening) =>
  `${movieById(s.movieId).title} in Theatre ${s.theatreId} (${fmt(s.start)}–${fmt(s.end)})`;

// The free stretch in `theatreId` overlapping where the dragged screening used to be.
// A screening placed in it must start ≥ from and end ≤ limit.
function findGap(day: Day, schedule: DaySchedule, theatreId: number, old: Screening) {
  const cleaning = theatreById(theatreId).cleaning;
  const row = schedule.filter((s) => s.theatreId === theatreId).sort((a, b) => a.start - b.start);
  for (let i = -1; i < row.length; i++) {
    const from = i >= 0 ? row[i].end + cleaning : day.open;
    const limit = i + 1 < row.length ? row[i + 1].start - cleaning : day.close;
    if (from < old.end && limit > old.start) return { from, limit };
  }
  return undefined;
}

function uniqueId(base: string, schedule: DaySchedule) {
  let id = base;
  for (let n = 2; schedule.some((s) => s.id === id); n++) id = `${base}-${n}`;
  return id;
}
