import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

export interface ProjectDto {
  id: string;
  title: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'FROZEN' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  departmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMemberDto {
  projectId: string;
  userId: string;
  userName?: string;
  role: 'LEADER' | 'MEMBER' | 'MENTOR' | 'OBSERVER';
  joinedAt?: string;
}

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  assignedTo?: string;
  dueDate?: string;
}

export interface DocumentDto {
  id: string;
  projectId: string;
  taskId?: string;
  filePath: string;
  version?: number;
  uploadedBy?: string;
  createdAt?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message?: string;
  data: T;
  timestamp?: string;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Projects', 'Tasks', 'Documents'],
  endpoints: (builder) => ({
    getUserProjects: builder.query<ApiResponse<ProjectDto[]>, string>({
      query: (userId) => ({
        url: `/api/v1/projects/user/${userId}`,
      }),
      providesTags: ['Projects'],
    }),
    createProject: builder.mutation<ApiResponse<ProjectDto>, Partial<ProjectDto>>({
      query: (body) => ({
        url: '/api/v1/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectTasks: builder.query<ApiResponse<TaskDto[]>, string>({
      query: (projectId) => ({
        url: `/api/v1/tasks/project/${projectId}`,
      }),
      providesTags: ['Tasks'],
    }),
    createTask: builder.mutation<ApiResponse<TaskDto>, Partial<TaskDto>>({
      query: (body) => ({
        url: '/api/v1/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateTask: builder.mutation<ApiResponse<TaskDto>, { taskId: string; title?: string; description?: string }>({
      query: ({ taskId, ...body }) => ({
        url: `/api/v1/tasks/${taskId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),
    changeTaskStatus: builder.mutation<
      ApiResponse<TaskDto>,
      { taskId: string; status: 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' }
    >({
      query: ({ taskId, status }) => ({
        url: `/api/v1/tasks/${taskId}/status`,
        method: 'PATCH',
        params: { status },
      }),
      invalidatesTags: ['Tasks'],
    }),
    getProjectMembers: builder.query<ApiResponse<ProjectMemberDto[]>, string>({
      query: (projectId) => `/api/v1/projects/${projectId}/members`,
      providesTags: ['Projects'],
    }),
    addProjectMember: builder.mutation<ApiResponse<ProjectMemberDto>, { projectId: string; userId: string; role: string }>({
      query: ({ projectId, userId, role }) => ({
        url: `/api/v1/projects/${projectId}/members`,
        method: 'POST',
        params: { userId, role },
      }),
      invalidatesTags: ['Projects'],
    }),
    removeProjectMember: builder.mutation<ApiResponse<void>, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({
        url: `/api/v1/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    getProjectDocuments: builder.query<ApiResponse<DocumentDto[]>, string>({
      query: (projectId) => `/api/v1/documents/project/${projectId}`,
      providesTags: ['Documents'],
    }),
    uploadDocument: builder.mutation<ApiResponse<DocumentDto>, FormData>({
      query: (formData) => ({
        url: '/api/v1/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Documents'],
    }),
    deleteDocument: builder.mutation<ApiResponse<void>, string>({
      query: (documentId) => ({
        url: `/api/v1/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const {
  useGetUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useChangeTaskStatusMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = projectApi;
