'use client';

import 'leaflet/dist/leaflet.css';
import { MapPinned, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

type RouteLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  origin: RouteLocation;
  destination: RouteLocation;
};

type RoutePoint = [number, number];

function FitRoute({ points }: { points: RoutePoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export function OrderRouteButton({ origin, destination }: Props) {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [routeError, setRouteError] = useState('');

  useEffect(() => {
    if (!open || route.length) return;
    const controller = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('route unavailable');
        return response.json();
      })
      .then((data) => {
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates)) throw new Error('route unavailable');
        setRoute(
          coordinates.map(([longitude, latitude]: [number, number]) => [
            latitude,
            longitude,
          ]),
        );
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setRouteError(
            'Không tải được đường đi; vẫn hiển thị hai điểm giao nhận.',
          );
        }
      });

    return () => controller.abort();
  }, [destination, open, origin, route.length]);

  const fallbackPoints: RoutePoint[] = [
    [origin.latitude, origin.longitude],
    [destination.latitude, destination.longitude],
  ];
  const visiblePoints = route.length ? route : fallbackPoints;

  return (
    <>
      <button
        type="button"
        className="btn-outline btn-sm mt-3"
        onClick={() => setOpen(true)}
      >
        <MapPinned className="h-4 w-4" />
        Xem tuyến giao hàng
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 md:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-semibold text-ink">
                  Tuyến giao hàng dự kiến
                </h2>
                <p className="text-xs text-ink-muted">
                  Đây không phải vị trí thời gian thực của shipper.
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

            <div className="min-h-[420px]">
              <MapContainer
                center={[origin.latitude, origin.longitude]}
                zoom={12}
                className="h-[65vh] min-h-[420px] w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitRoute points={visiblePoints} />
                <CircleMarker
                  center={[origin.latitude, origin.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#fff',
                    fillColor: '#2563eb',
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>Điểm lấy hàng: {origin.address}</Popup>
                </CircleMarker>
                <CircleMarker
                  center={[destination.latitude, destination.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#fff',
                    fillColor: '#ff5a36',
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>Điểm nhận hàng: {destination.address}</Popup>
                </CircleMarker>
                {route.length ? (
                  <Polyline
                    positions={route}
                    pathOptions={{ color: '#ff5a36', weight: 5 }}
                  />
                ) : null}
              </MapContainer>
            </div>

            <div className="border-t border-border p-4 text-sm">
              {routeError ? (
                <p className="mb-2 text-warning">{routeError}</p>
              ) : null}
              <p>
                <strong>Điểm gửi:</strong> {origin.address}
              </p>
              <p className="mt-1">
                <strong>Điểm nhận:</strong> {destination.address}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
