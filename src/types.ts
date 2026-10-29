// Times are minutes from the day's midnight. After-midnight times run past 1440 (00:30 = 1470).
export type Minutes = number;

export interface Theatre {
  id: number;
  seats: number;
  premium: boolean;
  cleaning: Minutes;
}

export interface Movie {
  id: string;
  title: string;
  runtime: Minutes;
  demand: number; // 1–10
}

export interface Day {
  index: number; // 0 = Sun … 6 = Sat
  name: string; // "Sun"
  date: string; // "6 Jun"
  weekend: boolean;
  open: Minutes;
  close: Minutes;
}

// Structured reasons from the engine. The UI formats them; it never invents them.
export type Reason =
  | { kind: 'coverage'; movieId: string; n: number; of: number }
  | { kind: 'revenue'; amount: number; demand: number; seats: number }
  | { kind: 'cleaningWait'; theatreId: number; minutes: Minutes }
  | { kind: 'crewWait'; theatreId: number; until: Minutes }
  | { kind: 'pinned' };

// The cleaning that follows a screening in its theatre.
export interface Cleaning {
  start: Minutes;
  end: Minutes;
  crew: boolean; // done by the single night crew (starts at 22:00 or later, not the end-of-night cleaning)
}

export interface Screening {
  id: string;
  day: number;
  theatreId: number;
  movieId: string;
  start: Minutes;
  end: Minutes;
  cleaning: Cleaning;
  pinned: boolean;
  reasons: Reason[];
}

export type DaySchedule = Screening[];
export type WeekSchedule = DaySchedule[]; // indexed by Day.index
