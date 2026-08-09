import { useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in bundler
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onChangeCoordinates: (lat: string, lng: string) => void;
}

// Component to dynamically pan map when parent coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], map.getZoom(), { animate: true });
  return null;
}

// Component to capture map clicks and emit selected location
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChangeCoordinates,
}: LocationPickerProps) {
  const markerRef = useRef<L.Marker>(null);

  // Validate and parse numeric latitude & longitude
  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);

  const isValidLat = !isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90;
  const isValidLng = !isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180;

  // Fallback center if coordinates missing or invalid (Default: Chennai)
  const defaultLat = 13.0827;
  const defaultLng = 80.2707;

  const currentLat = isValidLat ? parsedLat : defaultLat;
  const currentLng = isValidLng ? parsedLng : defaultLng;

  // Handle marker dragend event
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChangeCoordinates(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
        }
      },
    }),
    [onChangeCoordinates]
  );

  const handleMapClick = (lat: number, lng: number) => {
    onChangeCoordinates(lat.toFixed(6), lng.toFixed(6));
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full h-[260px] sm:h-[300px] rounded-xl border border-slate-200 shadow-inner overflow-hidden relative z-0">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={currentLat} lng={currentLng} />
          <MapClickHandler onClick={handleMapClick} />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[currentLat, currentLng]}
            icon={customIcon}
            ref={markerRef}
          />
        </MapContainer>
      </div>
      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <span>💡 Tap anywhere on the map or drag the marker to set precise hazard position</span>
      </p>
    </div>
  );
}
