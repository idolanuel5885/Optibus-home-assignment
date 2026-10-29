// The review session's state and actions, held above the pages so leaving Review keeps edits.
// Every action runs through a short simulated loading state before its result is applied.
import { useEffect, useRef, useState } from 'react';
import type { DaySchedule, Drag, HistoryEntry, WeekSchedule } from './types.ts';
import { DAYS } from './data.ts';
import { generateWeek } from './engine/generate.ts';
import { replan } from './engine/replan.ts';
import { LOADING_MS } from './ui/loading.ts';

export type Status = 'Draft' | 'Published';

export interface Pending {
  message: string;
  day?: number; // the day being switched to, shown as selected while loading
}

export function useReview() {
  // The engine's baseline; the revenue gap is measured against it. Undefined until generated.
  const [baseline, setBaseline] = useState<WeekSchedule>();
  const [week, setWeek] = useState<WeekSchedule>();
  const [status, setStatus] = useState<Status>('Draft');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // The last drag, highlighted until the next action (drag, undo, reset). A blocked drag keeps it.
  const [highlight, setHighlight] = useState<HistoryEntry>();
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [detailsLoading, setDetailsLoading] = useState(false);
  // The last blocked drag's message, until the next drag, undo, reset, day switch or close.
  const [blocked, setBlocked] = useState<{ message: string; screeningId: string; nonce: number }>();
  const [pending, setPending] = useState<Pending>();
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const after = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  // Show `p` for `ms`, then apply. Ignored while another action is loading.
  const withLoading = (p: Pending, ms: number, apply: () => void) => {
    if (pending) return;
    setPending(p);
    after(ms, () => {
      setPending(undefined);
      apply();
    });
  };

  const showDay = (index: number) => {
    setDayIndex(index);
    setSelectedId(undefined);
    setBlocked(undefined);
  };

  const selectDay = (index: number) => {
    if (index === dayIndex) return;
    withLoading({ message: `Loading ${DAYS[index].longName}'s schedule…`, day: index }, LOADING_MS.day, () => showDay(index));
  };

  const select = (id: string) => {
    setSelectedId(id);
    setDetailsLoading(true);
    after(LOADING_MS.details, () => setDetailsLoading(false));
  };

  const setDay = (index: number, schedule: DaySchedule) => setWeek((w) => w!.map((d, i) => (i === index ? schedule : d)));

  const generate = () => {
    const generated = generateWeek();
    setBaseline(generated);
    setWeek(generated);
    showDay(0);
  };

  const drop = (drag: Drag) => {
    if (!week || status === 'Published' || pending) return;
    const before = week[dayIndex];
    const result = replan(DAYS[dayIndex], before, drag);
    if (!result.ok) {
      withLoading({ message: 'Checking your change against the rules…' }, LOADING_MS.blocked, () =>
        setBlocked((b) => ({ message: result.message, screeningId: drag.screeningId, nonce: (b?.nonce ?? 0) + 1 })),
      );
      return;
    }
    const entry = { day: dayIndex, drag, before, after: result.schedule, changes: result.changes, revenueDelta: result.revenueDelta };
    withLoading({ message: 'Rearranging the schedule to fit your change…' }, LOADING_MS.replan, () => {
      setBlocked(undefined);
      setDay(entry.day, entry.after);
      setHistory((h) => [...h, entry]);
      setHighlight(entry);
    });
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last || status === 'Published') return;
    withLoading({ message: 'Undoing the last change…', day: last.day }, LOADING_MS.undo, () => {
      setDay(last.day, last.before);
      setHistory((h) => h.slice(0, -1));
      setHighlight(undefined);
      setBlocked(undefined);
      if (last.day !== dayIndex) showDay(last.day);
    });
  };

  const reset = () => {
    if (status === 'Published') return;
    withLoading({ message: "Restoring the engine's schedule…" }, LOADING_MS.reset, () => {
      setWeek(baseline);
      setHistory([]);
      setHighlight(undefined);
      setBlocked(undefined);
    });
  };

  const publish = () => {
    withLoading({ message: 'Publishing the week…' }, LOADING_MS.publish, () => {
      setStatus('Published');
      setHighlight(undefined);
      setBlocked(undefined);
    });
  };

  return {
    baseline, week, status, history, highlight, dayIndex, selectedId, detailsLoading, blocked, pending,
    selectDay, select, closeBlocked: () => setBlocked(undefined),
    generate, drop, undo, reset, publish,
  };
}

export type Review = ReturnType<typeof useReview>;
