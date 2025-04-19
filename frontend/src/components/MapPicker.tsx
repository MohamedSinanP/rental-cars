import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';

const markerIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface MapPickerProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export const MapPicker = ({ selectedLocation, onLocationSelect }: MapPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      setMarkerPosition([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });

    return markerPosition ? <Marker position={markerPosition} icon={markerIcon} /> : null;
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};
