import { apiClient } from './client';

export interface Listing {
  id: string;
  title: string;
  type: 'help_request' | 'volunteer_offer';
  status: 'draft' | 'active' | 'closed';
  categoryId: string;
  description: string;
  neighbourhood: string;
  latitude?: number;
  longitude?: number;
  frequency: 'once' | 'recurring' | 'flexible';
  contactPreference: 'in_app' | 'email' | 'both';
  showPhone: boolean;
  showEmail: boolean;
  images: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    neighbourhood: string;
    bio?: string;
    phone?: string;
  };
}

export interface ListingsParams {
  page?: number;
  pageSize?: number;
  type?: string;
  category?: string;
  neighbourhood?: string;
  search?: string;
  lat?: number;
  lng?: number;
}

export interface PaginatedListings {
  data: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const listingsApi = {
  getAll: (params: ListingsParams) =>
    apiClient.get<PaginatedListings>('/listings', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Listing>(`/listings/${id}`).then((r) => r.data),

  create: (data: FormData) =>
    apiClient.post<Listing>('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, data: FormData) =>
    apiClient.patch<Listing>(`/listings/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/listings/${id}`).then((r) => r.data),

  getMyListings: () =>
    apiClient.get<Listing[]>('/listings/my/listings').then((r) => r.data),
};
