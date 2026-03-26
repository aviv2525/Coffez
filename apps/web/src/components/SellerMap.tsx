'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon paths in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-[140deg]',
});

type Seller = {
  userId: string;
  displayName: string;
  locationText: string | null;
  lat: number | null;
  lng: number | null;
  avgRating: number | null;
  reviewCount?: number;
  isOnline?: boolean;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function SellerMap({
  sellers,
  userLocation,
  activeSellerId,
  onSelectSeller,
}: {
  sellers: Seller[];
  userLocation: { lat: number; lng: number } | null;
  activeSellerId: string | null;
  onSelectSeller: (id: string) => void;
}) {
  const mappable = sellers.filter((s) => s.lat != null && s.lng != null);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : mappable.length > 0
    ? [mappable[0].lat!, mappable[0].lng!]
    : [32.0853, 34.7818]; // Tel Aviv default

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <>
          <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px #3b82f6"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        </>
      )}

      {mappable.map((s) => (
        <Marker
          key={s.userId}
          position={[s.lat!, s.lng!]}
          icon={s.userId === activeSellerId ? activeIcon : defaultIcon}
          eventHandlers={{ click: () => onSelectSeller(s.userId) }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-stone-900 text-sm">{s.displayName}</p>
              {s.locationText && <p className="text-xs text-stone-500 mt-0.5">{s.locationText}</p>}
              {s.isOnline && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online now
                </span>
              )}
              {s.avgRating && (
                <p className="text-xs text-amber-700 mt-0.5">★ {s.avgRating} ({s.reviewCount})</p>
              )}
              <a
                href={`/seller/${s.userId}`}
                className="block mt-2 text-center py-1.5 px-3 rounded-lg text-xs font-medium bg-amber-900 text-white hover:bg-amber-800"
              >
                View profile
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
