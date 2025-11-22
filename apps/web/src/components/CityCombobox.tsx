'use client';

import { useState, useRef, useEffect } from 'react';

// Morocco cities with regions for better UX
const MOROCCO_CITIES = [
  { name: 'Casablanca', region: 'Casablanca-Settat', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', region: 'Rabat-Salé-Kénitra', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech', region: 'Marrakech-Safi', lat: 31.6295, lng: -7.9811 },
  { name: 'Fès', region: 'Fès-Meknès', lat: 34.0181, lng: -5.0078 },
  { name: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', lat: 35.7595, lng: -5.8340 },
  { name: 'Agadir', region: 'Souss-Massa', lat: 30.4278, lng: -9.5981 },
  { name: 'Meknès', region: 'Fès-Meknès', lat: 33.8935, lng: -5.5547 },
  { name: 'Oujda', region: 'Oriental', lat: 34.6805, lng: -1.9076 },
  { name: 'Kénitra', region: 'Rabat-Salé-Kénitra', lat: 34.2610, lng: -6.5802 },
  { name: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma', lat: 35.5785, lng: -5.3684 },
  { name: 'Safi', region: 'Marrakech-Safi', lat: 32.2994, lng: -9.2372 },
  { name: 'El Jadida', region: 'Casablanca-Settat', lat: 33.2316, lng: -8.5007 },
  { name: 'Nador', region: 'Oriental', lat: 35.1681, lng: -2.9287 },
  { name: 'Béni Mellal', region: 'Béni Mellal-Khénifra', lat: 32.3373, lng: -6.3498 },
  { name: 'Mohammedia', region: 'Casablanca-Settat', lat: 33.6866, lng: -7.3827 },
  { name: 'Khouribga', region: 'Béni Mellal-Khénifra', lat: 32.8811, lng: -6.9063 },
  { name: 'Settat', region: 'Casablanca-Settat', lat: 33.0016, lng: -7.6166 },
  { name: 'Taza', region: 'Fès-Meknès', lat: 34.2300, lng: -3.9977 },
  { name: 'Khémisset', region: 'Rabat-Salé-Kénitra', lat: 33.8242, lng: -6.0662 },
  { name: 'Larache', region: 'Tanger-Tétouan-Al Hoceïma', lat: 35.1932, lng: -6.1560 },
  { name: 'Salé', region: 'Rabat-Salé-Kénitra', lat: 34.0531, lng: -6.7985 },
  { name: 'Temara', region: 'Rabat-Salé-Kénitra', lat: 33.9287, lng: -6.9122 },
  { name: 'Essaouira', region: 'Marrakech-Safi', lat: 31.5085, lng: -9.7595 },
  { name: 'Al Hoceïma', region: 'Tanger-Tétouan-Al Hoceïma', lat: 35.2517, lng: -3.9372 },
  { name: 'Ouarzazate', region: 'Drâa-Tafilalet', lat: 30.9335, lng: -6.9370 },
  { name: 'Errachidia', region: 'Drâa-Tafilalet', lat: 31.9314, lng: -4.4288 },
  { name: 'Guelmim', region: 'Guelmim-Oued Noun', lat: 28.9870, lng: -10.0574 },
  { name: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', lat: 27.1253, lng: -13.1625 },
  { name: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab', lat: 23.6848, lng: -15.9580 },
];

interface CityComboboxProps {
  value: string;
  onChange: (city: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = 'Rechercher une ville...',
}: CityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCities = search
    ? MOROCCO_CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(search.toLowerCase()) ||
          city.region.toLowerCase().includes(search.toLowerCase())
      )
    : MOROCCO_CITIES;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement;
      highlighted?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (city: typeof MOROCCO_CITIES[0]) => {
    onChange({ name: city.name, lat: city.lat, lng: city.lng });
    setSearch('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredCities.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCities[highlightedIndex]) {
          handleSelect(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
    }
  };

  const selectedCity = MOROCCO_CITIES.find((c) => c.name === value);

  return (
    <div className="relative">
      {/* Input / Trigger */}
      <div
        className={`input flex items-center gap-2 cursor-pointer ${
          isOpen ? 'ring-2 ring-primary border-primary' : ''
        }`}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent"
            autoComplete="off"
          />
        ) : (
          <span className={`flex-1 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
        )}

        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* List */}
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-auto py-2"
          >
            {filteredCities.length === 0 ? (
              <li className="px-4 py-3 text-gray-500 text-center">
                Aucune ville trouvée
              </li>
            ) : (
              filteredCities.map((city, index) => (
                <li
                  key={city.name}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                    highlightedIndex === index ? 'bg-primary/5' : ''
                  } ${value === city.name ? 'bg-primary/10' : ''}`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{city.name}</p>
                    <p className="text-sm text-gray-500">{city.region}</p>
                  </div>
                  {value === city.name && (
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </>
      )}

      {/* Selected city region hint */}
      {selectedCity && !isOpen && (
        <p className="text-xs text-gray-500 mt-1">{selectedCity.region}</p>
      )}
    </div>
  );
}

// Export the cities data for use in other components
export { MOROCCO_CITIES };
