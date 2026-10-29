interface Props {
  readOnly: boolean;
  busy: boolean; // loading: nothing can be clicked
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onPublish: () => void;
}

export default function Toolbar({ readOnly, busy, canUndo, onUndo, onReset, onPublish }: Props) {
  return (
    <div className="toolbar">
      <button onClick={onUndo} disabled={busy || readOnly || !canUndo}>
        ↶ Undo
      </button>
      <button onClick={onReset} disabled={busy || readOnly}>
        Reset to the engine's schedule
      </button>
      {!readOnly && (
        <button className="primary" onClick={onPublish} disabled={busy}>
          Publish week
        </button>
      )}
    </div>
  );
}
