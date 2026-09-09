'use client';

import 'leaflet/dist/leaflet.css';
import { MapPinned, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

type DeliveryLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

function FocusLocation({ location }: { location: DeliveryLocation }) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.latitude, location.longitude], 17);
  }, [location, map]);

  return null;
}

export function DeliveryLocationButton({ location }: { location: DeliveryLocation }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn-outline btn-sm mt-3"
        onClick={() => setOpen(true)}
      >
        <MapPinned className="h-4 w-4" />
        Xem vị trí GPS
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delivery-location-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 id="delivery-location-title" className="font-semibold text-ink">
                  Vị trí nhận hàng
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Tọa độ khách hàng đã chọn khi tạo đơn hàng.
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-[360px] md:min-h-[520px]">
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={17}
                className="h-[65vh] min-h-[360px] w-full md:min-h-[520px]"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FocusLocation location={location} />
                <CircleMarker
                  center={[location.latitude, location.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#ff5a36',
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>Điểm nhận hàng: {location.address}</Popup>
                </CircleMarker>
              </MapContainer>
            </div>

            <div className="border-t border-border p-4 text-sm text-ink-muted">
              <p className="break-words">
                <strong className="text-ink">Địa chỉ:</strong> {location.address}
              </p>
              <p className="mt-1 font-mono text-xs">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
