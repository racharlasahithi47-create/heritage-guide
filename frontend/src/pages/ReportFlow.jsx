import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { SeverityBadge } from '../components/RiskBadge';
import HeritageImage from '../components/HeritageImage';
import { IconCameraArch, IconShield, IconCheck } from '../components/Icons';
import { api } from '../api';

const STEPS = { UPLOAD: 'upload', CLASSIFYING: 'classifying', REVIEW: 'review', ALERT: 'alert', DONE: 'done' };

export default function ReportFlow() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [site, setSite] = useState(null);
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [demoSeverity, setDemoSeverity] = useState('');
  const [severity, setSeverity] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState(null);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSent, setAlertSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSite(siteId).then((res) => setSite(res.site)).catch(() => {});
  }, [siteId]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleClassify() {
    if (!file) return;
    setStep(STEPS.CLASSIFYING);
    setError('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      if (demoSeverity) fd.append('demoSeverity', demoSeverity);
      const result = await api.classifySeverity(fd);
      setSeverity(result.severity);
      setConfidence(result.confidence);
      setUploadedPhotoPath(result.uploadedPhoto);
      setStep(STEPS.REVIEW);
    } catch (err) {
      setError(err.message || 'Could not analyze this photo.');
      setStep(STEPS.UPLOAD);
    }
  }

  async function handleConfirmSeverity() {
    // If moderate/severe, generate the draft alert preview locally by asking
    // the backend at submit-time; here we just move forward to compose step.
    if (severity === 'moderate' || severity === 'severe') {
      setStep(STEPS.ALERT);
    } else {
      await finalizeReport(false);
    }
  }

  async function finalizeReport(sendAlert) {
    setError('');
    try {
      const payload = {
        siteId,
        severity,
        description,
        photoPath: uploadedPhotoPath,
        reporterName,
        reporterContact,
        sendAlert
      };
      const res = await api.submitReport(payload);
      if (res.report.alert_message) setAlertMessage(res.report.alert_message);
      setAlertSent(!!sendAlert);
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message || 'Something went wrong submitting this report.');
    }
  }

  if (!site) {
    return (
      <div className="page">
        <TopBar title="Report Condition" showBack />
        <div className="loading-shimmer" style={{ height: 200, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar title={`Report Condition — ${site.name}`} showBack />

      {step === STEPS.UPLOAD && (
        <div className="stack">
          <p className="muted">Upload a photo of the site's current condition so we can assess whether it needs attention.</p>
          <div
            className="card"
            style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: preview ? '#000' : 'linear-gradient(160deg,#F0A93C22,#7A1F2B12)', border: '2px dashed rgba(122,31,43,0.25)' }}
          >
            {preview ? (
              <img src={preview} alt="Condition" style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }} />
            ) : (
              <div className="center-text" style={{ padding: 24 }}>
                <IconCameraArch size={40} color="var(--terracotta)" />
                <p className="muted small mt-8">Add a photo of the current condition</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn btn-secondary btn-block" onClick={() => fileInputRef.current.click()}>
            {preview ? 'Choose a different photo' : 'Take / Upload Photo'}
          </button>

          <div className="card" style={{ padding: 16 }}>
            <label className="small" style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>
              🧪 Demo mode — simulate damage classification
            </label>
            <p className="muted small">Real image classification isn't wired up yet — pick a result to simulate, or leave on Auto.</p>
            <select
              className="field"
              style={{ width: '100%', border: '1.5px solid rgba(122,31,43,0.18)', borderRadius: 10, padding: 12, background: '#FFFDF9' }}
              value={demoSeverity}
              onChange={(e) => setDemoSeverity(e.target.value)}
            >
              <option value="">Auto (randomized)</option>
              <option value="minor">Minor — general wear</option>
              <option value="moderate">Moderate — cracks, graffiti, overgrowth</option>
              <option value="severe">Severe — structural damage, encroachment</option>
            </select>
          </div>

          {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}

          <button className="btn btn-indigo btn-block btn-lg" disabled={!file} onClick={handleClassify}>
            Analyze Condition
          </button>
        </div>
      )}

      {step === STEPS.CLASSIFYING && (
        <div className="card center-text" style={{ padding: '50px 20px' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--terracotta)', borderColor: 'rgba(181,71,27,0.25)', margin: '0 auto', display: 'block' }} />
          <p className="muted mt-16">Analyzing the photo for signs of wear or damage…</p>
        </div>
      )}

      {step === STEPS.REVIEW && (
        <div className="stack">
          <div className="card" style={{ padding: 18 }}>
            {preview && <HeritageImage src={preview} alt="Condition" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />}
            <div className="row-between">
              <h4 style={{ margin: 0 }}>Assessed Severity</h4>
              <SeverityBadge severity={severity} pulse />
            </div>
            <p className="muted small mt-8">Confidence: {Math.round((confidence || 0) * 100)}% (simulated)</p>

            <div className="field mt-16">
              <label>What did you notice? (optional but helpful)</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. cracks near the eastern wall, litter buildup..." />
            </div>
            <div className="field">
              <label>Your name (optional)</label>
              <input type="text" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
            </div>
            <div className="field">
              <label>Contact (optional)</label>
              <input type="text" value={reporterContact} onChange={(e) => setReporterContact(e.target.value)} placeholder="Email or phone" />
            </div>
          </div>

          {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}

          <button className="btn btn-primary btn-block btn-lg" onClick={handleConfirmSeverity}>
            {severity === 'minor' ? 'Submit Report' : 'Continue to Alert Draft'}
          </button>
        </div>
      )}

      {step === STEPS.ALERT && (
        <div className="stack">
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header-block row" style={{ gap: 8 }}>
              <IconShield size={20} />
              <strong>Draft Alert — Local ASI Circle Office</strong>
            </div>
            <div style={{ padding: 18 }}>
              <p className="muted small">
                Since this condition was assessed as <strong>{severity}</strong>, we've drafted a formal alert. Review and send it, or submit the report without notifying the office yet.
              </p>
              <textarea
                rows={10}
                style={{ width: '100%', border: '1.5px solid rgba(122,31,43,0.18)', borderRadius: 10, padding: 12, fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
                value={
                  alertMessage ||
                  `To: Local ASI Circle Office\nSubject: Heritage Condition Alert — ${site.name} (${severity})\n\nSite: ${site.name}\nLocation: ${site.location_name}\nSeverity: ${severity}\nDescription: ${description || 'No additional details provided.'}\nReported by: ${reporterName || 'Anonymous'}${reporterContact ? ` (${reporterContact})` : ''}`
                }
                onChange={(e) => setAlertMessage(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}

          <button className="btn btn-primary btn-block btn-lg" onClick={() => finalizeReport(true)}>
            <IconShield size={18} /> Send Alert &amp; Submit Report
          </button>
          <button className="btn btn-secondary btn-block" onClick={() => finalizeReport(false)}>
            Submit Report Without Sending
          </button>
        </div>
      )}

      {step === STEPS.DONE && (
        <div className="card center-text" style={{ padding: '40px 24px' }}>
          <span className="badge badge-verified" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <IconCheck size={16} color="#fff" /> Report Filed
          </span>
          <h3 className="mt-16">Thank you for looking out for {site.name}</h3>
          <p className="muted">
            Your report is in the review queue{alertSent ? ' and the draft alert has been logged as sent to the Local ASI Circle Office (simulated for this demo)' : ''}. Once verified, it will update the public Risk Map.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/risk-map')}>View Risk Map</button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
