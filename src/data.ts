import type { Day, Movie, Theatre } from './types.ts';

export const SITE = 'Downtown, Tel Aviv';
export const WEEK_LABEL = 'Sun 6 – Sat 12 June 2027';
export const TICKET_PRICE = 45; // ₪, same in every theatre

export const THEATRES: Theatre[] = [
  { id: 1, seats: 320, premium: false, cleaning: 25 },
  { id: 2, seats: 240, premium: false, cleaning: 15 },
  { id: 3, seats: 180, premium: false, cleaning: 15 },
  { id: 4, seats: 180, premium: false, cleaning: 15 },
  { id: 5, seats: 90, premium: false, cleaning: 10 },
  { id: 6, seats: 60, premium: true, cleaning: 20 }, // 10 + 10 premium
];

export const MOVIES: Movie[] = [
  { id: 'gravity-well', title: 'Gravity Well', runtime: 148, demand: 9.4 },
  { id: 'last-ferry', title: 'The Last Ferry', runtime: 121, demand: 8.1 },
  { id: 'paper-lanterns', title: 'Paper Lanterns', runtime: 96, demand: 6.8 },
  { id: 'blue-hour', title: 'Blue Hour', runtime: 134, demand: 7.5 },
  { id: 'kibbutz-kids-3', title: 'Kibbutz Kids 3', runtime: 88, demand: 8.9 },
  { id: 'sonata', title: 'Sonata', runtime: 167, demand: 5.2 },
  { id: 'quiet-fleet', title: 'The Quiet Fleet', runtime: 112, demand: 7.0 },
  { id: 'marmalade', title: 'Marmalade', runtime: 84, demand: 6.1 },
];

export const REQUIRED_PER_DAY = 2; // coverage: every movie at least twice a day
export const NIGHT_CREW_FROM = 22 * 60; // cleanings starting at 22:00 or later use the single crew
export const START_STEP = 5; // start times on 5-minute steps

const WEEKDAY = { open: 11 * 60, close: 24 * 60 + 30 }; // 11:00–00:30
const WEEKEND = { open: 10 * 60, close: 25 * 60 + 30 }; // 10:00–01:30

export const DAYS: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, index) => {
  const weekend = index >= 5;
  return { index, name, date: `${6 + index} Jun`, weekend, ...(weekend ? WEEKEND : WEEKDAY) };
});

export const theatreById = (id: number): Theatre => THEATRES.find((t) => t.id === id)!;
export const movieById = (id: string): Movie => MOVIES.find((m) => m.id === id)!;

// The hard rules, as shown in "Rules enforced".
export const RULES: string[] = [
  'Every screening falls within opening hours and ends by closing time. A screening after midnight belongs to the previous day.',
  "Between two screenings in the same theatre: that theatre's cleaning time. The cleaning after the last screening of the day happens after closing.",
  "Night crew: any cleaning that starts at 22:00 or later is done by the site's single crew, one theatre at a time. Before 22:00, every theatre can be cleaned at once.",
  'Coverage: every movie plays at least twice each day.',
  'Start times are on 5-minute steps.',
];
