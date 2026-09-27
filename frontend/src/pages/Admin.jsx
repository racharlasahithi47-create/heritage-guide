import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { SeverityBadge } from '../components/RiskBadge';
import { IconCheck, IconX, IconClipboard } from '../components/Icons';
import { api } from '../api';

export default function Admin() {
  const [tab, setTab] = useState('submissions');
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    Promise.all([api.getSubmissions('pending'), api.getReports('pending')])
      .then(([subRes, repRes]) => {
        setSubmissions(subRes.submissions);
        setReports(repRes.reports);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function handleSubmissionAction(id, action) {
    if (action === 'approve') await api.approveSubmission(id);
    else await api.rejectSubmission(id);
    refresh();
  }

  async function handleReportAction(id, action) {
    if (action === 'approve') await api.approveReport(id);
    else await api.rejectReport(id);
    refresh();
  }

  return (
    <div className="page">
      <TopBar title="Review Queue" />
      <p className="muted">Approve or reject crowdsourced submissions and condition reports. Approved items update what the public sees.</p>

      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        <TabButton active={tab === 'submissions'} onClick={() => setTab('submissions')} label={`New Sites (${submissions.length})`} />
        <TabButton active={tab === 'reports'} onClick={() => setTab('reports')} label={`Risk Reports (${reports.length})`} />
      </div>

      {loading && <div className="loading-shimmer" style={{ height: 160, borderRadius: 20 }} />}

      {!loading && tab === 'submissions' && (
        <div className="stack">
          {submissions.length === 0 && <EmptyState text="No pending site submissions right now." />}
          {submissions.map((s) => (
            <div key={s.id} className="card" style={{ padding: 16 }}>
              <div className="row-between">
                <strong>{s.site_name}</strong>
                <span className="muted small">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
              <p className="muted small" style={{ margin: '4px 0' }}>{s.location_name}</p>
              <p className="small">{s.description}</p>
              {s.reporter_name && <p className="muted small">Submitted by: {s.reporter_name}</p>}
              <div className="row mt-8" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={() => handleSubmissionAction(s.id, 'approve')}>
                  <IconCheck size={16} /> Approve
                </button>
                <button className="btn btn-secondary" onClick={() => handleSubmissionAction(s.id, 'reject')}>
                  <IconX size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'reports' && (
        <div className="stack">
          {reports.length === 0 && <EmptyState text="No pending risk reports right now." />}
          {reports.map((r) => (
            <div key={r.id} className="card" style={{ padding: 16 }}>
              <div className="row-between">
                <strong>{r.site_name}</strong>
                <SeverityBadge severity={r.severity} />
              </div>
              <p className="muted small" style={{ margin: '4px 0' }}>{r.site_location}</p>
              {r.description && <p className="small">{r.description}</p>}
              {r.alert_message && (
                <details className="small mt-8">
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--terracotta)' }}>View draft ASI alert</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '0.8rem', background: 'var(--ivory-deep)', padding: 10, borderRadius: 8, marginTop: 6 }}>
                    {r.alert_message}
                  </pre>
                </details>
              )}
              <div className="row mt-8" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={() => handleReportAction(r.id, 'approve')}>
                  <IconCheck size={16} /> Approve
                </button>
                <button className="btn btn-secondary" onClick={() => handleReportAction(r.id, 'reject')}>
                  <IconX size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? 'var(--indigo)' : 'var(--ivory-deep)',
        color: active ? '#fff' : 'var(--ink-soft)',
        fontSize: '0.82rem'
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="card center-text" style={{ padding: 30 }}>
      <IconClipboard size={30} color="var(--ink-soft)" />
      <p className="muted mt-8">{text}</p>
    </div>
  );
}
