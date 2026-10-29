import { useEffect, useState, type ReactNode } from 'react';
import { MOVIES, NIGHT_CREW_FROM, SITES, SUMMER_OVERRIDE, THEATRES, TICKET_PRICE, WEEKDAY_HOURS, WEEKEND_HOURS } from '../../data.ts';
import { fmt } from '../../time.ts';
import Modal from '../Modal.tsx';

export type SetupBox = 'cleaning';

const FAKE_LOADING_MS = 1200;
const hours = (h: { open: number; close: number }) => `${fmt(h.open)}–${fmt(h.close)}`;

interface BoxProps {
  id?: SetupBox;
  title: string;
  focused: boolean;
  onEdit: () => void;
  children: ReactNode;
}

function Box({ id, title, focused, onEdit, children }: BoxProps) {
  return (
    <section className={`setup-box${focused ? ' focused' : ''}`} id={id && `setup-${id}`}>
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

  const boxProps = (id?: SetupBox) => ({ focused: id !== undefined && focus === id, onEdit: () => setEditing(true) });

  return (
    <div className="page setup-page">
      <h1>Setup & Generate</h1>
      <p className="muted">The inputs the engine uses for the week of 6 June 2027.</p>

      <div className="setup-grid">
        <Box title="Sites" {...boxProps()}>
          <ul className="plain">
            {SITES.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                {!s.setUp && <span className="muted"> · not set up in this prototype</span>}
              </li>
            ))}
          </ul>
        </Box>

        <Box title="Theatres" {...boxProps()}>
          <table>
            <thead>
              <tr><th>#</th><th>Seats</th><th>Premium</th><th>Cleaning</th></tr>
            </thead>
            <tbody>
              {THEATRES.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td><td>{t.seats}</td><td>{t.premium ? 'Recliners' : '—'}</td><td>{t.cleaning} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box title="Movies" {...boxProps()}>
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

        <Box title="Hours" {...boxProps()}>
          <table>
            <tbody>
              <tr><td>Sun–Thu</td><td>{hours(WEEKDAY_HOURS)}</td></tr>
              <tr><td>Fri–Sat</td><td>{hours(WEEKEND_HOURS)}</td></tr>
              <tr className="muted">
                <td>Summer ({SUMMER_OVERRIDE.months})</td>
                <td>{hours(SUMMER_OVERRIDE)} every day · not active for this week</td>
              </tr>
            </tbody>
          </table>
          <p className="small muted">A screening after midnight belongs to the previous day and must end by closing.</p>
        </Box>

        <Box id="cleaning" title="Cleaning and crew rules" {...boxProps('cleaning')}>
          <table>
            <tbody>
              {THEATRES.map((t) => (
                <tr key={t.id}>
                  <td>{t.seats} seats</td>
                  <td>{t.premium ? `${t.cleaning} min (10 + 10 premium)` : `${t.cleaning} min`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small">
            Single night crew: cleanings starting at {fmt(NIGHT_CREW_FROM)} or later, one theatre at a time. Before{' '}
            {fmt(NIGHT_CREW_FROM)}, all theatres in parallel.
          </p>
        </Box>

        <Box title="Ticket price" {...boxProps()}>
          <p className="price">₪{TICKET_PRICE}</p>
          <p className="small muted">
            Same in every theatre. Expected revenue = (demand ÷ 10) × seats × ₪{TICKET_PRICE}.
          </p>
        </Box>
      </div>

      <div className="generate-bar">
        <button className="primary big" disabled={loading || generated} onClick={() => setLoading(true)}>
          {loading ? 'Generating…' : 'Generate schedule for the week of 6 June'}
        </button>
        {loading && <div className="spinner" aria-label="Generating" />}
        {generated && <span className="muted">Generated. Use Reset in Review to go back to the engine's schedule.</span>}
      </div>

      {editing && (
        <Modal title="Edit" onCancel={() => setEditing(false)}>
          <p>Editing is not available in this prototype.</p>
        </Modal>
      )}
    </div>
  );
}
