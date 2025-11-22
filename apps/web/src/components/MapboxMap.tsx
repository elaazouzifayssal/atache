'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// You can get a free token at https://account.mapbox.com/
// For development, we'll use a placeholder - replace with your actual token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoia2hlZG1hLWFwcCIsImEiOiJjbTQ0ZHh4MXMwMDAxMmlzOHZ5YjRmc2N1In0.placeholder';

interface MapboxMapProps {
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
  zoom?: number;
}

export default function MapboxMap({ position, onPositionChange, zoom = 14 }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if token is valid
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('placeholder')) {
      setMapError(true);
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [position.lng, position.lat],
        zoom: zoom,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add attribution in bottom right
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      // Create draggable marker
      marker.current = new mapboxgl.Marker({
        color: '#10B981', // Primary color
        draggable: true,
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          onPositionChange(lngLat.lat, lngLat.lng);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        const { lat, lng } = e.lngLat;
        marker.current?.setLngLat([lng, lat]);
        onPositionChange(lat, lng);
      });

    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setMapError(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update marker and map when position changes externally
  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLngLat([position.lng, position.lat]);
      map.current.flyTo({
        center: [position.lng, position.lat],
        essential: true,
      });
    }
  }, [position.lat, position.lng]);

  // Fallback to basic Leaflet if Mapbox fails
  if (mapError) {
    return <FallbackMap position={position} onPositionChange={onPositionChange} />;
  }

  return (
    <div
      ref={mapContainer}
      className="h-[300px] w-full rounded-xl overflow-hidden"
    />
  );
}

// Fallback component using Leaflet (for when Mapbox token is not configured)
function FallbackMap({ position, onPositionChange }: { position: { lat: number; lng: number }; onPositionChange: (lat: number, lng: number) => void }) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet
    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!containerRef.current || mapRef.current) return;

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const map = L.map(containerRef.current).setView([position.lat, position.lng], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const marker = L.marker([position.lat, position.lng], {
        icon: defaultIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPositionChange(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      });

      setIsLoaded(true);
    };

    loadLeaflet();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && isLoaded) {
      markerRef.current.setLatLng([position.lat, position.lng]);
      mapRef.current.setView([position.lat, position.lng]);
    }
  }, [position.lat, position.lng, isLoaded]);

  return (
    <div
      ref={containerRef}
      className="h-[300px] w-full rounded-xl overflow-hidden bg-gray-100"
    />
  );
}
