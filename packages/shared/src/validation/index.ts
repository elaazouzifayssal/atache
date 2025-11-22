import { MOROCCO_PHONE_REGEX, MOROCCO_CITIES } from '../constants';

// Phone validation
export const isValidMoroccoPhone = (phone: string): boolean => {
  return MOROCCO_PHONE_REGEX.test(phone);
};

// Normalize phone to E.164 format
export const normalizePhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle different input formats
  if (digits.startsWith('212')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+212${digits.slice(1)}`;
  }
  return `+212${digits}`;
};

// City validation
export const isValidCity = (city: string): boolean => {
  return MOROCCO_CITIES.includes(city as (typeof MOROCCO_CITIES)[number]);
};

// Budget validation
export const isValidBudget = (amount: number): boolean => {
  return amount > 0 && amount <= 100000; // Max 100,000 DH
};

// Password validation
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

export const getPasswordErrors = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule');
  if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule');
  if (!/\d/.test(password)) errors.push('Un chiffre');
  return errors;
};

// OTP validation
export const OTP_LENGTH = 6;
export const isValidOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};
