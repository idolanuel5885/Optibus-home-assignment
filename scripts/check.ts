// npm run check — generates the week and validates every day against the five rules.
import { DAYS } from '../src/data.ts';
import { generateWeek } from '../src/engine/generate.ts';
import { revenue } from '../src/engine/rules.ts';
import { validateDay } from '../src/engine/validate.ts';
import { movieById, theatreById } from '../src/data.ts';

const week = generateWeek();
let failed = false;

for (const day of DAYS) {
  const schedule = week[day.index];
  const violations = validateDay(day, schedule);
  const total = schedule.reduce((sum, s) => sum + revenue(movieById(s.movieId), theatreById(s.theatreId)), 0);
  const crew = schedule.filter((s) => s.cleaning.crew).length;
  console.log(
    `${day.name} ${day.date}  ${String(schedule.length).padStart(2)} screenings  ${String(crew).padStart(2)} crew cleanings  ₪${total.toLocaleString('en-US').padStart(9)}  ${violations.length ? 'FAIL' : 'PASS'}`,
  );
  for (const x of violations) console.log(`    rule ${x.rule}: ${x.message}`);
  if (violations.length) failed = true;
}

// The validator must catch each rule: break a copy of Friday five ways.
const fri = DAYS[5];
const broken: [number, (s: typeof week[number]) => void][] = [
  [1, (s) => { const x = s.at(-1)!; const by = fri.close - x.end + 5; x.start += by; x.end += by; }],
  [2, (s) => { const row = s.filter((x) => x.theatreId === 1); row[1].start -= 5; row[1].end -= 5; }],
  [3, (s) => { const [a, b] = s.filter((x) => x.cleaning.crew); b.cleaning = { ...a.cleaning }; }],
  [4, (s) => { s.splice(s.findIndex((x) => x.movieId === 'sonata'), 1); }],
  [5, (s) => { s[0].start += 1; s[0].end += 1; }],
];
for (const [rule, breakIt] of broken) {
  const copy = structuredClone(week[fri.index]);
  breakIt(copy);
  const caught = validateDay(fri, copy).some((x) => x.rule === rule);
  console.log(`Validator catches a rule ${rule} break: ${caught ? 'PASS' : 'FAIL'}`);
  if (!caught) failed = true;
}

const deterministic = JSON.stringify(generateWeek()) === JSON.stringify(week);
console.log(`Deterministic: ${deterministic ? 'PASS' : 'FAIL'}`);
if (!deterministic || failed) process.exit(1);
