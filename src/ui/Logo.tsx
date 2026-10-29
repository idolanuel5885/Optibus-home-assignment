// The prototype's logo: a film-frame mark and the product name.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="5" width="28" height="22" rx="6" fill="#5b84d6" />
        <rect x="9" y="11" width="14" height="10" rx="2" fill="#fff" />
        {[8, 14, 20].map((x) => (
          <g key={x} fill="#dbe6fa">
            <rect x={x + 1} y="7" width="3" height="2" rx="0.5" />
            <rect x={x + 1} y="23" width="3" height="2" rx="0.5" />
          </g>
        ))}
      </svg>
      <span className="logo-text">PSR Schedule</span>
    </span>
  );
}
