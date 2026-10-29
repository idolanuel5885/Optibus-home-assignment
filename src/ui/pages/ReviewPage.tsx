import { useState } from 'react';
import type { Review } from '../../useReview.ts';
import { DAYS } from '../../data.ts';
import { dayRevenue } from '../../engine/changes.ts';
import { validateDay } from '../../engine/validate.ts';
import Header from '../Header.tsx';
import DayTabs from '../DayTabs.tsx';
import Toolbar from '../Toolbar.tsx';
import Timeline from '../Timeline.tsx';
import RevenueCards from '../RevenueCards.tsx';
import ChangeSummary from '../ChangeSummary.tsx';
import SidePanel from '../SidePanel.tsx';
import BlockedMessage from '../BlockedMessage.tsx';
import Modal from '../Modal.tsx';
import PublishDialog from '../PublishDialog.tsx';
import PublishedBanner from '../PublishedBanner.tsx';
import LoadingOverlay from '../LoadingOverlay.tsx';

export default function ReviewPage({ review, onEditRules }: { review: Review; onEditRules: () => void }) {
  const [dialog, setDialog] = useState<'reset' | 'publish'>();
  const { baseline, week, status, history, highlight, dayIndex, selectedId, blocked, pending, detailsLoading } = review;
  const busy = pending !== undefined;
  if (!baseline || !week) return null;

  const readOnly = status === 'Published';
  const day = DAYS[dayIndex];
  const selected = week[dayIndex].find((s) => s.id === selectedId);
  const shown = highlight?.day === dayIndex ? highlight : undefined;
  const todayExpected = dayRevenue(week[dayIndex]);
  const weekExpected = week.reduce((sum, d) => sum + dayRevenue(d), 0);
  const today = { expected: todayExpected, gap: todayExpected - dayRevenue(baseline[dayIndex]) };
  const weekTotals = { expected: weekExpected, gap: weekExpected - baseline.reduce((sum, d) => sum + dayRevenue(d), 0) };

  return (
    <div className="page review-page">
      <div className="review-top">
        <Header status={status} />
        <Toolbar
          readOnly={readOnly}
          busy={busy}
          canUndo={history.length > 0}
          onUndo={review.undo}
          onReset={() => setDialog('reset')}
          onPublish={() => setDialog('publish')}
        />
      </div>
      {readOnly && <PublishedBanner />}
      <div className="review">
        <div className="review-main">
          <DayTabs selected={pending?.day ?? dayIndex} disabled={busy} onSelect={review.selectDay} />
          {blocked && <BlockedMessage message={blocked.message} onEditRules={onEditRules} onClose={review.closeBlocked} />}
          <div className="change-summary-slot">
            {shown ? (
              <ChangeSummary changes={shown.changes} revenueDelta={shown.revenueDelta} />
            ) : (
              <p className="timeline-hint">
                {readOnly
                  ? 'Published: click a screening to see why the engine placed it there.'
                  : 'Drag a screening to a new time or theatre; the engine re-plans the day. Click one to see why it is there.'}
              </p>
            )}
          </div>
          <div className="timeline-wrap">
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
            {pending && <LoadingOverlay message={pending.message} />}
          </div>
        </div>
        <div className="review-side">
          <RevenueCards dayLabel={`${day.name} ${day.date}`} loading={busy} today={today} week={weekTotals} />
          <SidePanel
            selected={selected}
            history={history.filter((h) => h.day === dayIndex)}
            brokenRules={new Set(validateDay(day, week[dayIndex]).map((v) => v.rule))}
            loading={busy}
            detailsLoading={detailsLoading}
          />
        </div>
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
