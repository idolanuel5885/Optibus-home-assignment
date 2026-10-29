import { useState } from 'react';
import type { Review } from '../../useReview.ts';
import { DAYS } from '../../data.ts';
import { dayRevenue } from '../../engine/changes.ts';
import Header from '../Header.tsx';
import DayTabs from '../DayTabs.tsx';
import Toolbar from '../Toolbar.tsx';
import Timeline from '../Timeline.tsx';
import RevenueIndicator from '../RevenueIndicator.tsx';
import ChangeSummary from '../ChangeSummary.tsx';
import SidePanel from '../SidePanel.tsx';
import BlockedMessage from '../BlockedMessage.tsx';
import Modal from '../Modal.tsx';
import PublishDialog from '../PublishDialog.tsx';
import PublishedBanner from '../PublishedBanner.tsx';

export default function ReviewPage({ review, onEditRules }: { review: Review; onEditRules: () => void }) {
  const [dialog, setDialog] = useState<'reset' | 'publish'>();
  const { baseline, week, status, history, highlight, dayIndex, selectedId, blocked } = review;
  if (!baseline || !week) return null;

  const readOnly = status === 'Published';
  const day = DAYS[dayIndex];
  const selected = week[dayIndex].find((s) => s.id === selectedId);
  const shown = highlight?.day === dayIndex ? highlight : undefined;
  const todayGap = dayRevenue(week[dayIndex]) - dayRevenue(baseline[dayIndex]);
  const weekGap = week.reduce((sum, d, i) => sum + dayRevenue(d) - dayRevenue(baseline[i]), 0);

  return (
    <div className="page review-page">
      <Header status={status} />
      {readOnly && <PublishedBanner />}
      <div className="toolbar-row">
        <Toolbar
          readOnly={readOnly}
          canUndo={history.length > 0}
          onUndo={review.undo}
          onReset={() => setDialog('reset')}
          onPublish={() => setDialog('publish')}
        />
        <RevenueIndicator today={todayGap} week={weekGap} />
      </div>
      <DayTabs selected={dayIndex} onSelect={review.selectDay} />
      <div className="review">
        <div className="review-main">
          {blocked && <BlockedMessage message={blocked.message} onEditRules={onEditRules} onClose={review.closeBlocked} />}
          <div className="change-summary-slot">
            {shown && <ChangeSummary changes={shown.changes} revenueDelta={shown.revenueDelta} />}
          </div>
          <Timeline
            day={day}
            schedule={week[dayIndex]}
            changes={shown?.changes ?? []}
            readOnly={readOnly}
            selectedId={selectedId}
            refused={blocked}
            onSelect={(s) => review.select(s.id)}
            onDrop={review.drop}
          />
        </div>
        <SidePanel selected={selected} history={history.filter((h) => h.day === dayIndex)} />
      </div>

      {dialog === 'reset' && (
        <Modal
          title="Reset to the engine's schedule?"
          confirmLabel="Reset"
          onConfirm={() => {
            review.reset();
            setDialog(undefined);
          }}
          onCancel={() => setDialog(undefined)}
        >
          <p>All changes and pins across the week will be cleared.</p>
        </Modal>
      )}
      {dialog === 'publish' && (
        <PublishDialog
          baseline={baseline}
          week={week}
          onConfirm={() => {
            review.publish();
            setDialog(undefined);
          }}
          onCancel={() => setDialog(undefined)}
        />
      )}
    </div>
  );
}
