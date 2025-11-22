export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  overallRating: number;
  punctualityRating?: number | null;
  qualityRating?: number | null;
  communicationRating?: number | null;
  valueRating?: number | null;
  comment?: string | null;
  isClientReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithReviewer extends Review {
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}
