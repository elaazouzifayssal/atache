export enum UserRole {
  CLIENT = 'CLIENT',
  HELPER = 'HELPER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  city: string;
  neighborhood?: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
}

export interface HelperProfile {
  id: string;
  userId: string;
  bio: string;
  yearsExperience?: number | null;
  workRadius: number;
  isAvailable: boolean;
  isVerified: boolean;
  latitude?: number | null;
  longitude?: number | null;
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  responseRate: number;
  portfolioPhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HelperSkill {
  id: string;
  helperProfileId: string;
  categoryId: string;
  hourlyRate: number;
  createdAt: Date;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface HelperAvailability {
  id: string;
  helperProfileId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  neighborhood?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Public profile view (limited info)
export interface PublicUserProfile {
  id: string;
  firstName: string;
  lastName: string; // Truncated to initial
  avatarUrl?: string | null;
  city: string;
  role: UserRole;
  createdAt: Date;
  helperProfile?: PublicHelperProfile | null;
}

export interface PublicHelperProfile {
  bio: string;
  skills: HelperSkillWithCategory[];
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  isVerified: boolean;
  portfolioPhotos: string[];
}

export interface HelperSkillWithCategory extends HelperSkill {
  category: {
    id: string;
    nameFr: string;
    nameAr: string;
    slug: string;
  };
}
