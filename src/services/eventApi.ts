import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import type { ApiResponse } from './types';

export interface EventViewDto {
  id: string;
  tag: 'Хакатон' | 'Конференция' | 'Акселератор' | 'Карьера' | 'Обучение';
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  participants: string;
  chips: string[];
  isRegistered: boolean;
  isPast: boolean;
  dateISO?: string;
  endDateISO?: string;
  organizerName?: string;
  eventType?: string;
}

export interface TeacherEventViewDto {
  id: string;
  type: 'Консультация' | 'Хакатон' | 'Конференция' | 'Акселератор' | 'Другое';
  title: string;
  subtitle: string;
  dateISO: string;
  time: string;
  durationMin: number;
  place: string;
  participantCount: number;
  status?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  eventType?: string;
  createdBy: string;
  location?: string;
  maxParticipants?: number;
  status?: string;
}

export interface UpdateEventDto {
  id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  format?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  status?: string;
  eventType?: string;
  location?: string;
  maxParticipants?: number;
}

export interface EventApplicationDto {
  id: string;
  eventId: string;
  userId: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'PENDING_TEAM_APPROVAL';
  motivation?: string;
  skills?: string;
  createdAt: string;
  updatedAt: string;
  participantRole?: string;
  presentationTitle?: string;
  presentationDescription?: string;
  teamId?: string;
  userName?: string;
  teamName?: string;
}

export interface CreateEventApplicationDto {
  eventId: string;
  userId: string;
  motivation?: string;
  skills?: string;
  participantRole?: string;
  presentationTitle?: string;
  presentationDescription?: string;
  teamId?: string;
  teamName?: string;
}

export interface TeamMemberDetailDto {
  userId: string;
  userName: string | null;
  role: string;
  joinedAt: string;
}

export interface TeamDto {
  id: string;
  eventId: string;
  name: string;
  createdBy: string;
  createdAt: string;
  memberUserIds?: string[];
  members?: TeamMemberDetailDto[];
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
  lessonDate?: string;
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
  lessonDate?: string;
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
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
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
    createEvent: builder.mutation<ApiResponse<unknown>, CreateEventDto>({
      query: (body) => ({
        url: '/api/v1/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation<ApiResponse<unknown>, UpdateEventDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/events/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
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
    updateLesson: builder.mutation<ApiResponse<LessonDto>, { lessonId: string; body: CreateLessonDto }>({
      query: ({ lessonId, body }) => ({
        url: `/api/v1/events/schedule/lessons/${lessonId}`,
        method: 'PUT',
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
      invalidatesTags: ['Applications', 'Teams'],
    }),
    getMyApplications: builder.query<EventApplicationDto[], void>({
      query: () => '/api/v1/event-applications/my',
      providesTags: ['Applications'],
    }),
    updateApplicationStatus: builder.mutation<EventApplicationDto, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/api/v1/event-applications/${id}`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Applications'],
    }),
    getEventApplications: builder.query<EventApplicationDto[], string>({
      query: (eventId) => `/api/v1/events/${eventId}/applications`,
      providesTags: ['Applications'],
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
      invalidatesTags: ['Teams', 'Applications'],
    }),

    // Team join requests
    getTeamJoinRequests: builder.query<EventApplicationDto[], { eventId: string; teamId: string }>({
      query: ({ eventId, teamId }) => ({
        url: '/api/v1/event-applications/by-team',
        params: { eventId, teamId },
      }),
      providesTags: ['Applications'],
    }),
    teamDecision: builder.mutation<EventApplicationDto, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/v1/event-applications/${id}/team-decision`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Applications', 'Teams'],
    }),
  }),
});

export const {
  useGetStudentEventsQuery,
  useGetTeacherEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetDefensesQuery,
  useCreateDefenseMutation,
  useUpdateDefenseStatusMutation,
  useApplyToEventMutation,
  useCancelApplicationMutation,
  useGetMyApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetEventApplicationsQuery,
  useGetEventTeamsQuery,
  useCreateTeamMutation,
  useJoinTeamMutation,
  useLeaveTeamMutation,
  useGetTeamJoinRequestsQuery,
  useTeamDecisionMutation,
} = eventApi;
