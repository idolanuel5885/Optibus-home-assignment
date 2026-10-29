// Plain pointer-event drag for timeline blocks: horizontal movement → minutes (5-minute snap),
// vertical position → theatre row. A release without movement counts as a click.
import { type PointerEvent, useRef, useState } from 'react';
import type { Drag, Screening } from '../types.ts';
import { START_STEP } from '../data.ts';

interface Active extends Drag {
  originX: number;
  origin: Screening;
}

export function useDrag(pxPerMin: number, onDrop: (drag: Drag) => void, onClick: (s: Screening) => void) {
  const [active, setActive] = useState<Active>();
  const lanes = useRef(new Map<number, HTMLElement>());

  const theatreAt = (clientY: number, fallback: number) => {
    for (const [id, el] of lanes.current) {
      const r = el.getBoundingClientRect();
      if (clientY >= r.top && clientY < r.bottom) return id;
    }
    return fallback;
  };

  const blockHandlers = (s: Screening) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setActive({ screeningId: s.id, theatreId: s.theatreId, start: s.start, originX: e.clientX, origin: s });
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!active || active.screeningId !== s.id) return;
      const delta = Math.round((e.clientX - active.originX) / pxPerMin / START_STEP) * START_STEP;
      const theatreId = theatreAt(e.clientY, active.theatreId);
      const start = s.start + delta;
      if (start !== active.start || theatreId !== active.theatreId) setActive({ ...active, start, theatreId });
    },
    onPointerUp: () => {
      if (!active || active.screeningId !== s.id) return;
      setActive(undefined);
      const { screeningId, theatreId, start, origin } = active;
      if (theatreId === origin.theatreId && start === origin.start) onClick(origin);
      else onDrop({ screeningId, theatreId, start });
    },
    onPointerCancel: () => setActive(undefined),
  });

  const laneRef = (theatreId: number) => (el: HTMLElement | null) => {
    if (el) lanes.current.set(theatreId, el);
    else lanes.current.delete(theatreId);
  };

  return { active, blockHandlers, laneRef };
}
