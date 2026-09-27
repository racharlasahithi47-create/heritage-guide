import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { IconCameraArch, IconUpload } from '../components/Icons';
import { api } from '../api';

export default function Scan() {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoSiteId, setDemoSiteId] = useState('');
  const [sites, setSites] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSites().then((res) => setSites(res.sites)).catch(() => {});
  }, []);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (demoSiteId) formData.append('demoSiteId', demoSiteId);
      const result = await api.scanPhoto(formData);
      navigate('/result', { state: result });
    } catch (err) {
      setError(err.message || 'Something went wrong analyzing this photo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <TopBar title="Scan a Monument" showBack />
      <p className="muted">Snap a photo on-site, or upload one you already have. We'll identify the monument and share its verified history.</p>

      <div
        className="card arch-frame"
        style={{
          marginTop: 14,
          minHeight: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: preview ? '#000' : 'linear-gradient(160deg, #F0A93C22, #7A1F2B12)',
          border: '2px dashed rgba(122,31,43,0.25)'
        }}
      >
        {preview ? (
          <img src={preview} alt="Selected monument" style={{ width: '100%', maxHeight: 340, objectFit: 'cover' }} />
        ) : (
          <div className="center-text" style={{ padding: 24 }}>
            <IconCameraArch size={48} color="var(--terracotta)" />
            <p className="muted small mt-8">Your photo preview will appear here</p>
          </div>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <div className="stack mt-16">
        <button className="btn btn-primary btn-block btn-lg" onClick={() => cameraInputRef.current.click()}>
          <IconCameraArch size={20} /> {preview ? 'Retake Photo' : 'Take a Photo'}
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => galleryInputRef.current.click()}>
          <IconUpload size={18} /> Upload from Gallery
        </button>
      </div>

      <div className="card mt-24" style={{ padding: 16 }}>
        <label className="small" style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>
          🧪 Demo mode — simulate identification result
        </label>
        <p className="muted small">Image matching is mocked for this prototype. Choose what the scan should "find," or leave on Auto to let it randomize.</p>
        <select
          className="field"
          style={{ width: '100%', border: '1.5px solid rgba(122,31,43,0.18)', borderRadius: 10, padding: 12, background: '#FFFDF9' }}
          value={demoSiteId}
          onChange={(e) => setDemoSiteId(e.target.value)}
        >
          <option value="">Auto (randomized)</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>Match: {s.name}</option>
          ))}
          <option value="no_match">Simulate: No match found</option>
        </select>
      </div>

      {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}

      <button
        className="btn btn-indigo btn-block btn-lg mt-24"
        disabled={!file || loading}
        onClick={handleAnalyze}
      >
        {loading ? <><span className="spinner" /> Identifying monument…</> : 'Identify This Monument'}
      </button>
    </div>
  );
}
