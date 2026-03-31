import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ProjectDto {
  id: string;
  title: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'FROZEN' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  departmentId?: string;
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
    baseUrl: 'http://host.docker.internal:8002',
  }),
  tagTypes: ['Projects', 'Tasks'],
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
  }),
});

export const {
  useGetUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useChangeTaskStatusMutation,
} = projectApi;
