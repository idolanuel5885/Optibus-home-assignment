// The review session's state and actions, held above the pages so leaving Review keeps edits.
import { useState } from 'react';
import type { DaySchedule, Drag, HistoryEntry, WeekSchedule } from './types.ts';
import { DAYS } from './data.ts';
import { generateWeek } from './engine/generate.ts';
import { replan } from './engine/replan.ts';

export type Status = 'Draft' | 'Published';

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
  // The last blocked drag's message, until the next drag, undo, reset, day switch or close.
  const [blocked, setBlocked] = useState<{ message: string; screeningId: string; nonce: number }>();

  const selectDay = (index: number) => {
    setDayIndex(index);
    setSelectedId(undefined);
    setBlocked(undefined);
  };

  const setDay = (index: number, schedule: DaySchedule) => setWeek((w) => w!.map((d, i) => (i === index ? schedule : d)));

  const generate = () => {
    const generated = generateWeek();
    setBaseline(generated);
    setWeek(generated);
    selectDay(0);
  };

  const drop = (drag: Drag) => {
    if (!week || status === 'Published') return;
    const before = week[dayIndex];
    const result = replan(DAYS[dayIndex], before, drag);
    if (!result.ok) {
      setBlocked((b) => ({ message: result.message, screeningId: drag.screeningId, nonce: (b?.nonce ?? 0) + 1 }));
      return;
    }
    setBlocked(undefined);
    const entry = { day: dayIndex, drag, before, after: result.schedule, changes: result.changes, revenueDelta: result.revenueDelta };
    setDay(dayIndex, result.schedule);
    setHistory((h) => [...h, entry]);
    setHighlight(entry);
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last || status === 'Published') return;
    setDay(last.day, last.before);
    setHistory((h) => h.slice(0, -1));
    setHighlight(undefined);
    setBlocked(undefined);
    if (last.day !== dayIndex) selectDay(last.day);
  };

  const reset = () => {
    if (status === 'Published') return;
    setWeek(baseline);
    setHistory([]);
    setHighlight(undefined);
    setBlocked(undefined);
  };

  const publish = () => {
    setStatus('Published');
    setHighlight(undefined);
    setBlocked(undefined);
  };

  return {
    baseline, week, status, history, highlight, dayIndex, selectedId, blocked,
    selectDay, select: setSelectedId, closeBlocked: () => setBlocked(undefined),
    generate, drop, undo, reset, publish,
  };
}

export type Review = ReturnType<typeof useReview>;
