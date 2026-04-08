export type UserRole = 'volunteer' | 'help_seeker' | 'organisation' | 'admin';
export type ListingType = 'help_request' | 'volunteer_offer';
export type ListingStatus = 'draft' | 'active' | 'closed';
export type Frequency = 'once' | 'recurring' | 'flexible';
export type Gender = 'man' | 'vrouw' | 'anders' | 'prefer_not_to_say';
export type ContactPreference = 'in_app' | 'email' | 'both';
export type Language = 'nl' | 'en' | 'ar';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
