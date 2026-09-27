import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SiteDetailView from '../components/SiteDetailView';
import { api } from '../api';

export default function SiteDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getSite(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      <TopBar title="Site Details" showBack />
      {loading && <div className="loading-shimmer" style={{ height: 300, borderRadius: 20 }} />}
      {error && <p className="small" style={{ color: 'var(--red-risk)' }}>{error}</p>}
      {data && <SiteDetailView site={data.site} nearby={data.nearby} />}
    </div>
  );
}
