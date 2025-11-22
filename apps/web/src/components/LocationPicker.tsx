'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CityCombobox, { MOROCCO_CITIES } from './CityCombobox';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    city: string;
    address: string;
  }) => void;
  initialCity?: string;
  initialLocation?: { lat: number; lng: number };
}

// Dynamically import the map component to avoid SSR issues
const MapboxMap = dynamic(() => import('./MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function LocationPicker({
  onLocationSelect,
  initialCity = 'Casablanca',
  initialLocation,
}: LocationPickerProps) {
  const initialCityData = MOROCCO_CITIES.find(c => c.name === initialCity) || MOROCCO_CITIES[0];

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || { lat: initialCityData.lat, lng: initialCityData.lng }
  );
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        }
      );
      const data = await response.json();

      if (data.address) {
        const parts = [];
        if (data.address.house_number) parts.push(data.address.house_number);
        if (data.address.road) parts.push(data.address.road);
        if (data.address.suburb || data.address.neighbourhood) {
          parts.push(data.address.suburb || data.address.neighbourhood);
        }

        const formattedAddress = parts.length > 0 ? parts.join(', ') : '';
        setAddress(formattedAddress);

        // Try to detect city from response
        const detectedCity = data.address.city || data.address.town || data.address.village;
        const matchedCity = MOROCCO_CITIES.find(c =>
          c.name.toLowerCase() === detectedCity?.toLowerCase()
        );
        if (matchedCity) {
          setSelectedCity(matchedCity.name);
        }

        return formattedAddress;
      }
      return '';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return '';
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Handle map position change
  const handlePositionChange = async (lat: number, lng: number) => {
    setPosition({ lat, lng });
    const addr = await reverseGeocode(lat, lng);

    onLocationSelect({
      latitude: lat,
      longitude: lng,
      city: selectedCity,
      address: addr || address,
    });
  };

  // Handle city change from combobox
  const handleCityChange = (city: { name: string; lat: number; lng: number }) => {
    setSelectedCity(city.name);
    setPosition({ lat: city.lat, lng: city.lng });
    setAddress('');
    onLocationSelect({
      latitude: city.lat,
      longitude: city.lng,
      city: city.name,
      address: '',
    });
  };

  // Use current location via GPS
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        const addr = await reverseGeocode(latitude, longitude);

        onLocationSelect({
          latitude,
          longitude,
          city: selectedCity,
          address: addr,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Impossible d\'obtenir votre position. Veuillez vérifier vos paramètres de localisation.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* City selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ville
        </label>
        <CityCombobox
          value={selectedCity}
          onChange={handleCityChange}
          placeholder="Rechercher une ville..."
        />
      </div>

      {/* Current location button */}
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={isLocating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 rounded-xl text-gray-700 transition border border-gray-200 disabled:opacity-50"
      >
        {isLocating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span>Localisation en cours...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Utiliser ma position actuelle</span>
          </>
        )}
      </button>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <MapboxMap
          position={position}
          onPositionChange={handlePositionChange}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Cliquez sur la carte ou déplacez le marqueur pour ajuster la position
      </p>

      {/* Selected address display */}
      {(address || isReverseGeocoding) && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Adresse détectée</p>
              {isReverseGeocoding ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-500">Recherche de l'adresse...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-900 mt-0.5">{address || 'Adresse non trouvée'}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{selectedCity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
