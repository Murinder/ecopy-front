import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface StudentRatingDto {
  userId: string;
  userName: string | null;
  totalScore: number;
  calculationDetails: string;
  updatedAt: string;
  semester: number;
  verificationStatus: string;
}

export interface RatingBreakdownDto {
  userId: string;
  totalScore: number;
  verificationStatus: string;
  semester: number;
  updatedAt: string;
  academicScore: number;
  activityScore: number;
  communicationScore: number;
  monthGrowth: number;
  rawScore: number;
}

export interface RatingHistoryDto {
  id: string;
  userId: string;
  departmentId: string | null;
  score: number;
  calculatedAt: string;
  reason: string;
  criteriaId: string | null;
  relatedEntityId: string | null;
  semester: number;
}

export interface RatingComparisonDto {
  userId: string;
  userName: string | null;
  userAcademic: number;
  userActivity: number;
  userCommunication: number;
  userTotal: number;
  avgAcademic: number;
  avgActivity: number;
  avgCommunication: number;
  avgTotal: number;
}

export interface RatingAchievementDto {
  id: string;
  title: string;
  description: string;
  score: number;
  category: string;
  earnedAt: string | null;
  relatedEntityId: string | null;
}

export const ratingApi = createApi({
  reducerPath: 'ratingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Ratings'],
  endpoints: (builder) => ({
    getStudentRating: builder.query<ApiResponse<StudentRatingDto>, string>({
      query: (userId) => ({ url: `/api/v1/ratings/students/${userId}` }),
      providesTags: ['Ratings'],
    }),
    getTopStudents: builder.query<ApiResponse<StudentRatingDto[]>, number | void>({
      query: (limit) => ({
        url: '/api/v1/ratings/students/top',
        params: { limit: limit ?? 100 },
      }),
      providesTags: ['Ratings'],
    }),
    getRatingDetails: builder.query<ApiResponse<RatingHistoryDto[]>, string>({
      query: (userId) => ({ url: `/api/v1/ratings/students/${userId}/details` }),
    }),
    getRatingBreakdown: builder.query<ApiResponse<RatingBreakdownDto>, string>({
      query: (userId) => ({ url: `/api/v1/ratings/students/${userId}/breakdown` }),
      providesTags: ['Ratings'],
    }),
    getComparison: builder.query<ApiResponse<RatingComparisonDto>, string>({
      query: (userId) => ({ url: `/api/v1/ratings/students/${userId}/comparison` }),
      providesTags: ['Ratings'],
    }),
    getAchievements: builder.query<ApiResponse<RatingAchievementDto[]>, string>({
      query: (userId) => ({ url: `/api/v1/ratings/students/${userId}/achievements` }),
      providesTags: ['Ratings'],
    }),
  }),
});

export const {
  useGetStudentRatingQuery,
  useGetTopStudentsQuery,
  useGetRatingDetailsQuery,
  useGetRatingBreakdownQuery,
  useGetComparisonQuery,
  useGetAchievementsQuery,
} = ratingApi;
