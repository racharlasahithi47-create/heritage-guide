const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  getSites: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE}/sites${qs ? `?${qs}` : ''}`).then(handle);
  },
  getSite: (id) => fetch(`${BASE}/sites/${id}`).then(handle),
  getStats: () => fetch(`${BASE}/sites/meta/stats`).then(handle),

  scanPhoto: (formData) =>
    fetch(`${BASE}/scan`, { method: 'POST', body: formData }).then(handle),

  submitNewSite: (formData) =>
    fetch(`${BASE}/submissions`, { method: 'POST', body: formData }).then(handle),
  getSubmissions: (status) =>
    fetch(`${BASE}/submissions${status ? `?status=${status}` : ''}`).then(handle),
  approveSubmission: (id) => fetch(`${BASE}/submissions/${id}/approve`, { method: 'POST' }).then(handle),
  rejectSubmission: (id) => fetch(`${BASE}/submissions/${id}/reject`, { method: 'POST' }).then(handle),

  classifySeverity: (formData) =>
    fetch(`${BASE}/reports/classify`, { method: 'POST', body: formData }).then(handle),
  submitReport: (payload) =>
    fetch(`${BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  getReports: (status) => fetch(`${BASE}/reports${status ? `?status=${status}` : ''}`).then(handle),
  approveReport: (id) => fetch(`${BASE}/reports/${id}/approve`, { method: 'POST' }).then(handle),
  rejectReport: (id) => fetch(`${BASE}/reports/${id}/reject`, { method: 'POST' }).then(handle),
  getRiskMap: () => fetch(`${BASE}/reports/risk-map/all`).then(handle),

  narrate: (text, language) =>
    fetch(`${BASE}/narration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    }).then(handle)
};
