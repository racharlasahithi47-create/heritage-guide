import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconTempleSilhouette } from './Icons';

export default function TopBar({ title, showBack = false, brand = false }) {
  const navigate = useNavigate();
  return (
    <div className="topbar">
      {brand ? (
        <div className="brand">
          <IconTempleSilhouette size={30} color="#B5471B" />
          Heritage Guide
        </div>
      ) : (
        <div className="row" style={{ gap: 12 }}>
          {showBack && (
            <button
              className="btn-ghost"
              style={{ padding: 4, display: 'flex' }}
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <IconArrowLeft size={22} color="#7A1F2B" />
            </button>
          )}
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h3>
        </div>
      )}
    </div>
  );
}
