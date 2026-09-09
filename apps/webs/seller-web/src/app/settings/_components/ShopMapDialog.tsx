'use client';

import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

export type MapCoordinates = { latitude: number; longitude: number };

type Props = {
  open: boolean;
  initialCoordinates?: MapCoordinates | null;
  onClose: () => void;
  onConfirm: (coordinates: MapCoordinates) => void;
};

const DEFAULT_CENTER: MapCoordinates = {
  latitude: 10.7769,
  longitude: 106.7009,
};

function MapEvents({
  onSelect,
}: {
  onSelect: (value: MapCoordinates) => void;
}) {
  useMapEvents({
    click: ({ latlng }) =>
      onSelect({ latitude: latlng.lat, longitude: latlng.lng }),
  });
  return null;
}

function MapController({ coordinates }: { coordinates: MapCoordinates }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coordinates.latitude, coordinates.longitude], 17, {
      duration: 0.5,
    });
  }, [coordinates, map]);
  return null;
}

export default function ShopMapDialog({
  open,
  initialCoordinates,
  onClose,
  onConfirm,
}: Props) {
  const [coordinates, setCoordinates] = useState(
    initialCoordinates ?? DEFAULT_CENTER,
  );
  const [selected, setSelected] = useState(Boolean(initialCoordinates));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCoordinates(initialCoordinates ?? DEFAULT_CENTER);
    setSelected(Boolean(initialCoordinates));
    setError('');
  }, [open, initialCoordinates]);

  if (!open) return null;

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ lấy vị trí hiện tại.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setSelected(true);
        setError('');
      },
      () =>
        setError(
          'Không lấy được vị trí. Hãy cấp quyền hoặc chọn trực tiếp trên bản đồ.',
        ),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="font-semibold text-ink">Chọn vị trí kho lấy hàng</h2>
            <p className="text-xs text-ink-muted">
              Bấm lên bản đồ để đặt vị trí chính xác của shop.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative min-h-[420px]">
          <MapContainer
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={initialCoordinates ? 17 : 12}
            className="h-[60vh] min-h-[420px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents
              onSelect={(value) => {
                setCoordinates(value);
                setSelected(true);
                setError('');
              }}
            />
            <MapController coordinates={coordinates} />
            {selected ? (
              <CircleMarker
                center={[coordinates.latitude, coordinates.longitude]}
                radius={10}
                pathOptions={{
                  color: '#fff',
                  fillColor: '#ff5a36',
                  fillOpacity: 1,
                  weight: 3,
                }}
              />
            ) : null}
          </MapContainer>
          <button
            type="button"
            className="absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-md"
            onClick={locate}
          >
            <Crosshair className="h-4 w-4" />
            Vị trí hiện tại
          </button>
        </div>
        <div className="border-t border-slate-200 p-4">
          {error ? <p className="mb-2 text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="h-4 w-4 text-primary" />
              {selected
                ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
                : 'Chưa chọn vị trí'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-outline btn-md"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary btn-md"
                disabled={!selected}
                onClick={() => {
                  onConfirm(coordinates);
                  onClose();
                }}
              >
                Xác nhận vị trí
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
