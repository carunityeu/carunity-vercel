import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Esri tiles: key-free and allowed for app usage (OpenStreetMap's tile server
// blocks app traffic and answers with a 403 "Access blocked" image instead of tiles)
const TILES = {
  map: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar'
  }
};

const PIN = L.divIcon({
  className: '',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  html: '<svg width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.2 0 13.9 0 24 14 40 14 40s14-16 14-26.1C28 6.2 21.7 0 14 0z" fill="#ea4335"/><circle cx="14" cy="14" r="5" fill="#7b1d16"/></svg>'
});

// Location of the seller on a map (street address → coordinates via Photon geocoding)
export default function SellerMap({ query }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('map');

  const { data: coords } = useQuery({
    queryKey: ['geocode', query],
    enabled: !!query,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const hit = data.features?.[0];
      return hit ? [hit.geometry.coordinates[1], hit.geometry.coordinates[0]] : null;
    }
  });

  if (!coords) return null;

  return (
    <div className="relative isolate z-0 mt-5 h-64 overflow-hidden rounded-xl md:h-80">
      <MapContainer center={coords} zoom={15} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer key={mode} url={TILES[mode].url} attribution={TILES[mode].attribution} />
        <ZoomControl position="topright" />
        <Marker position={coords} icon={PIN} />
      </MapContainer>
      <div className="absolute left-3 top-3 z-[400] flex overflow-hidden rounded-md bg-white text-xs font-medium shadow">
        {['map', 'satellite'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn('px-3 py-1.5', mode === m ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100')}>
            {t('carPage.' + m)}
          </button>
        ))}
      </div>
    </div>
  );
}