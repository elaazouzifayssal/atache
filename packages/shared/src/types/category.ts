export interface Category {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  icon: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
}
