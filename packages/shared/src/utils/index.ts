import { CURRENCY } from '../constants';
import { TimePreference } from '../types';

// Format price with Moroccan Dirham
export const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString('fr-MA')} ${CURRENCY.symbol}`;
};

// Format price range
export const formatPriceRange = (min: number, max: number): string => {
  return `${min.toLocaleString('fr-MA')} - ${max.toLocaleString('fr-MA')} ${CURRENCY.symbol}`;
};

// Format distance
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// Format time preference to French
export const formatTimePreference = (pref: TimePreference): string => {
  const map: Record<TimePreference, string> = {
    MORNING: 'Matin (8h-12h)',
    AFTERNOON: 'Après-midi (12h-17h)',
    EVENING: 'Soir (17h-21h)',
    FLEXIBLE: 'Flexible',
  };
  return map[pref];
};

// Format date relative (aujourd'hui, demain, etc.)
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const target = new Date(date);

  // Reset time for comparison
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays > 1 && diffDays < 7) {
    return target.toLocaleDateString('fr-MA', { weekday: 'long' });
  }
  return target.toLocaleDateString('fr-MA', { day: 'numeric', month: 'short' });
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

// Get initials from name
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Mask phone number for privacy
export const maskPhone = (phone: string): string => {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 7)}XXX${phone.slice(-2)}`;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
