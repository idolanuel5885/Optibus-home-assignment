import { useEffect, type ReactNode } from 'react';
import { MOVIES, NIGHT_CREW_FROM, SITES, SUMMER_OVERRIDE, THEATRES, TICKET_PRICE, WEEKDAY_HOURS, WEEKEND_HOURS } from '../../data.ts';
import { fmt } from '../../time.ts';

export type SetupSection = 'cleaning';

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section className="setup-section" id={id}>
      <h2>{title}</h2>
      {children}
      <p className="setup-note">Editing would happen here.</p>
    </section>
  );
}

const hours = (h: { open: number; close: number }) => `${fmt(h.open)}–${fmt(h.close)}`;

export default function SetupPage({ focus }: { focus?: SetupSection }) {
  useEffect(() => {
    if (focus) document.getElementById(`setup-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus]);

  return (
    <div className="page setup-page">
      <h1>Setup</h1>
      <p className="muted">The inputs the engine uses. Read-only in this prototype.</p>

      <Section title="Sites">
        <ul className="plain">
          {SITES.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> {s.setUp ? '· set up' : <span className="muted">· not set up in this prototype</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Theatres">
        <table>
          <thead>
            <tr><th>Theatre</th><th>Seats</th><th>Premium</th><th>Cleaning</th></tr>
          </thead>
          <tbody>
            {THEATRES.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td><td>{t.seats}</td><td>{t.premium ? 'Recliners' : '—'}</td><td>{t.cleaning} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Movies">
        <table>
          <thead>
            <tr><th>Title</th><th>Runtime</th><th>Demand (1–10)</th></tr>
          </thead>
          <tbody>
            {MOVIES.map((m) => (
              <tr key={m.id}>
                <td>{m.title}</td><td>{m.runtime} min</td><td>{m.demand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Hours">
        <table>
          <tbody>
            <tr><td>Sun–Thu</td><td>{hours(WEEKDAY_HOURS)}</td><td /></tr>
            <tr><td>Fri–Sat</td><td>{hours(WEEKEND_HOURS)}</td><td /></tr>
            <tr className="muted">
              <td>Summer override ({SUMMER_OVERRIDE.months})</td><td>{hours(SUMMER_OVERRIDE)} every day</td><td>Not active for this week</td>
            </tr>
          </tbody>
        </table>
        <p className="muted">A screening after midnight belongs to the previous day. A screening must end by closing time.</p>
      </Section>

      <Section id="setup-cleaning" title="Cleaning and crew rules">
        <table>
          <thead>
            <tr><th>Theatre size</th><th>Cleaning between screenings</th></tr>
          </thead>
          <tbody>
            {THEATRES.map((t) => (
              <tr key={t.id}>
                <td>{t.seats} seats (Theatre {t.id})</td>
                <td>{t.premium ? `${t.cleaning} min (10 + 10 premium)` : `${t.cleaning} min`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Night crew: any cleaning that starts at {fmt(NIGHT_CREW_FROM)} or later is done by the site's single crew, one
          theatre at a time. Before {fmt(NIGHT_CREW_FROM)}, every theatre can be cleaned at once. The cleaning after the
          last screening happens after closing.
        </p>
      </Section>

      <Section title="Ticket price">
        <p>
          ₪{TICKET_PRICE}, the same in every theatre. Expected revenue per screening = (demand ÷ 10) × seats × ₪{TICKET_PRICE}.
        </p>
      </Section>
    </div>
  );
}
