export default function BlockedMessage({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="blocked-message" role="alert">
      <span>{message}</span>
      <a href="#" className="edit-rules" title="Editing rules isn't part of this prototype" onClick={(e) => e.preventDefault()}>
        Edit rules
      </a>
      <button className="close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
