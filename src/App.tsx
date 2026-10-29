import { useState } from 'react';
import { DAYS } from './data.ts';
import { generateWeek } from './engine/generate.ts';
import Header from './ui/Header.tsx';
import DayTabs from './ui/DayTabs.tsx';
import Timeline from './ui/Timeline.tsx';

export default function App() {
  // The engine's baseline; the revenue gap will be measured against it.
  const [baseline] = useState(generateWeek);
  const [week] = useState(() => structuredClone(baseline));
  const [dayIndex, setDayIndex] = useState(0);
  const day = DAYS[dayIndex];

  return (
    <div className="app">
      <Header status="Draft" />
      <DayTabs selected={dayIndex} onSelect={setDayIndex} />
      <Timeline day={day} schedule={week[dayIndex]} />
    </div>
  );
}
