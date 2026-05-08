type TopbarProps = {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  onClearError?: () => void;
};

export function Topbar({
  title,
  subtitle,
  loading,
  error,
  onClearError,
}: TopbarProps) {
  return (
    <>
      <header className="topbar">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className={`chip${loading ? " chip-warn" : ""}`}>
          {loading ? "Loading…" : "Ready"}
        </span>
      </header>
      {error ? (
        <div className="error-box">
          <span>{error}</span>
          {onClearError && (
            <button className="error-dismiss" onClick={onClearError}>
              ✕
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}
