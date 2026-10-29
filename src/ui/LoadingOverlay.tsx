// Grey, semi-transparent cover with a spinner and a message, over the area about to change.
export default function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-box">
        <div className="spinner" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}
