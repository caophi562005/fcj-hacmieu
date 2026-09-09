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

export type DeliveryCoordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  open: boolean;
  initialCoordinates?: DeliveryCoordinates | null;
  onClose: () => void;
  onConfirm: (coordinates: DeliveryCoordinates) => void;
};

const HO_CHI_MINH_CITY: [number, number] = [10.7769, 106.7009];

function MapClickHandler({
  onSelect,
}: {
  onSelect: (coordinates: DeliveryCoordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });
  return null;
}

function MapController({ coordinates }: { coordinates: DeliveryCoordinates }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([coordinates.latitude, coordinates.longitude], 17, {
      duration: 0.6,
    });
  }, [coordinates, map]);

  return null;
}

export default function DeliveryMapDialog({
  open,
  initialCoordinates,
  onClose,
  onConfirm,
}: Props) {
  const [coordinates, setCoordinates] = useState<DeliveryCoordinates>(
    initialCoordinates ?? {
      latitude: HO_CHI_MINH_CITY[0],
      longitude: HO_CHI_MINH_CITY[1],
    },
  );
  const [hasSelectedPoint, setHasSelectedPoint] = useState(
    Boolean(initialCoordinates),
  );
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!open) return;
    setCoordinates(
      initialCoordinates ?? {
        latitude: HO_CHI_MINH_CITY[0],
        longitude: HO_CHI_MINH_CITY[1],
      },
    );
    setHasSelectedPoint(Boolean(initialCoordinates));
    setLocationError('');
  }, [open, initialCoordinates]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ lấy vị trí hiện tại.');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasSelectedPoint(true);
      },
      () =>
        setLocationError(
          'Không lấy được vị trí. Hãy cấp quyền vị trí hoặc chọn trực tiếp trên bản đồ.',
        ),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-map-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 id="delivery-map-title" className="font-semibold text-ink">
              Chọn vị trí nhận hàng
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Bấm vào bản đồ để đặt điểm nhận chính xác. Vị trí này không thay
              đổi khu vực GHN.
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

        <div className="relative min-h-[360px] flex-1 md:min-h-[520px]">
          <MapContainer
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={initialCoordinates ? 17 : 12}
            className="h-full min-h-[360px] w-full md:min-h-[520px]"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onSelect={(next) => {
                setCoordinates(next);
                setHasSelectedPoint(true);
                setLocationError('');
              }}
            />
            <MapController coordinates={coordinates} />
            {hasSelectedPoint ? (
              <CircleMarker
                center={[coordinates.latitude, coordinates.longitude]}
                radius={10}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#ff5a36',
                  fillOpacity: 1,
                  weight: 3,
                }}
              />
            ) : null}
          </MapContainer>

          <button
            type="button"
            className="absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-md"
            onClick={useCurrentLocation}
          >
            <Crosshair className="h-4 w-4" />
            Vị trí hiện tại
          </button>
        </div>

        <div className="border-t border-border px-4 py-3">
          {locationError ? (
            <p className="mb-2 text-sm text-danger">{locationError}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <MapPin className="h-4 w-4 text-primary" />
              {hasSelectedPoint
                ? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
                : 'Chưa chọn điểm nhận hàng'}
            </div>
            <div className="flex justify-end gap-2">
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
                disabled={!hasSelectedPoint}
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
