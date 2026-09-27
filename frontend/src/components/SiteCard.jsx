import { useNavigate } from 'react-router-dom';
import HeritageImage from './HeritageImage';
import RiskBadge from './RiskBadge';

export default function SiteCard({ site, compact = false }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/site/${site.id}`)}
      style={{ cursor: 'pointer', width: compact ? 180 : '100%', flexShrink: 0 }}
    >
      <HeritageImage
        src={site.image_url}
        alt={site.name}
        style={{ width: '100%', height: compact ? 120 : 150, objectFit: 'cover' }}
      />
      <div style={{ padding: '12px 14px 14px 14px' }}>
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 8 }}>
          <h4 style={{ fontSize: compact ? '0.95rem' : '1.05rem', margin: 0 }}>{site.name}</h4>
        </div>
        <p className="muted small" style={{ margin: '4px 0 8px 0' }}>{site.location_name}</p>
        {!compact && <p className="small" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>{site.short_description}</p>}
        <RiskBadge status={site.risk_status} size="sm" />
      </div>
    </div>
  );
}
