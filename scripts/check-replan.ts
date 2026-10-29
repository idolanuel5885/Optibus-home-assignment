// Re-plan checks: a sweep of drags over the week, chains of drags, and the demo drag.
import type { Change, Day, DaySchedule, Drag } from '../src/types.ts';
import { DAYS, THEATRES, movieById } from '../src/data.ts';
import { generateWeek } from '../src/engine/generate.ts';
import { replan } from '../src/engine/replan.ts';
import { dayRevenue } from '../src/engine/changes.ts';
import { validateDay } from '../src/engine/validate.ts';
import { fmt } from '../src/time.ts';

const week = generateWeek();
const problems: string[] = [];
const blockedBy: Record<string, number> = {};
const sampleMessage: Record<string, string> = {};
let accepted = 0;

// Every invariant an accepted or blocked drag must satisfy.
function checkDrag(day: Day, before: DaySchedule, drag: Drag, tag: string) {
  const snapshot = JSON.stringify(before);
  const r = replan(day, before, drag);
  if (JSON.stringify(before) !== snapshot) problems.push(`${tag}: input schedule was mutated`);
  if (!r.ok) {
    blockedBy[r.block] = (blockedBy[r.block] ?? 0) + 1;
    sampleMessage[r.block] ??= r.message;
    const s = before.find((x) => x.id === drag.screeningId)!;
    const prefix = `Can't move ${movieById(s.movieId).title} to Theatre ${drag.theatreId} at ${fmt(drag.start)}: `;
    if (!r.message.startsWith(prefix) || r.message.length <= prefix.length + 10) problems.push(`${tag}: bad message "${r.message}"`);
    return r;
  }
  const fail = (msg: string) => problems.push(`${tag}: ${msg}`);
  const original = before.find((s) => s.id === drag.screeningId)!;
  if (original.theatreId === drag.theatreId && original.start === drag.start) {
    if (r.changes.length || r.schedule !== before) fail('a drop in place changed something');
    return r; // a drop in place is a click, not a drag
  }
  accepted++;
  const after = r.schedule;
  for (const v of validateDay(day, after)) fail(`rule ${v.rule}: ${v.message}`);
  if (new Set(after.map((s) => s.id)).size !== after.length) fail('duplicate ids');
  const d = after.find((s) => s.id === drag.screeningId);
  if (!d || d.theatreId !== drag.theatreId || d.start !== drag.start || !d.pinned) fail('dragged screening not pinned at its new place');
  for (const p of before.filter((s) => s.pinned && s.id !== drag.screeningId)) {
    const a = after.find((s) => s.id === p.id);
    if (!a || a.start !== p.start || a.theatreId !== p.theatreId) fail(`pinned ${p.id} moved or removed`);
  }
  // The change list must be exactly the real before/after difference.
  const changedIds = new Set<string>();
  const beforeById = new Map(before.map((s) => [s.id, s]));
  const afterById = new Map(after.map((s) => [s.id, s]));
  for (const [id, b] of beforeById) {
    const a = afterById.get(id);
    if (!a || a.start !== b.start || a.theatreId !== b.theatreId) changedIds.add(id);
  }
  for (const id of afterById.keys()) if (!beforeById.has(id)) changedIds.add(id);
  const listed = new Set(r.changes.map((c) => c.screeningId));
  if (listed.size !== changedIds.size || [...changedIds].some((id) => !listed.has(id))) fail('change list ≠ real difference');
  if (r.revenueDelta !== dayRevenue(after) - dayRevenue(before)) fail('revenue delta wrong');
  // Locality: outside the source and target theatres, screenings only shift later for the night crew.
  const source = beforeById.get(drag.screeningId)!.theatreId;
  for (const c of r.changes) {
    if (c.kind === 'added') continue;
    if (c.from.theatreId === source || c.from.theatreId === drag.theatreId) continue;
    if (c.kind === 'moved' && (c.to.theatreId !== c.from.theatreId || c.to.start < c.from.start || c.why.kind !== 'nightCrew'))
      fail(`screening outside scope changed: ${JSON.stringify(c)}`);
    if (c.kind === 'removed' && c.why.kind !== 'noRoom') fail(`screening outside scope removed: ${JSON.stringify(c)}`);
  }
  return r;
}

// 1. Sweep: every screening, to every theatre, at several times around its own start.
for (const day of DAYS) {
  for (const s of week[day.index]) {
    for (const t of THEATRES) {
      for (const offset of [-120, -45, -10, 0, 25, 90, 240]) {
        checkDrag(day, week[day.index], { screeningId: s.id, theatreId: t.id, start: s.start + offset }, `${day.name} ${s.id}→T${t.id}${offset >= 0 ? '+' : ''}${offset}`);
      }
    }
  }
}

// 2. Chains: 40 drags in a row per day (deterministic pseudo-random), earlier pins must hold.
let seed = 42;
const rand = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed % n);
for (const day of DAYS) {
  let schedule = week[day.index];
  for (let i = 0; i < 40; i++) {
    const s = schedule[rand(schedule.length)];
    const drag = { screeningId: s.id, theatreId: THEATRES[rand(6)].id, start: day.open + 5 * rand((day.close - day.open) / 5) };
    const r = checkDrag(day, schedule, drag, `${day.name} chain #${i}`);
    if (r.ok) schedule = r.schedule;
  }
}

console.log(`Re-plan: ${accepted} accepted, blocked: ${JSON.stringify(blockedBy)}`);
for (const kind of ['opening', 'closing', 'pinned', 'coverage', 'nightCrew']) {
  if (!blockedBy[kind]) problems.push(`no drag was blocked for ${kind}; that message is untested`);
  else console.log(`  e.g. ${kind}: ${sampleMessage[kind]}`);
}
for (const p of problems.slice(0, 15)) console.log('  ' + p);
if (problems.length) console.log(`Re-plan checks: FAIL (${problems.length} problems)`);
else console.log('Re-plan checks: PASS');

// 3. The demo drag: Sunday, a mid-afternoon screening from Theatre 1 to Theatre 3.
const sun = DAYS[0];
const demo = week[0].find((s) => s.theatreId === 1 && s.start >= 14 * 60 && s.start < 17 * 60)!;
const r = replan(sun, week[0], { screeningId: demo.id, theatreId: 3, start: demo.start });
const where = (p: { theatreId: number; start: number }) => `T${p.theatreId} ${fmt(p.start)}`;
const line = (c: Change) =>
  `${c.kind.padEnd(7)} ${movieById(c.movieId).title.padEnd(16)} ` +
  (c.kind === 'moved' ? `${where(c.from)} → ${where(c.to)}` : c.kind === 'added' ? `→ ${where(c.to)}` : `${where(c.from)} →`) +
  `  (${c.why.kind})`;
console.log(`\nDemo: ${movieById(demo.movieId).title} T1 ${fmt(demo.start)} → T3 ${fmt(demo.start)}`);
if (r.ok) {
  r.changes.forEach((c) => console.log('  ' + line(c)));
  console.log(`  ${r.changes.length} screenings changed · revenue change: ${r.revenueDelta >= 0 ? '+' : '−'}₪${Math.abs(r.revenueDelta).toLocaleString('en-US')}`);
} else console.log('  blocked: ' + r.message);

if (problems.length || !r.ok) process.exit(1);
