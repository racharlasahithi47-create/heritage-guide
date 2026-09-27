import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import SiteCard from '../components/SiteCard';
import { api } from '../api';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'green', label: 'Well Preserved' },
  { value: 'yellow', label: 'Under Watch' },
  { value: 'red', label: 'At Risk' }
];

export default function Explore() {
  const [sites, setSites] = useState([]);
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (query) params.q = query;
    if (risk) params.risk = risk;
    const handle = setTimeout(() => {
      api.getSites(params).then((res) => setSites(res.sites)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, risk]);

  return (
    <div className="page">
      <TopBar title="Explore Heritage Sites" />
      <input
        type="text"
        placeholder="Search by name or location…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '13px 16px',
          borderRadius: 999,
          border: '1.5px solid rgba(122,31,43,0.18)',
          background: '#FFFDF9',
          fontSize: '0.95rem',
          marginBottom: 12
        }}
      />
      <div className="row" style={{ gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setRisk(f.value)}
            className="btn"
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              fontSize: '0.8rem',
              background: risk === f.value ? 'var(--terracotta)' : 'var(--ivory-deep)',
              color: risk === f.value ? '#fff' : 'var(--ink-soft)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-16" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="loading-shimmer" style={{ height: 190 }} />)
          : sites.map((site) => <SiteCard key={site.id} site={site} compact />)}
      </div>
      {!loading && sites.length === 0 && (
        <p className="muted center-text mt-24">No sites match your search yet. Try a different keyword or filter.</p>
      )}
    </div>
  );
}
