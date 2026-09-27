import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { RiskMapFull } from '../components/HeritageMap';
import RiskBadge from '../components/RiskBadge';
import { api } from '../api';

export default function RiskMap() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRiskMap().then((res) => setSites(res.sites)).finally(() => setLoading(false));
  }, []);

  const counts = sites.reduce(
    (acc, s) => {
      acc[s.risk_status] = (acc[s.risk_status] || 0) + 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  return (
    <div className="page">
      <TopBar title="Heritage Risk Map" />
      <p className="muted">Every documented site, color-coded by current condition — reported by people like you.</p>

      {loading ? (
        <div className="loading-shimmer" style={{ height: 380, borderRadius: 20 }} />
      ) : (
        <RiskMapFull sites={sites} />
      )}

      <div className="card mt-16" style={{ padding: 14 }}>
        <div className="row-between">
          <LegendItem status="green" label="Well Preserved" count={counts.green} />
          <LegendItem status="yellow" label="Under Watch" count={counts.yellow} />
          <LegendItem status="red" label="At Risk" count={counts.red} />
        </div>
      </div>

      <div className="stack mt-16">
        {sites.map((s) => (
          <div key={s.id} className="card row-between" style={{ padding: '12px 16px' }}>
            <div>
              <strong style={{ fontSize: '0.92rem' }}>{s.name}</strong>
              <p className="muted small" style={{ margin: 0 }}>{s.location_name}</p>
            </div>
            <RiskBadge status={s.risk_status} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ status, label, count }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      <span className={`badge-risk-dot dot-${status}`} />
      <span className="small">{label} ({count})</span>
    </div>
  );
}
