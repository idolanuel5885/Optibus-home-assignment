import type { Change, Day, DaySchedule, Drag, Screening } from '../types.ts';
import { THEATRES, movieById } from '../data.ts';
import { fmt } from '../time.ts';
import { movieColor } from './colors.ts';
import { useDrag } from './useDrag.ts';
import './Timeline.css';

const PX_PER_MIN = 1.5;
const PAST_CLOSE = 40; // minutes shown after closing, for the end-of-night cleaning

interface Props {
  day: Day;
  schedule: DaySchedule;
  changes: Change[]; // the last drag's changes on this day, to highlight; empty when none
  selectedId?: string;
  onSelect: (s: Screening) => void;
  onDrop: (drag: Drag) => void;
}

export default function Timeline({ day, schedule, changes, selectedId, onSelect, onDrop }: Props) {
  const highlighted = new Set(changes.filter((c) => c.kind !== 'removed').map((c) => c.screeningId));
  const ghosts = changes.flatMap((c) => (c.kind === 'added' ? [] : [{ ...c.from, movieId: c.movieId, removed: c.kind === 'removed' }]));
  const { active, blockHandlers, laneRef } = useDrag(PX_PER_MIN, onDrop, onSelect);
  const dragged = active && movieById(active.origin.movieId);
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
              <div className="tl-lane" ref={laneRef(t.id)}>
                {hours.map((h) => (
                  <div key={h} className="tl-hour-line" style={{ left: x(h) }} />
                ))}
                {ghosts
                  .filter((g) => g.theatreId === t.id)
                  .map((g) => {
                    const m = movieById(g.movieId);
                    return (
                      <div
                        key={`ghost-${g.movieId}-${g.start}`}
                        className={`tl-ghost${g.removed ? ' removed' : ''}`}
                        style={{ left: x(g.start), width: m.runtime * PX_PER_MIN, borderColor: movieColor(m.id) }}
                        title={`${g.removed ? 'Removed' : 'Was here'}: ${m.title} ${fmt(g.start)}–${fmt(g.start + m.runtime)}`}
                      >
                        <span className="tl-title">{m.title}</span>
                        <span className="tl-time">
                          {g.removed ? 'removed · ' : ''}
                          {fmt(g.start)}–{fmt(g.start + m.runtime)}
                        </span>
                      </div>
                    );
                  })}
                {row.map((s) => {
                  const m = movieById(s.movieId);
                  const afterClose = s.cleaning.start >= day.close;
                  return (
                    <div key={s.id}>
                      <div
                        className={`tl-block${active?.screeningId === s.id ? ' dragging' : ''}${highlighted.has(s.id) ? ' changed' : ''}${selectedId === s.id ? ' selected' : ''}`}
                        {...blockHandlers(s)}
                        style={{ left: x(s.start), width: x(s.end) - x(s.start), background: movieColor(m.id) }}
                        title={`${m.title} ${fmt(s.start)}–${fmt(s.end)}`}
                      >
                        <span className="tl-title">{m.title}</span>
                        <span className="tl-time">
                          {fmt(s.start)}–{fmt(s.end)}
                        </span>
                        {s.pinned && (
                          <span className="tl-pin" title="Pinned by the admin">
                            📌
                          </span>
                        )}
                      </div>
                      <div
                        className={`tl-cleaning${afterClose ? ' after-close' : ''}${s.cleaning.crew ? ' crew' : ''}`}
                        style={{ left: x(s.cleaning.start), width: x(s.cleaning.end) - x(s.cleaning.start) }}
                        title={`Cleaning ${fmt(s.cleaning.start)}–${fmt(s.cleaning.end)}${s.cleaning.crew ? ' (night crew)' : ''}${afterClose ? ' (after closing)' : ''}`}
                      />
                    </div>
                  );
                })}
                {active && dragged && active.theatreId === t.id && (
                  <div
                    className="tl-preview"
                    style={{ left: x(active.start), width: dragged.runtime * PX_PER_MIN, borderColor: movieColor(dragged.id) }}
                  >
                    <span className="tl-title">{dragged.title}</span>
                    <span className="tl-time">
                      {fmt(active.start)}–{fmt(active.start + dragged.runtime)}
                    </span>
                  </div>
                )}
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
