interface StatusTagProps {
  label: string;
  variant?: "neutral" | "active" | "warning";
}

export function StatusTag({ label, variant = "neutral" }: StatusTagProps) {
  return (
    <span className={`status-tag status-tag--${variant}`}>
      <span className="status-tag__text">{label}</span>
    </span>
  );
}
