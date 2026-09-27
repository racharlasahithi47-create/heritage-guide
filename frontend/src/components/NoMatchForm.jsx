import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconScroll, IconMic, IconUpload, IconCheck } from '../components/Icons';
import { api } from '../api';

export default function NoMatchForm({ uploadedPhoto }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ siteName: '', locationName: '', description: '', reporterName: '', reporterContact: '' });
  const [photos, setPhotos] = useState([]);
  const [voiceNote, setVoiceNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef(null);
  const voiceInputRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.siteName || !form.locationName || !form.description) {
      setError('Please fill in the site name, location, and a short description.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach((p) => fd.append('photos', p));
      if (voiceNote) fd.append('voiceNote', voiceNote);
      await api.submitNewSite(fd);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong submitting this site.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card center-text" style={{ padding: '40px 24px' }}>
        <div className="row" style={{ justifyContent: 'center', marginBottom: 10 }}>
          <span className="badge badge-verified" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <IconCheck size={16} color="#fff" /> Submitted for review
          </span>
        </div>
        <h3>Thank you for helping preserve this place!</h3>
        <p className="muted">Your submission is now in our review queue. Once verified, it will appear as a documented heritage site for everyone to discover.</p>
        <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ gap: 10, marginBottom: 6 }}>
        <IconScroll size={26} color="var(--terracotta)" />
        <h3 style={{ margin: 0 }}>Help us preserve this place!</h3>
      </div>
      <p className="muted small">We couldn't find this monument in our records yet. Tell us about it — every detail helps build India's living heritage archive.</p>

      {uploadedPhoto && (
        <img src={uploadedPhoto} alt="Uploaded site" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, margin: '12px 0' }} />
      )}

      <form onSubmit={handleSubmit} className="mt-16">
        <div className="field">
          <label>Site name</label>
          <input type="text" value={form.siteName} onChange={(e) => update('siteName', e.target.value)} placeholder="e.g. Bhongir Fort" />
        </div>
        <div className="field">
          <label>Location</label>
          <input type="text" value={form.locationName} onChange={(e) => update('locationName', e.target.value)} placeholder="City / district, state" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What do you know about this place? History, stories, current condition..." />
        </div>
        <div className="field">
          <label>Additional photos (optional)</label>
          <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => setPhotos(Array.from(e.target.files))} />
          <button type="button" className="btn btn-secondary" onClick={() => photoInputRef.current.click()}>
            <IconUpload size={16} /> {photos.length ? `${photos.length} photo(s) selected` : 'Add photos'}
          </button>
        </div>
        <div className="field">
          <label>Voice note — oral history (optional)</label>
          <input ref={voiceInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => setVoiceNote(e.target.files[0])} />
          <button type="button" className="btn btn-secondary" onClick={() => voiceInputRef.current.click()}>
            <IconMic size={16} /> {voiceNote ? voiceNote.name : 'Record or attach a voice note'}
          </button>
        </div>
        <div className="field">
          <label>Your name (optional)</label>
          <input type="text" value={form.reporterName} onChange={(e) => update('reporterName', e.target.value)} />
        </div>
        <div className="field">
          <label>Contact (optional)</label>
          <input type="text" value={form.reporterContact} onChange={(e) => update('reporterContact', e.target.value)} placeholder="Email or phone" />
        </div>

        {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}

        <button className="btn btn-primary btn-block btn-lg" disabled={submitting} type="submit">
          {submitting ? <><span className="spinner" /> Submitting…</> : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
