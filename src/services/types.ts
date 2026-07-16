/**
 * Shared API response wrapper returned by all backend endpoints.
 */
export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}
