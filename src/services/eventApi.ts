import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

export interface EventViewDto {
  id: string;
  tag: 'Хакатон' | 'Карьера' | 'Обучение';
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  participants: string;
  chips: string[];
  isRegistered: boolean;
  isPast: boolean;
}

export interface TeacherEventViewDto {
  id: string;
  type: 'Консультация' | 'Лекция' | 'Семинар' | 'Защита';
  title: string;
  subtitle: string;
  dateISO: string;
  time: string;
  durationMin: number;
  place: string;
  participantCount: number;
}

export interface EventApplicationDto {
  id: string;
  eventId: string;
  userId: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
  motivation?: string;
  skills?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventApplicationDto {
  eventId: string;
  userId: string;
  motivation?: string;
  skills?: string;
}

export interface TeamDto {
  id: string;
  eventId: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateTeamDto {
  eventId: string;
  name: string;
}

export interface TeamMemberDto {
  teamId: string;
  userId: string;
  role: string;
}

export interface CreateTeamMemberDto {
  teamId: string;
  userId: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface LessonDto {
  id: string;
  userId: string;
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  lessonType: string;
  groupName?: string;
  room?: string;
  semester?: number;
}

export interface CreateLessonDto {
  userId: string;
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  lessonType: string;
  groupName?: string;
  room?: string;
  semester?: number;
}

export interface DefenseDto {
  id: string;
  studentId: string;
  studentName?: string;
  supervisorId: string;
  defenseType: string;
  status: string;
  projectTitle?: string;
  defenseDate?: string;
  defenseTime?: string;
  room?: string;
  grade?: number;
  reviewersCount?: number;
}

export interface CreateDefenseDto {
  studentId: string;
  studentName?: string;
  supervisorId: string;
  defenseType: string;
  projectTitle?: string;
  defenseDate?: string;
  defenseTime?: string;
  room?: string;
  reviewersCount?: number;
}

export const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Events', 'Lessons', 'Defenses', 'Applications', 'Teams'],
  endpoints: (builder) => ({
    getStudentEvents: builder.query<ApiResponse<EventViewDto[]>, string | undefined>({
      query: (userId) => ({
        url: '/api/v1/events/view/student',
        params: userId ? { userId } : undefined,
      }),
      providesTags: ['Events'],
    }),
    getTeacherEvents: builder.query<ApiResponse<TeacherEventViewDto[]>, string>({
      query: (userId) => ({
        url: '/api/v1/events/view/teacher',
        params: { userId },
      }),
      providesTags: ['Events'],
    }),
    getLessons: builder.query<ApiResponse<LessonDto[]>, { userId: string; semester?: number }>({
      query: ({ userId, semester }) => ({
        url: '/api/v1/events/schedule/lessons',
        params: { userId, ...(semester != null ? { semester } : {}) },
      }),
      providesTags: ['Lessons'],
    }),
    createLesson: builder.mutation<ApiResponse<LessonDto>, CreateLessonDto>({
      query: (body) => ({
        url: '/api/v1/events/schedule/lessons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Lessons'],
    }),
    deleteLesson: builder.mutation<ApiResponse<void>, string>({
      query: (lessonId) => ({
        url: `/api/v1/events/schedule/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lessons'],
    }),
    getDefenses: builder.query<ApiResponse<DefenseDto[]>, { supervisorId?: string; studentId?: string }>({
      query: (params) => ({
        url: '/api/v1/events/defenses',
        params,
      }),
      providesTags: ['Defenses'],
    }),
    createDefense: builder.mutation<ApiResponse<DefenseDto>, CreateDefenseDto>({
      query: (body) => ({
        url: '/api/v1/events/defenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Defenses'],
    }),
    updateDefenseStatus: builder.mutation<ApiResponse<DefenseDto>, { defenseId: string; status: string; grade?: number }>({
      query: ({ defenseId, ...params }) => ({
        url: `/api/v1/events/defenses/${defenseId}/status`,
        method: 'PATCH',
        params,
      }),
      invalidatesTags: ['Defenses'],
    }),

    // Applications
    applyToEvent: builder.mutation<EventApplicationDto, CreateEventApplicationDto>({
      query: (body) => ({ url: '/api/v1/event-applications', method: 'POST', body }),
      invalidatesTags: ['Events', 'Applications'],
    }),
    cancelApplication: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/event-applications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Applications'],
    }),
    getMyApplications: builder.query<EventApplicationDto[], void>({
      query: () => '/api/v1/event-applications/my',
      providesTags: ['Applications'],
    }),
    updateApplicationStatus: builder.mutation<EventApplicationDto, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/api/v1/event-applications/${id}`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Applications'],
    }),

    // Teams
    getEventTeams: builder.query<TeamDto[], string>({
      query: (eventId) => `/api/v1/events/${eventId}/teams`,
      providesTags: ['Teams'],
    }),
    createTeam: builder.mutation<TeamDto, CreateTeamDto>({
      query: (body) => ({ url: '/api/v1/teams', method: 'POST', body }),
      invalidatesTags: ['Teams'],
    }),
    joinTeam: builder.mutation<TeamMemberDto, CreateTeamMemberDto>({
      query: (body) => ({ url: '/api/v1/team-members', method: 'POST', body }),
      invalidatesTags: ['Teams'],
    }),
    leaveTeam: builder.mutation<void, { teamId: string; userId: string }>({
      query: ({ teamId, userId }) => ({ url: `/api/v1/team-members/${teamId}/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Teams'],
    }),
  }),
});

export const {
  useGetStudentEventsQuery,
  useGetTeacherEventsQuery,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useGetDefensesQuery,
  useCreateDefenseMutation,
  useUpdateDefenseStatusMutation,
  useApplyToEventMutation,
  useCancelApplicationMutation,
  useGetMyApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetEventTeamsQuery,
  useCreateTeamMutation,
  useJoinTeamMutation,
  useLeaveTeamMutation,
} = eventApi;
