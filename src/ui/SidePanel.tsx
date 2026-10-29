import type { HistoryEntry, Screening } from '../types.ts';
import ScreeningReasons from './ScreeningReasons.tsx';
import ChangeHistory from './ChangeHistory.tsx';
import RulesList from './RulesList.tsx';

interface Props {
  selected?: Screening;
  history: HistoryEntry[]; // this day's drags, oldest first
  brokenRules: Set<number>; // rule numbers the day's schedule fails (from the validator)
  loading: boolean; // the schedule is about to change: the panel pulses
  detailsLoading: boolean; // a screening was just clicked: its reasons load briefly
}

export default function SidePanel({ selected, history, brokenRules, loading, detailsLoading }: Props) {
  return (
    <aside className={`side-panel${loading ? ' loading' : ''}`}>
      <section>
        <RulesList broken={brokenRules} />
      </section>
      <section>
        <h2>Why it's here</h2>
        {detailsLoading ? <p className="muted pulse">Loading the engine's reasons…</p> : <ScreeningReasons screening={selected} />}
      </section>
      <section>
        <h2>Changes to this day</h2>
        <ChangeHistory entries={history} />
      </section>
    </aside>
  );
}
