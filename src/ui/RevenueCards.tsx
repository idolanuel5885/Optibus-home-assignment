import { shekels, signedShekels } from './format.ts';

interface Props {
  dayLabel: string;
  loading: boolean; // numbers show ~~~ and blink until the new ones arrive
  today: { expected: number; gap: number };
  week: { expected: number; gap: number };
}

function Card({ label, expected, gap, loading }: { label: string; expected: number; gap: number; loading: boolean }) {
  return (
    <div className={`revenue-card${loading ? ' loading' : ''}`}>
      <span className="revenue-label">{label}</span>
      <span className="revenue-value">{loading ? '₪~~~' : shekels(expected)}</span>
      <span className="revenue-sub">expected revenue</span>
      <span className="revenue-gap">
        <strong>{loading ? '~~~' : signedShekels(gap)}</strong> compared with the engine's schedule
      </span>
    </div>
  );
}

export default function RevenueCards({ dayLabel, loading, today, week }: Props) {
  return (
    <div className="revenue-cards">
      <Card label={`Today · ${dayLabel}`} loading={loading} {...today} />
      <Card label="This week" loading={loading} {...week} />
    </div>
  );
}
