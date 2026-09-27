import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SiteCard from '../components/SiteCard';
import { IconCameraArch, IconShield, IconScroll } from '../components/Icons';
import { api } from '../api';

export default function Home() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSites(), api.getStats()])
      .then(([sitesRes, statsRes]) => {
        setSites(sitesRes.sites);
        setStats(statsRes);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <TopBar brand />

      {/* Hero */}
      <div
        className="card"
        style={{
          position: 'relative',
          padding: '30px 22px 26px 22px',
          background: 'linear-gradient(150deg, #F0A93C 0%, #E08A1E 45%, #B5471B 100%)',
          color: '#FFF8ED',
          textAlign: 'center',
          marginTop: 6,
          overflow: 'hidden'
        }}
      >
        <div className="motif-bg-mandala" style={{ opacity: 0.14, filter: 'invert(1) brightness(2)' }} />
        <h1 style={{ color: '#FFF8ED', fontSize: '1.6rem', position: 'relative' }}>
          Discover the story behind every stone
        </h1>
        <p style={{ color: '#FFF3DE', position: 'relative' }}>
          Point your camera at a monument to learn its verified history — and help protect it for tomorrow.
        </p>
        <button
          className="btn btn-lg"
          style={{ background: '#FFF8ED', color: 'var(--terracotta)', marginTop: 10, position: 'relative', boxShadow: '0 10px 24px rgba(0,0,0,0.18)' }}
          onClick={() => navigate('/scan')}
        >
          <IconCameraArch size={22} color="var(--terracotta)" />
          Scan a Monument
        </button>
      </div>

      <div className="motif-divider" />

      {/* Stat banner */}
      <div className="card" style={{ padding: '16px 10px' }}>
        <div className="row-between" style={{ textAlign: 'center' }}>
          <StatBlock icon={<IconScroll size={20} color="var(--indigo)" />} value={loading ? '—' : stats?.sitesDocumented} label="Sites Documented" />
          <StatBlock icon={<IconShield size={20} color="var(--terracotta)" />} value={loading ? '—' : stats?.reportsFiled} label="Reports Filed" />
          <StatBlock icon={<span className="badge-risk-dot dot-yellow" style={{ width: 12, height: 12 }} />} value={loading ? '—' : stats?.sitesUnderWatch} label="Sites Under Watch" />
        </div>
      </div>

      {/* Featured sites */}
      <div className="row-between mt-24" style={{ marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Featured Heritage Sites</h3>
        <span className="btn-ghost small" onClick={() => navigate('/explore')} style={{ fontWeight: 700 }}>See all →</span>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 2px 12px 2px' }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="loading-shimmer" style={{ width: 180, height: 190, flexShrink: 0 }} />
            ))
          : sites.map((site) => <SiteCard key={site.id} site={site} compact />)}
      </div>

      <p className="muted center-text small mt-16">
        🪔 A civic project to document, celebrate, and safeguard India's heritage — one photo at a time.
      </p>
    </div>
  );
}

function StatBlock({ icon, value, label }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="row" style={{ justifyContent: 'center', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--maroon)' }}>{value}</div>
      <div className="muted small">{label}</div>
    </div>
  );
}
