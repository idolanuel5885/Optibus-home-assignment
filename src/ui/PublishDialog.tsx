import type { WeekSchedule } from '../types.ts';
import { DAYS } from '../data.ts';
import { countChanged, dayRevenue } from '../engine/changes.ts';
import { signedShekels } from './format.ts';
import Modal from './Modal.tsx';

interface Props {
  baseline: WeekSchedule;
  week: WeekSchedule;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PublishDialog({ baseline, week, onConfirm, onCancel }: Props) {
  const days = DAYS.map((d) => ({
    day: d,
    changed: countChanged(baseline[d.index], week[d.index]),
    gap: dayRevenue(week[d.index]) - dayRevenue(baseline[d.index]),
  }));
  const edited = days.filter((d) => d.changed > 0);
  const total = edited.reduce((n, d) => n + d.changed, 0);
  const weekGap = days.reduce((n, d) => n + d.gap, 0);
  return (
    <Modal title="Publish the week?" confirmLabel="Publish week" onConfirm={onConfirm} onCancel={onCancel}>
      <p>
        <strong>{total}</strong> {total === 1 ? 'screening' : 'screenings'} changed across the week, compared with the
        engine's schedule.
      </p>
      {edited.length === 0 ? (
        <p className="muted">No days were edited.</p>
      ) : (
        <table className="publish-days">
          <thead>
            <tr>
              <th>Edited day</th>
              <th>Screenings changed</th>
              <th>Compared with the engine</th>
            </tr>
          </thead>
          <tbody>
            {edited.map(({ day, changed, gap }) => (
              <tr key={day.index}>
                <td>
                  {day.name} {day.date}
                </td>
                <td>{changed}</td>
                <td>{signedShekels(gap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        Revenue compared with the engine's schedule: <strong>{signedShekels(weekGap)}</strong> this week.
      </p>
      <p className="muted">After publishing, the schedule is read-only.</p>
    </Modal>
  );
}
