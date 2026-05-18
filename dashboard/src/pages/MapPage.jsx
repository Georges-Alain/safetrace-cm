import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { casesAPI } from '../api/cases.api';
import theme from '../theme';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR = {
  ACTIVE:   '#ef4444',
  PENDING:  '#f97316',
  INQUIRY:  '#f97316',
  RESOLVED: '#22c55e',
};

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}80"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapPage() {
  const [filter, setFilter] = useState('ALL');

  const { data } = useQuery({
    queryKey: ['cases', 'map'],
    queryFn: () => casesAPI.list({ limit: 500, offset: 0 }),
  });

  const cases = (data?.cases ?? []).filter(
    (c) => filter === 'ALL' || c.status === filter
  );

  return (
    <div style={{ padding: '2rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          color: theme.colors.text, fontSize: '1.75rem', margin: 0,
        }}>
          Carte des dossiers
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
            padding: '0.5rem 1rem',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
          }}
        >
          <option value="ALL">Tous</option>
          <option value="ACTIVE">Actifs</option>
          <option value="INQUIRY">Enquête</option>
          <option value="PENDING">En attente</option>
          <option value="RESOLVED">Résolus</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
        {Object.entries({ 'Actif / Urgent': '#ef4444', 'En attente': '#f97316', 'Résolu': '#22c55e' }).map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: theme.colors.textMuted }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div style={{ height: 'calc(100vh - 220px)', borderRadius: theme.radius.lg, overflow: 'hidden' }}>
        <MapContainer
          center={[3.848, 11.502]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {cases.map((c) =>
            c.latitude && c.longitude ? (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                icon={makeIcon(STATUS_COLOR[c.status] ?? '#f97316')}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 160 }}>
                    <strong>{c.person_name}</strong><br />
                    <span style={{ color: STATUS_COLOR[c.status] }}>{c.status}</span><br />
                    {c.last_seen_location}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
