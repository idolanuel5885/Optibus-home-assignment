import { shekels, signedShekels } from './format.ts';

interface Props {
  dayLabel: string;
  today: { expected: number; gap: number };
  week: { expected: number; gap: number };
}

function Card({ label, expected, gap }: { label: string; expected: number; gap: number }) {
  return (
    <div className="revenue-card">
      <span className="revenue-label">{label}</span>
      <span className="revenue-value">{shekels(expected)}</span>
      <span className="revenue-sub">expected revenue</span>
      <span className="revenue-gap">
        <strong>{signedShekels(gap)}</strong> compared with the engine's schedule
      </span>
    </div>
  );
}

export default function RevenueCards({ dayLabel, today, week }: Props) {
  return (
    <div className="revenue-cards">
      <Card label={`Today · ${dayLabel}`} {...today} />
      <Card label="This week" {...week} />
    </div>
  );
}
