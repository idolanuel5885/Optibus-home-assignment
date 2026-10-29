import { useEffect, useState, type ReactNode } from 'react';
import { MOVIES, NIGHT_CREW_FROM, SITES, SUMMER_OVERRIDE, THEATRES, TICKET_PRICE, WEEKDAY_HOURS, WEEKEND_HOURS } from '../../data.ts';
import { fmt } from '../../time.ts';
import Modal from '../Modal.tsx';

export type SetupBox = 'theatres';

const FAKE_LOADING_MS = 1200;
const hours = (h: { open: number; close: number }) => `${fmt(h.open)}–${fmt(h.close)}`;

interface BoxProps {
  area: string; // grid area
  title: string;
  focused?: boolean;
  onEdit: () => void;
  children: ReactNode;
}

function Box({ area, title, focused, onEdit, children }: BoxProps) {
  return (
    <section className={`setup-box${focused ? ' focused' : ''}`} id={`setup-${area}`} style={{ gridArea: area }}>
      <header>
        <h2>{title}</h2>
        <a
          href="#"
          className="edit-link"
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
        >
          Edit
        </a>
      </header>
      {children}
    </section>
  );
}

interface Props {
  focus?: SetupBox; // scroll to and mark this box (from "Edit rules")
  generated: boolean;
  onGenerate: () => void;
}

export default function SetupGeneratePage({ focus, generated, onGenerate }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const onEdit = () => setEditing(true);

  useEffect(() => {
    if (focus) document.getElementById(`setup-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focus]);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      setLoading(false);
      onGenerate();
    }, FAKE_LOADING_MS);
    return () => clearTimeout(t);
  }, [loading, onGenerate]);

  return (
    <div className="page setup-page">
      <h1>Setup & Generate</h1>
      <p className="muted">The inputs the engine uses for the week of June 6th, 2027.</p>

      <div className="setup-grid">
        <Box area="theatres" title="Theatres" focused={focus === 'theatres'} onEdit={onEdit}>
          <table>
            <thead>
              <tr><th>Theatre</th><th>Seats</th><th>Premium</th><th>Cleaning</th></tr>
            </thead>
            <tbody>
              {THEATRES.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.seats}</td>
                  <td>{t.premium ? 'Recliners' : '—'}</td>
                  <td>{t.premium ? `${t.cleaning} min (10 + 10 premium)` : `${t.cleaning} min`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="box-note">
            Night crew: any cleaning that starts at {fmt(NIGHT_CREW_FROM)} or later is done by the site's single crew, one
            theatre at a time. Before {fmt(NIGHT_CREW_FROM)}, all theatres can be cleaned at once.
          </p>
        </Box>

        <Box area="movies" title="Movies" onEdit={onEdit}>
          <table>
            <thead>
              <tr><th>Title</th><th>Runtime</th><th>Demand</th></tr>
            </thead>
            <tbody>
              {MOVIES.map((m) => (
                <tr key={m.id}>
                  <td>{m.title}</td><td>{m.runtime} min</td><td>{m.demand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box area="sites" title="Sites" onEdit={onEdit}>
          <ul className="plain">
            {SITES.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                {!s.setUp && <span className="muted"> · not set up in this prototype</span>}
              </li>
            ))}
          </ul>
        </Box>

        <Box area="hours" title="Hours" onEdit={onEdit}>
          <table>
            <tbody>
              <tr><td>Sun–Thu</td><td>{hours(WEEKDAY_HOURS)}</td></tr>
              <tr><td>Fri–Sat</td><td>{hours(WEEKEND_HOURS)}</td></tr>
              <tr className="muted">
                <td>Summer ({SUMMER_OVERRIDE.months})</td>
                <td>{hours(SUMMER_OVERRIDE)} daily · not active for this week</td>
              </tr>
            </tbody>
          </table>
          <p className="box-note">A screening after midnight belongs to the previous day and must end by closing.</p>
        </Box>

        <Box area="price" title="Ticket price" onEdit={onEdit}>
          <p className="price">₪{TICKET_PRICE}</p>
          <p className="box-note">Same in every theatre. Expected revenue = (demand ÷ 10) × seats × ₪{TICKET_PRICE}.</p>
        </Box>

        <div className="generate-bar">
          <button className="primary big" disabled={loading || generated} onClick={() => setLoading(true)}>
            {loading ? 'Generating…' : 'Generate schedule for the week of June 6th'}
          </button>
          {loading && <div className="spinner" aria-label="Generating" />}
          {generated && <span className="muted">Generated. Use Reset in Review to go back to the engine's schedule.</span>}
        </div>
      </div>

      {editing && (
        <Modal title="Edit" onCancel={() => setEditing(false)}>
          <p>Editing is not available in this prototype.</p>
        </Modal>
      )}
    </div>
  );
}
