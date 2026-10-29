export default function PublishedBanner() {
  return (
    <div className="published-banner">
      <span>This week is published. The schedule is read-only.</span>
      <button disabled title="Not part of this prototype">
        Create new version
      </button>
    </div>
  );
}
