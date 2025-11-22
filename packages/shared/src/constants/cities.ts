export const MOROCCO_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Salé',
  'Nador',
  'Mohammedia',
  'El Jadida',
  'Béni Mellal',
  'Khouribga',
  'Safi',
  'Khémisset',
  'Settat',
  'Larache',
  'Taza',
  'Berrechid',
  'Errachidia',
  'Guelmim',
  'Essaouira',
] as const;

export type MoroccoCity = (typeof MOROCCO_CITIES)[number];

export const MOROCCO_REGIONS = [
  'Casablanca-Settat',
  'Rabat-Salé-Kénitra',
  'Marrakech-Safi',
  'Fès-Meknès',
  'Tanger-Tétouan-Al Hoceïma',
  'Souss-Massa',
  'Oriental',
  'Béni Mellal-Khénifra',
  'Drâa-Tafilalet',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab',
  'Guelmim-Oued Noun',
] as const;

export type MoroccoRegion = (typeof MOROCCO_REGIONS)[number];

// Phone prefix for Morocco
export const MOROCCO_PHONE_PREFIX = '+212';
export const MOROCCO_PHONE_REGEX = /^\+212[5-7]\d{8}$/;

// Currency
export const CURRENCY = {
  code: 'MAD',
  symbol: 'DH',
  name: 'Dirham marocain',
} as const;
