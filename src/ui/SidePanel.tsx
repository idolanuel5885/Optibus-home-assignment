import type { HistoryEntry, Screening } from '../types.ts';
import ScreeningReasons from './ScreeningReasons.tsx';
import ChangeHistory from './ChangeHistory.tsx';
import RulesList from './RulesList.tsx';

interface Props {
  selected?: Screening;
  history: HistoryEntry[]; // this day's drags, oldest first
}

export default function SidePanel({ selected, history }: Props) {
  return (
    <aside className="side-panel">
      <section>
        <h2>Why it's here</h2>
        <ScreeningReasons screening={selected} />
      </section>
      <section>
        <h2>Changes to this day</h2>
        <ChangeHistory entries={history} />
      </section>
      <section>
        <RulesList />
      </section>
    </aside>
  );
}
