import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import type { ApiResponse } from './types';

export type { ApiResponse };

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
  role?: 'STUDENT' | 'LECTURER';
  groupName?: string;
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
  studyForm?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  interests?: string;
  // Teacher-specific
  position?: string;
  degree?: string;
  teacherId?: string;
  experience?: string;
  office?: string;
  officeHours?: string;
  website?: string;
  linkedin?: string;
  // Head-specific academic fields
  academicTitle?: string;
  headSince?: string;
  dissertationTitle?: string;
  dissertationYear?: number;
  educationHistory?: string;
  // Resolved names
  facultyName?: string;
  departmentName?: string;
}

export interface HeadProfileDto {
  profile: UserProfileDto;
  publications: number;
  monographs: number;
  articles: number;
  conferences: number;
  grants: number;
  hours: number;
  consultations: number;
  teachingStartYear?: number;
  supervisedPhd: number;
  supervisedMasters: number;
  supervisedBachelors: number;
  departmentTeacherCount: number;
  departmentStudentCount: number;
  awards?: { id: string; title: string; year: string }[];
}

export interface TeacherProfileDto {
  profile: UserProfileDto;
  publications: number;
  monographs: number;
  articles: number;
  conferences: number;
  grants: number;
  hours: number;
  consultations: number;
  teachingStartYear?: number;
  supervisedPhd: number;
  supervisedMasters: number;
  supervisedBachelors: number;
  awards?: { id: string; title: string; year: string }[];
}

export interface UserAwardDto {
  id: string;
  userId: string;
  title: string;
  year: string;
}

export interface FacultyDto {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface DepartmentDto {
  id: string;
  name: string;
  code?: string;
  facultyId?: string;
  facultyName?: string;
  description?: string;
}

export interface StudentInfoDto {
  name: string;
  email: string;
  phone: string;
  group: string;
  course: string;
  initials: string;
}

export type ApplicationStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION' | 'ADMIN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'WITHDRAWN';
export type ApplicationKindType = 'PROJECT' | 'CONSULT' | 'VKR' | 'RESOURCE_REQUEST' | 'EQUIPMENT_REQUEST' | 'ROOM_REQUEST' | 'OTHER';

export interface ApplicationCommentDto {
  id: string;
  applicationId: string;
  authorId: string;
  authorRole: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ApplicationViewDto {
  id: string;
  title: string;
  description: string;
  submittedAt: string;
  status: ApplicationStatusType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  kind: ApplicationKindType;
  student: StudentInfoDto;
  category: string;
  duration: string;
  teamSize: string;
  teacherReply?: string;
  applicationNumber?: number;
  adminId?: string;
  lecturerName?: string;
  comments?: ApplicationCommentDto[];
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

export interface UserDocumentDto {
  id: string;
  userId: string;
  filePath: string;
  fileName: string;
  description?: string;
  uploadedAt?: string;
}

export interface TeacherDetailedDto {
  id: string;
  name: string;
  title: string;
  rating: number;
  activeProjects: number;
  totalProjects: number;
  students: number;
  completion: number;
  avgGrade: number;
  publications: number;
  grants: number;
  hours: number;
  consultations: number;
  activity: { name: string; consultations: number; projects: number }[];
  success: { name: string; value: number }[];
  projectsStats: { active: number; done: number };
  studentsStats: { total: number; active: number };
  scienceStats: { publications: number; grants: number };
}

export interface KpiItem {
  label: string;
  value: number;
  delta: string;
  icon?: string;
  iconTone: string;
}

export interface SimpleKpi {
  title: string;
  value: string;
  sub: string;
}

export interface ChartPoint {
  name: string;
  value?: number;
  created?: number;
  done?: number;
  graduation?: number;
  avgGrade?: number;
  projects?: number;
  events?: number;
  publications?: number;
}

export interface PieSlice {
  [key: string]: string | number;
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  initials: string;
  name: string;
  actionTitle: string;
  actionSub: string;
  timeAgo: string;
  tone: string;
}

export interface StudentItem {
  id: string;
  initials: string;
  name: string;
  project: string;
  tasksDone: number;
  tasksTotal: number;
  lastActive: string;
}

export interface AttentionProject {
  id: string;
  title: string;
  statusLabel: string;
  statusTone: string;
  members: string;
  issue: string;
  issueTone: string;
}

export interface ActivityLogItem {
  user: string;
  action: string;
  date: string;
  status: string;
}

export interface SubjectItem {
  name: string;
  grade: number;
  attendance: number;
}

export interface GroupPerformance {
  name: string;
  activity: number;
  attendance: number;
  avgGrade: number;
}

export interface DashboardSummaryDto {
  role: string;
  kpis?: KpiItem[];
  studentKpis?: SimpleKpi[];
  headKpis?: KpiItem[];
  weeklyChart?: ChartPoint[];
  studentProgress?: ChartPoint[];
  lastActivity?: ActivityItem[];
  activeStudents?: StudentItem[];
  attentionProjects?: AttentionProject[];
  barData?: ChartPoint[];
  pieData?: PieSlice[];
  activities?: ActivityLogItem[];
  subjectsData?: SubjectItem[];
  performanceByGroup?: GroupPerformance[];
  studentsByCourse?: PieSlice[];
  semesters?: ChartPoint[];
  activityByMonth?: ChartPoint[];
}

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export const coreApi = createApi({
  reducerPath: 'coreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Applications', 'Profile', 'Teachers', 'Students', 'UserLinks', 'UserSkills', 'UserLanguages', 'Notifications', 'UserDocuments', 'UserAwards'],
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
    forgotPassword: builder.mutation<ApiResponse<void>, { email: string }>({
      query: (body) => ({
        url: '/api/v1/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse<void>, { token: string; newPassword: string }>({
      query: (body) => ({
        url: '/api/v1/auth/reset-password',
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
    getHeadProfileDetails: builder.query<ApiResponse<HeadProfileDto>, string>({
      query: (userId) => `/api/v1/auth/profile/${userId}/head-details`,
      providesTags: ['Profile'],
    }),
    getTeacherProfileDetails: builder.query<ApiResponse<TeacherProfileDto>, string>({
      query: (userId) => `/api/v1/auth/profile/${userId}/teacher-details`,
      providesTags: ['Profile'],
    }),
    getUserAwards: builder.query<ApiResponse<UserAwardDto[]>, string>({
      query: (userId) => `/api/v1/user-awards/user/${userId}`,
      providesTags: ['UserAwards'],
    }),
    createUserAward: builder.mutation<ApiResponse<UserAwardDto>, { userId: string; title: string; year: string }>({
      query: (body) => ({ url: '/api/v1/user-awards', method: 'POST', body }),
      invalidatesTags: ['UserAwards'],
    }),
    deleteUserAward: builder.mutation<ApiResponse<void>, string>({
      query: (awardId) => ({
        url: `/api/v1/user-awards/${awardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserAwards'],
    }),
    getFaculty: builder.query<FacultyDto, string>({
      query: (facultyId) => `/api/v1/faculties/${facultyId}`,
    }),
    getDepartment: builder.query<DepartmentDto, string>({
      query: (departmentId) => `/api/v1/departments/${departmentId}`,
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
    getTeachersDetailed: builder.query<ApiResponse<TeacherDetailedDto[]>, void>({
      query: () => ({
        url: '/api/v1/users/teachers/detailed',
      }),
      providesTags: ['Teachers'],
    }),
    getStudents: builder.query<ApiResponse<UserProfileDto[]>, void>({
      query: () => ({
        url: '/api/v1/users/students',
      }),
      providesTags: ['Students'],
    }),
    getGroups: builder.query<ApiResponse<string[]>, void>({
      query: () => ({
        url: '/api/v1/users/students/groups',
      }),
    }),
    searchUsers: builder.query<ApiResponse<UserProfileDto[]>, string>({
      query: (q) => ({
        url: '/api/v1/users/students/search',
        params: { q },
      }),
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
    getAdminApplications: builder.query<ApiResponse<ApplicationViewDto[]>, void>({
      query: () => ({
        url: '/api/v1/applications/admin/pending',
      }),
      providesTags: ['Applications'],
    }),
    createApplication: builder.mutation<
      ApiResponse<ApplicationViewDto>,
      { studentId: string; body: { kind: string; description: string; lecturerId: string; category?: string } }
    >({
      query: ({ studentId, body }) => ({
        url: `/api/v1/applications?studentId=${studentId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Applications'],
    }),
    addApplicationComment: builder.mutation<
      ApiResponse<ApplicationViewDto>,
      { applicationId: string; authorId: string; content: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/api/v1/applications/${applicationId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Applications'],
    }),
    withdrawApplication: builder.mutation<ApiResponse<ApplicationViewDto>, string>({
      query: (applicationId) => ({
        url: `/api/v1/applications/${applicationId}/withdraw`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Applications'],
    }),
    getDashboardSummary: builder.query<ApiResponse<DashboardSummaryDto>, string>({
      query: (userId) => ({
        url: `/api/v1/dashboards/${userId}/summary`,
      }),
    }),
    getNotifications: builder.query<ApiResponse<NotificationDto[]>, string>({
      query: (userId) => ({
        url: `/api/v1/notifications/user/${userId}`,
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query<ApiResponse<number>, string>({
      query: (userId) => ({
        url: `/api/v1/notifications/user/${userId}/unread-count`,
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<ApiResponse<void>, string>({
      query: (notificationId) => ({
        url: `/api/v1/notifications/${notificationId}/mark-read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
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
    getUserDocuments: builder.query<ApiResponse<UserDocumentDto[]>, string>({
      query: (userId) => `/api/v1/user-documents/user/${userId}`,
      providesTags: ['UserDocuments'],
    }),
    uploadUserDocument: builder.mutation<ApiResponse<UserDocumentDto>, FormData>({
      query: (formData) => ({
        url: '/api/v1/user-documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserDocuments'],
    }),
    deleteUserDocument: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/api/v1/user-documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserDocuments'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetHeadProfileDetailsQuery,
  useGetTeacherProfileDetailsQuery,
  useGetUserAwardsQuery,
  useCreateUserAwardMutation,
  useDeleteUserAwardMutation,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useGetTeachersQuery,
  useGetTeachersDetailedQuery,
  useGetStudentsQuery,
  useGetGroupsQuery,
  useGetLecturerApplicationsQuery,
  useGetStudentApplicationsQuery,
  useGetAdminApplicationsQuery,
  useCreateApplicationMutation,
  useAddApplicationCommentMutation,
  useWithdrawApplicationMutation,
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
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useGetFacultyQuery,
  useGetDepartmentQuery,
  useGetUserDocumentsQuery,
  useUploadUserDocumentMutation,
  useDeleteUserDocumentMutation,
  useLazySearchUsersQuery,
} = coreApi;
