import { PublicUserProfile } from './user';
import { Category } from './category';

export enum JobStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BudgetType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
}

export enum TimePreference {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  FLEXIBLE = 'FLEXIBLE',
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  addressId: string;
  latitude: number;
  longitude: number;
  preferredDate: Date;
  timePreference: TimePreference;
  budgetType: BudgetType;
  budgetAmount: number;
  photos: string[];
  status: JobStatus;
  assignedHelperId?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobWithDetails extends Job {
  client: PublicUserProfile;
  category: Category;
  address: { city: string; neighborhood?: string | null };
  applicationsCount?: number;
  distance?: number;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Application {
  id: string;
  jobId: string;
  helperId: string;
  message?: string | null;
  proposedRate?: number | null;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}
