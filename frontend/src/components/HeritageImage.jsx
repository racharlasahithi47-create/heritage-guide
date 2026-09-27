import { useState } from 'react';
import { IconTempleSilhouette } from './Icons';

// Wraps <img> with a graceful, on-theme fallback (rather than a broken image
// icon) in case an external placeholder photo URL fails to load.
export default function HeritageImage({ src, alt, className = '', style = {} }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'linear-gradient(135deg, #F0A93C33, #7A1F2B22)',
          color: '#B5471B'
        }}
      >
        <IconTempleSilhouette size={36} color="#B5471B" />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.75, padding: '0 8px', textAlign: 'center' }}>
          {alt || 'Heritage site'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
