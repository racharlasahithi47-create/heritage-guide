import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RISK_COLORS = { green: '#3E7A4E', yellow: '#C97A1B', red: '#A6332A' };

export function MiniMap({ center, markers = [], height = 160 }) {
  return (
    <div style={{ height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(122,31,43,0.12)' }}>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.latitude, m.longitude]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: RISK_COLORS[m.risk_status] || '#B5471B', fillOpacity: 0.95 }}
          >
            <Popup>{m.name}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export function RiskMapFull({ sites = [] }) {
  const validSites = sites.filter((s) => s.latitude && s.longitude);
  const center = validSites.length
    ? [validSites.reduce((a, s) => a + s.latitude, 0) / validSites.length, validSites.reduce((a, s) => a + s.longitude, 0) / validSites.length]
    : [17.4, 78.4];

  return (
    <div style={{ height: 380, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(122,31,43,0.12)' }}>
      <MapContainer center={center} zoom={5.4} style={{ height: '100%', width: '100%' }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {validSites.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.latitude, s.longitude]}
            radius={11}
            pathOptions={{ color: '#fff', weight: 2, fillColor: RISK_COLORS[s.risk_status] || '#B5471B', fillOpacity: 0.95 }}
          >
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.location_name}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
