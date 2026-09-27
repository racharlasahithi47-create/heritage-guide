import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import SiteDetailView from '../components/SiteDetailView';
import NoMatchForm from '../components/NoMatchForm';
import { api } from '../api';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanResult = location.state;
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    if (scanResult?.matched && scanResult.site) {
      api.getSite(scanResult.site.id).then((res) => setNearby(res.nearby)).catch(() => {});
    }
  }, [scanResult]);

  useEffect(() => {
    if (!scanResult) {
      // Directly navigated here without a scan — send back to scan flow
      navigate('/scan', { replace: true });
    }
  }, [scanResult, navigate]);

  if (!scanResult) return null;

  return (
    <div className="page">
      <TopBar title={scanResult.matched ? 'Monument Identified' : 'New Discovery'} showBack />
      {scanResult.matched ? (
        <SiteDetailView site={scanResult.site} nearby={nearby} confidence={scanResult.confidence} />
      ) : (
        <NoMatchForm uploadedPhoto={scanResult.uploadedPhoto} />
      )}
    </div>
  );
}
