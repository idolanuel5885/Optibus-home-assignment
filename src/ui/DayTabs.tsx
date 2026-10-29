import { DAYS } from '../data.ts';
import { fmt } from '../time.ts';

export default function DayTabs({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  return (
    <nav className="day-tabs">
      {DAYS.map((d) => (
        <button
          key={d.index}
          className={`day-tab${d.index === selected ? ' selected' : ''}${d.weekend ? ' weekend' : ''}`}
          onClick={() => onSelect(d.index)}
        >
          <span className="day-name">
            {d.name} {d.date}
            {d.weekend && <span className="weekend-tag">Weekend</span>}
          </span>
          <span className="day-hours">
            {fmt(d.open)}–{fmt(d.close)}
          </span>
        </button>
      ))}
    </nav>
  );
}
