import { useState } from 'react';
import type { DaySchedule, Drag, HistoryEntry, WeekSchedule } from './types.ts';
import { DAYS } from './data.ts';
import { generateWeek } from './engine/generate.ts';
import { replan } from './engine/replan.ts';
import { dayRevenue } from './engine/changes.ts';
import Header from './ui/Header.tsx';
import DayTabs from './ui/DayTabs.tsx';
import Toolbar from './ui/Toolbar.tsx';
import Timeline from './ui/Timeline.tsx';
import RevenueIndicator from './ui/RevenueIndicator.tsx';
import ChangeSummary from './ui/ChangeSummary.tsx';
import SidePanel from './ui/SidePanel.tsx';
import BlockedMessage from './ui/BlockedMessage.tsx';

export default function App() {
  // The engine's baseline; the revenue gap will be measured against it.
  const [baseline] = useState(generateWeek);
  const [week, setWeek] = useState<WeekSchedule>(baseline);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // The last drag, highlighted until the next action (drag, undo, reset). A blocked drag keeps it.
  const [highlight, setHighlight] = useState<HistoryEntry>();
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  // The last blocked drag's message, until the next drag, undo, reset, day switch or close.
  const [blocked, setBlocked] = useState<{ message: string; screeningId: string; nonce: number }>();
  const day = DAYS[dayIndex];
  const selected = week[dayIndex].find((s) => s.id === selectedId);
  const selectDay = (index: number) => {
    setDayIndex(index);
    setSelectedId(undefined);
    setBlocked(undefined);
  };
  const shown = highlight?.day === dayIndex ? highlight : undefined;

  const todayGap = dayRevenue(week[dayIndex]) - dayRevenue(baseline[dayIndex]);
  const weekGap = week.reduce((sum, d, i) => sum + dayRevenue(d) - dayRevenue(baseline[i]), 0);

  const setDay = (index: number, schedule: DaySchedule) => setWeek((w) => w.map((d, i) => (i === index ? schedule : d)));

  const onDrop = (drag: Drag) => {
    const before = week[dayIndex];
    const result = replan(day, before, drag);
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
    if (!last) return;
    setDay(last.day, last.before);
    setHistory((h) => h.slice(0, -1));
    setHighlight(undefined);
    setBlocked(undefined);
    if (last.day !== dayIndex) selectDay(last.day);
  };

  const reset = () => {
    if (!window.confirm("Reset to the engine's schedule? All changes and pins will be cleared.")) return;
    setWeek(baseline);
    setHistory([]);
    setHighlight(undefined);
    setBlocked(undefined);
  };

  return (
    <div className="app">
      <Header status="Draft" />
      <div className="toolbar-row">
        <Toolbar canUndo={history.length > 0} onUndo={undo} onReset={reset} />
        <RevenueIndicator today={todayGap} week={weekGap} />
      </div>
      <DayTabs selected={dayIndex} onSelect={selectDay} />
      <div className="review">
        <div className="review-main">
          {blocked && <BlockedMessage message={blocked.message} onClose={() => setBlocked(undefined)} />}
          <div className="change-summary-slot">
            {shown && <ChangeSummary changes={shown.changes} revenueDelta={shown.revenueDelta} />}
          </div>
          <Timeline
            day={day}
            schedule={week[dayIndex]}
            changes={shown?.changes ?? []}
            selectedId={selectedId}
            refused={blocked}
            onSelect={(s) => setSelectedId(s.id)}
            onDrop={onDrop}
          />
        </div>
        <SidePanel selected={selected} history={history.filter((h) => h.day === dayIndex)} />
      </div>
    </div>
  );
}
