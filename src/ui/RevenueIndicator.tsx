import { signedShekels } from './format.ts';

export default function RevenueIndicator({ today, week }: { today: number; week: number }) {
  return (
    <div className="revenue-indicator">
      Compared with the engine's schedule: <strong>{signedShekels(today)}</strong> today ·{' '}
      <strong>{signedShekels(week)}</strong> this week
    </div>
  );
}
