import type { Day, DaySchedule } from '../types.ts';
import { THEATRES, movieById } from '../data.ts';
import { fmt } from '../time.ts';
import { movieColor } from './colors.ts';
import './Timeline.css';

const PX_PER_MIN = 1.5;
const PAST_CLOSE = 40; // minutes shown after closing, for the end-of-night cleaning

export default function Timeline({ day, schedule }: { day: Day; schedule: DaySchedule }) {
  const from = day.open;
  const to = day.close + PAST_CLOSE;
  const x = (m: number) => (m - from) * PX_PER_MIN;
  const width = x(to);
  const hours: number[] = [];
  for (let h = Math.ceil(from / 60) * 60; h <= to; h += 60) hours.push(h);

  return (
    <div className="timeline">
      <div className="tl-grid" style={{ width: `calc(var(--label-w) + ${width}px)` }}>
        <div className="tl-scale">
          {hours.map((h) => (
            <span key={h} className="tl-hour" style={{ left: x(h) }}>
              {fmt(h)}
            </span>
          ))}
        </div>
        {THEATRES.map((t) => {
          const row = schedule.filter((s) => s.theatreId === t.id);
          return (
            <div key={t.id} className="tl-row">
              <div className="tl-label">
                <strong>Theatre {t.id}</strong>
                <span>
                  {t.seats} seats{t.premium ? ' · premium' : ''}
                </span>
              </div>
              <div className="tl-lane">
                {hours.map((h) => (
                  <div key={h} className="tl-hour-line" style={{ left: x(h) }} />
                ))}
                {row.map((s) => {
                  const m = movieById(s.movieId);
                  const afterClose = s.cleaning.start >= day.close;
                  return (
                    <div key={s.id}>
                      <div
                        className="tl-block"
                        style={{ left: x(s.start), width: x(s.end) - x(s.start), background: movieColor(m.id) }}
                        title={`${m.title} ${fmt(s.start)}–${fmt(s.end)}`}
                      >
                        <span className="tl-title">{m.title}</span>
                        <span className="tl-time">
                          {fmt(s.start)}–{fmt(s.end)}
                        </span>
                      </div>
                      <div
                        className={`tl-cleaning${afterClose ? ' after-close' : ''}${s.cleaning.crew ? ' crew' : ''}`}
                        style={{ left: x(s.cleaning.start), width: x(s.cleaning.end) - x(s.cleaning.start) }}
                        title={`Cleaning ${fmt(s.cleaning.start)}–${fmt(s.cleaning.end)}${s.cleaning.crew ? ' (night crew)' : ''}${afterClose ? ' (after closing)' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="tl-close" style={{ left: `calc(var(--label-w) + ${x(day.close)}px)` }}>
          <span>Closing {fmt(day.close)}</span>
        </div>
      </div>
    </div>
  );
}
