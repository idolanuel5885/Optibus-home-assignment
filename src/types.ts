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
  longName: string; // "Sunday"
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

// ---- Re-plan ----

export interface Drag {
  screeningId: string;
  theatreId: number;
  start: Minutes;
}

export interface Place {
  theatreId: number;
  start: Minutes;
}

// Why a screening changed in a re-plan. The UI formats these; it never invents them.
export type ChangeWhy =
  | { kind: 'dragged' }
  | { kind: 'madeRoom'; forId: string } // shifted later in its theatre to make room
  | { kind: 'movedToGap'; forId: string } // moved into the gap the dragged screening left
  | { kind: 'filledGap'; forId: string } // added in the gap the dragged screening left
  | { kind: 'nightCrew'; theatreId: number; until: Minutes } // shifted later to wait for the single night crew
  | { kind: 'noRoom'; forId: string }; // removed: no longer fits before closing

export type Change =
  | { kind: 'moved'; screeningId: string; movieId: string; from: Place; to: Place; why: ChangeWhy }
  | { kind: 'added'; screeningId: string; movieId: string; to: Place; why: ChangeWhy }
  | { kind: 'removed'; screeningId: string; movieId: string; from: Place; why: ChangeWhy };

export type BlockKind = 'opening' | 'closing' | 'pinned' | 'coverage' | 'nightCrew';

export type ReplanResult =
  | { ok: true; schedule: DaySchedule; changes: Change[]; revenueDelta: number }
  | { ok: false; block: BlockKind; message: string };

// One accepted drag. Undo restores `before`; the UI shows `changes` and `revenueDelta`.
export interface HistoryEntry {
  day: number;
  drag: Drag;
  before: DaySchedule;
  after: DaySchedule;
  changes: Change[];
  revenueDelta: number;
}
