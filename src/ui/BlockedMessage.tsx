interface Props {
  message: string;
  onEditRules: () => void;
  onClose: () => void;
}

export default function BlockedMessage({ message, onEditRules, onClose }: Props) {
  return (
    <div className="blocked-message" role="alert">
      <span>{message}</span>
      <a
        href="#"
        className="edit-rules"
        onClick={(e) => {
          e.preventDefault();
          onEditRules();
        }}
      >
        Edit rules
      </a>
      <button className="close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
