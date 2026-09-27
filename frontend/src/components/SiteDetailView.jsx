import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeritageImage from './HeritageImage';
import RiskBadge from './RiskBadge';
import { MiniMap } from './HeritageMap';
import { IconCheck, IconTempleBell, IconPlay, IconStop, IconShield } from './Icons';
import { useNarration } from '../hooks/useNarration';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' }
];

export default function SiteDetailView({ site, nearby = [], confidence }) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const { speak, stop, speaking } = useNarration();

  function handleNarration() {
    if (speaking) {
      stop();
      return;
    }
    speak(`${site.name}. ${site.long_description}`, language);
  }

  return (
    <div className="stack">
      <div className="card">
        <HeritageImage src={site.image_url} alt={site.name} style={{ width: '100%', height: 210, objectFit: 'cover' }} />
        <div style={{ padding: 18 }}>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span className="badge badge-verified">
              <IconCheck size={13} color="#F3F5FB" /> Verified
            </span>
            {typeof confidence === 'number' && (
              <span className="muted small">{Math.round(confidence * 100)}% match confidence</span>
            )}
          </div>
          <h2 style={{ marginBottom: 2 }}>{site.name}</h2>
          <p className="muted small" style={{ marginBottom: 10 }}>{site.location_name} · {site.era}</p>
          <RiskBadge status={site.risk_status} />

          <div className="motif-divider" />

          <p style={{ lineHeight: 1.6 }}>{site.long_description}</p>

          <div className="row-between mt-16" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div className="row" style={{ gap: 6 }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    background: language === l.code ? 'var(--indigo)' : 'var(--ivory-deep)',
                    color: language === l.code ? '#fff' : 'var(--ink-soft)'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block mt-16" onClick={handleNarration}>
            {speaking ? <IconStop size={18} /> : <IconTempleBell size={18} />}
            {speaking ? 'Stop Narration' : 'Play Narration'}
          </button>
        </div>
      </div>

      {nearby.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Nearby Heritage Sites</h4>
          <MiniMap
            center={[site.latitude, site.longitude]}
            markers={[{ id: site.id, ...site }, ...nearby]}
          />
        </div>
      )}

      <button
        className="btn btn-indigo btn-block btn-lg"
        onClick={() => navigate(`/report/${site.id}`)}
      >
        <IconShield size={19} /> Report Condition
      </button>
    </div>
  );
}
