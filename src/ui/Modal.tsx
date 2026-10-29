import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel?: string; // omitted: an information pop-up with a single OK
  onConfirm?: () => void;
  onCancel: () => void;
}

export default function Modal({ title, children, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          {onConfirm ? (
            <>
              <button onClick={onCancel}>Cancel</button>
              <button className="primary" onClick={onConfirm} autoFocus>
                {confirmLabel}
              </button>
            </>
          ) : (
            <button className="primary" onClick={onCancel} autoFocus>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
