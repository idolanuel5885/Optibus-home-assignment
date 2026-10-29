interface Props {
  readOnly: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onPublish: () => void;
}

export default function Toolbar({ readOnly, canUndo, onUndo, onReset, onPublish }: Props) {
  return (
    <div className="toolbar">
      <button onClick={onUndo} disabled={readOnly || !canUndo}>
        ↶ Undo
      </button>
      <button onClick={onReset} disabled={readOnly}>
        Reset to the engine's schedule
      </button>
      {!readOnly && (
        <button className="primary" onClick={onPublish}>
          Publish week
        </button>
      )}
    </div>
  );
}
