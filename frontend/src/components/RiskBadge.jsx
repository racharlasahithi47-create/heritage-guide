const LABELS = { green: 'Well Preserved', yellow: 'Under Watch', red: 'At Risk' };

export default function RiskBadge({ status, pulse = false, size = 'md' }) {
  const label = LABELS[status] || 'Unknown';
  return (
    <span
      className={`badge badge-${status} ${pulse ? 'pulse-update' : ''}`}
      style={size === 'sm' ? { fontSize: '0.64rem', padding: '3px 9px' } : undefined}
    >
      <span className={`badge-risk-dot dot-${status}`} />
      {label}
    </span>
  );
}

export function SeverityBadge({ severity, pulse = false }) {
  const map = { minor: 'green', moderate: 'yellow', severe: 'red' };
  const labels = { minor: 'Minor', moderate: 'Moderate', severe: 'Severe' };
  const color = map[severity] || 'green';
  return (
    <span className={`badge badge-${color} ${pulse ? 'pulse-update' : ''}`}>
      <span className={`badge-risk-dot dot-${color}`} />
      {labels[severity] || severity}
    </span>
  );
}
