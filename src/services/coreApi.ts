import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  birthDate?: string;
  facultyId?: string;
  departmentId?: string;
  studyProgram?: string;
  groupName?: string;
  enrollmentYear?: number;
  currentSemester?: number;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface StudentInfoDto {
  name: string;
  email: string;
  phone: string;
  group: string;
  course: string;
  initials: string;
}

export interface ApplicationViewDto {
  id: string;
  title: string;
  description: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  kind: 'PROJECT' | 'CONSULT' | 'VKR';
  student: StudentInfoDto;
  category: string;
  duration: string;
  teamSize: string;
  teacherReply?: string;
}

export interface UserLinkDto {
  userId: string;
  linkType: 'GITHUB' | 'LINKEDIN' | 'PORTFOLIO' | 'WEBSITE' | 'CV' | 'OTHER';
  url: string;
}

export interface UserSkillDto {
  userId: string;
  skillName: string;
  level: number;
  verified: boolean;
}

export interface UserLanguageDto {
  userId: string;
  language: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';
}

export interface DashboardSummaryDto {
  role: string;
  kpis?: { label: string; value: number; delta: string; icon?: string; iconTone: string }[];
  studentKpis?: { title: string; value: string; sub: string }[];
  headKpis?: { label: string; value: number; delta: string; icon?: string; iconTone: string }[];
  weeklyChart?: Record<string, unknown>[];
  studentProgress?: Record<string, unknown>[];
  lastActivity?: Record<string, unknown>[];
  activeStudents?: Record<string, unknown>[];
  attentionProjects?: Record<string, unknown>[];
  barData?: Record<string, unknown>[];
  pieData?: Record<string, unknown>[];
  activities?: Record<string, unknown>[];
  subjectsData?: Record<string, unknown>[];
  performanceByGroup?: Record<string, unknown>[];
  studentsByCourse?: Record<string, unknown>[];
  semesters?: Record<string, unknown>[];
  activityByMonth?: Record<string, unknown>[];
}

export const coreApi = createApi({
  reducerPath: 'coreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Applications', 'Profile', 'Teachers', 'UserLinks', 'UserSkills', 'UserLanguages'],
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<TokenDto>, LoginRequest>({
      query: (body) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<ApiResponse<UserProfileDto>, RegisterRequest>({
      query: (body) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query<ApiResponse<UserProfileDto>, string>({
      query: (userId) => ({
        url: `/api/v1/auth/profile/${userId}`,
      }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<
      ApiResponse<UserProfileDto>,
      { userId: string; data: Partial<UserProfileDto> }
    >({
      query: ({ userId, data }) => ({
        url: `/api/v1/auth/profile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    getTeachers: builder.query<ApiResponse<UserProfileDto[]>, void>({
      query: () => ({
        url: '/api/v1/users/teachers',
      }),
      providesTags: ['Teachers'],
    }),
    getLecturerApplications: builder.query<ApiResponse<ApplicationViewDto[]>, string>({
      query: (lecturerId) => ({
        url: `/api/v1/applications/lecturer/${lecturerId}`,
      }),
      providesTags: ['Applications'],
    }),
    getStudentApplications: builder.query<ApiResponse<ApplicationViewDto[]>, string>({
      query: (studentId) => ({
        url: `/api/v1/applications/student/${studentId}`,
      }),
      providesTags: ['Applications'],
    }),
    getDashboardSummary: builder.query<ApiResponse<DashboardSummaryDto>, string>({
      query: (userId) => ({
        url: `/api/v1/dashboards/${userId}/summary`,
      }),
    }),
    updateApplicationStatus: builder.mutation<
      ApiResponse<ApplicationViewDto>,
      { applicationId: string; status: string; teacherReply?: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/api/v1/applications/${applicationId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Applications'],
    }),
    getUserLinks: builder.query<UserLinkDto[], string>({
      query: (userId) => `/api/v1/user-links/user/${userId}`,
      providesTags: ['UserLinks'],
    }),
    createUserLink: builder.mutation<UserLinkDto, UserLinkDto>({
      query: (body) => ({ url: '/api/v1/user-links', method: 'POST', body }),
      invalidatesTags: ['UserLinks'],
    }),
    updateUserLink: builder.mutation<UserLinkDto, UserLinkDto>({
      query: ({ userId, linkType, url }) => ({
        url: `/api/v1/user-links/${userId}/${linkType}`,
        method: 'PUT',
        body: { userId, linkType, url },
      }),
      invalidatesTags: ['UserLinks'],
    }),
    deleteUserLink: builder.mutation<void, { userId: string; linkType: string }>({
      query: ({ userId, linkType }) => ({
        url: `/api/v1/user-links/${userId}/${linkType}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserLinks'],
    }),
    getUserSkills: builder.query<UserSkillDto[], string>({
      query: (userId) => `/api/v1/user-skills/user/${userId}`,
      providesTags: ['UserSkills'],
    }),
    createUserSkill: builder.mutation<UserSkillDto, UserSkillDto>({
      query: (body) => ({ url: '/api/v1/user-skills', method: 'POST', body }),
      invalidatesTags: ['UserSkills'],
    }),
    deleteUserSkill: builder.mutation<void, { userId: string; skillName: string }>({
      query: ({ userId, skillName }) => ({
        url: `/api/v1/user-skills/${userId}/${skillName}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserSkills'],
    }),
    getUserLanguages: builder.query<UserLanguageDto[], string>({
      query: (userId) => `/api/v1/user-languages/user/${userId}`,
      providesTags: ['UserLanguages'],
    }),
    createUserLanguage: builder.mutation<UserLanguageDto, UserLanguageDto>({
      query: (body) => ({ url: '/api/v1/user-languages', method: 'POST', body }),
      invalidatesTags: ['UserLanguages'],
    }),
    deleteUserLanguage: builder.mutation<void, { userId: string; language: string }>({
      query: ({ userId, language }) => ({
        url: `/api/v1/user-languages/${userId}/${language}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserLanguages'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useGetTeachersQuery,
  useGetLecturerApplicationsQuery,
  useGetStudentApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetDashboardSummaryQuery,
  useGetUserLinksQuery,
  useCreateUserLinkMutation,
  useUpdateUserLinkMutation,
  useDeleteUserLinkMutation,
  useGetUserSkillsQuery,
  useCreateUserSkillMutation,
  useDeleteUserSkillMutation,
  useGetUserLanguagesQuery,
  useCreateUserLanguageMutation,
  useDeleteUserLanguageMutation,
} = coreApi;
