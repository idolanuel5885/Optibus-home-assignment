import { useState } from 'react';
import type { Change, DaySchedule, Drag, WeekSchedule } from './types.ts';
import { DAYS } from './data.ts';
import { generateWeek } from './engine/generate.ts';
import { replan } from './engine/replan.ts';
import Header from './ui/Header.tsx';
import DayTabs from './ui/DayTabs.tsx';
import Toolbar from './ui/Toolbar.tsx';
import Timeline from './ui/Timeline.tsx';

// One accepted drag. Undo restores `before`; later slices show `changes` and `revenueDelta`.
export interface HistoryEntry {
  day: number;
  drag: Drag;
  before: DaySchedule;
  after: DaySchedule;
  changes: Change[];
  revenueDelta: number;
}

export default function App() {
  // The engine's baseline; the revenue gap will be measured against it.
  const [baseline] = useState(generateWeek);
  const [week, setWeek] = useState<WeekSchedule>(baseline);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const day = DAYS[dayIndex];

  const setDay = (index: number, schedule: DaySchedule) => setWeek((w) => w.map((d, i) => (i === index ? schedule : d)));

  const onDrop = (drag: Drag) => {
    const before = week[dayIndex];
    const result = replan(day, before, drag);
    if (!result.ok) {
      console.info(result.message); // shown in the UI in slice 5
      return;
    }
    setDay(dayIndex, result.schedule);
    setHistory((h) => [...h, { day: dayIndex, drag, before, after: result.schedule, changes: result.changes, revenueDelta: result.revenueDelta }]);
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last) return;
    setDay(last.day, last.before);
    setHistory((h) => h.slice(0, -1));
    setDayIndex(last.day);
  };

  const reset = () => {
    if (!window.confirm("Reset to the engine's schedule? All changes and pins will be cleared.")) return;
    setWeek(baseline);
    setHistory([]);
  };

  return (
    <div className="app">
      <Header status="Draft" />
      <Toolbar canUndo={history.length > 0} onUndo={undo} onReset={reset} />
      <DayTabs selected={dayIndex} onSelect={setDayIndex} />
      <Timeline day={day} schedule={week[dayIndex]} onDrop={onDrop} />
    </div>
  );
}
