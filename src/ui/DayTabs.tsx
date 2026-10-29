import { DAYS } from '../data.ts';
import { fmt } from '../time.ts';

interface Props {
  selected: number;
  disabled: boolean; // while loading
  onSelect: (i: number) => void;
}

export default function DayTabs({ selected, disabled, onSelect }: Props) {
  return (
    <nav className="day-tabs">
      {DAYS.map((d) => (
        <button
          key={d.index}
          className={`day-tab${d.index === selected ? ' selected' : ''}${d.weekend ? ' weekend' : ''}`}
          disabled={disabled}
          onClick={() => onSelect(d.index)}
        >
          <span className="day-name">
            {d.name} {d.date}
          </span>
          <span className="day-hours">
            {fmt(d.open)}–{fmt(d.close)}
          </span>
          {d.weekend && <span className="weekend-tag">Weekend</span>}
        </button>
      ))}
    </nav>
  );
}
