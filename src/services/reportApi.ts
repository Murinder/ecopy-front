import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ReportDto {
  id: string;
  reportType: string;
  parameters: Record<string, unknown>;
  generatedAt: string;
  filePath: string;
  scheduled: boolean;
  createdBy: string;
  format: string;
  status: string;
  errorMessage?: string;
}

export interface CreateReportDto {
  reportType: string;
  parameters: Record<string, unknown>;
  format: string;
  scheduled?: boolean;
}

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Reports'],
  endpoints: (builder) => ({
    getMyReports: builder.query<ApiResponse<ReportDto[]>, void>({
      query: () => ({ url: '/api/v1/reports/my' }),
      providesTags: ['Reports'],
    }),
    getReportById: builder.query<ApiResponse<ReportDto>, string>({
      query: (reportId) => ({ url: `/api/v1/reports/${reportId}` }),
    }),
    generateReport: builder.mutation<ApiResponse<ReportDto>, CreateReportDto>({
      query: (body) => ({
        url: '/api/v1/reports/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
});

export const {
  useGetMyReportsQuery,
  useGetReportByIdQuery,
  useGenerateReportMutation,
} = reportApi;
