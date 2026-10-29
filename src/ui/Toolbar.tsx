interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
}

export default function Toolbar({ canUndo, onUndo, onReset }: Props) {
  return (
    <div className="toolbar">
      <button onClick={onUndo} disabled={!canUndo}>
        ↶ Undo
      </button>
      <button onClick={onReset}>Reset to the engine's schedule</button>
    </div>
  );
}
