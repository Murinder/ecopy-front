import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import styles from './ProjectsPage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import AddIcon from '../../assets/icons/mjbmqg4r-6km8pgq.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import CalendarIcon from '../../assets/icons/mjbmqg4r-fgt12s1.svg';
import AddTaskIcon from '../../assets/icons/mjbmqg4r-et05lb6.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import DownloadIcon from '../../assets/icons/ui-download.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationPanel';
import {
  useGetUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useChangeTaskStatusMutation,
  useUpdateTaskMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetDepartmentDashboardQuery,
} from '../../services/projectApi';
import type { TaskDto, ProjectDto, DocumentDto, ProjectWithTaskSummary } from '../../services/projectApi';
import { useGetStudentsQuery, useGetTeachersQuery, useGetProfileQuery } from '../../services/coreApi';

const STATUS_RU: Record<string, string> = {
  ACTIVE: 'Активен', COMPLETED: 'Завершён', FROZEN: 'Заморожен', CANCELLED: 'Отменён',
  TO_DO: 'К выполнению', IN_PROGRESS: 'В процессе', REVIEW: 'На проверке', DONE: 'Выполнено', BLOCKED: 'Заблокировано',
};

const formatProjectDate = (d?: string) => {
  if (!d) return '—';
  const [y, m, day] = d.split('-').map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString('ru-RU');
};

type TeacherTabKey = 'all' | 'active' | 'review' | 'done';

type TeacherStatusKey = 'active' | 'review' | 'done' | 'delay';

type HeadTabKey = 'all' | 'score';

type TeacherMember = {
  initials: string;
  name: string;
  role: string;
};

type TeacherStage = {
  title: string;
  date: string;
  done: boolean;
};

type TeacherProject = {
  id: string;
  typeLabel: string;
  statusLabel: string;
  statusKey: TeacherStatusKey;
  title: string;
  description: string;
  members: TeacherMember[];
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  startDate: string;
  deadline: string;
  updated: string;
  stages: TeacherStage[];
};

type HeadMember = {
  initials: string;
  name: string;
  role: string;
};

type HeadProject = {
  id: string;
  typeLabel: string;
  isAwarded: boolean;
  title: string;
  description: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  memberCount: number;
  curator: string;
  members: HeadMember[];
};

const initialsFromName = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'ИИ';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const formatRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return `${Math.floor(hours / 24)} д. назад`;
};

const formatDate = (iso: string | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU');
};

const ProjectsPage = () => {
  const userId = useAppSelector((s) => s.auth.userId) || '00000000-0000-0000-0000-000000000001';
  const userName = useAppSelector((s) => s.auth.userName) || 'Иван Иванов';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const accessToken = useAppSelector((s) => s.auth.token?.accessToken);
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const {
    data: projectsResp,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetUserProjectsQuery(userId);
  const { data: profileData } = useGetProfileQuery(userId, { skip: !userId });
  const departmentId = profileData?.data?.departmentId;
  const { data: deptDashboard } = useGetDepartmentDashboardQuery(departmentId!, { skip: !departmentId || !isHead });
  const [fallbackProjects, setFallbackProjects] = useState<ProjectDto[]>([]);
  const projects = useMemo(
    () => [...(projectsResp?.data || []), ...fallbackProjects],
    [projectsResp?.data, fallbackProjects]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [studentTab, setStudentTab] = useState<'all' | 'active' | 'archive'>('all');
  const [teacherTab, setTeacherTab] = useState<TeacherTabKey>('all');
  const [teacherSelectedId, setTeacherSelectedId] = useState<string | null>(null);
  const [teacherCommentDraft, setTeacherCommentDraft] = useState('');
  const [teacherComments, setTeacherComments] = useState<Record<string, string>>({});
  const [headTab, setHeadTab] = useState<HeadTabKey>('all');
  const [headSelectedId, setHeadSelectedId] = useState<string | null>(null);

  const filteredStudentProjects = useMemo(() => {
    if (studentTab === 'active') return projects.filter((p) => p.status === 'ACTIVE');
    if (studentTab === 'archive')
      return projects.filter(
        (p) => p.status === 'COMPLETED' || p.status === 'FROZEN' || p.status === 'CANCELLED'
      );
    return projects;
  }, [projects, studentTab]);

  const { data: teacherMembersResp } = useGetProjectMembersQuery(
    teacherSelectedId || '',
    { skip: !teacherSelectedId }
  );
  const { data: teacherTasksResp } = useGetProjectTasksQuery(
    teacherSelectedId || '',
    { skip: !teacherSelectedId }
  );
  const { data: teacherDocsResp } = useGetProjectDocumentsQuery(
    teacherSelectedId || '',
    { skip: !teacherSelectedId }
  );

  const isRealProjectId = selectedProjectId && !selectedProjectId.startsWith('demo-') && !selectedProjectId.startsWith('local-');
  const { data: studentMembersResp, refetch: refetchMembers } = useGetProjectMembersQuery(selectedProjectId || '', { skip: !isRealProjectId });
  const studentMembers = studentMembersResp?.data || [];
  const [addMember] = useAddProjectMemberMutation();
  const [removeMember] = useRemoveProjectMemberMutation();
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const { data: allStudents } = useGetStudentsQuery();
  const { data: allTeachers } = useGetTeachersQuery();
  const allUsersForLookup = useMemo(() => [...(allStudents?.data ?? []), ...(allTeachers?.data ?? [])], [allStudents, allTeachers]);

  const { data: tasksResp, isLoading: tasksLoading, isError: tasksError } = useGetProjectTasksQuery(
    selectedProjectId || '',
    { skip: !isRealProjectId }
  );
  const tasksServer = tasksResp?.data || [];
  const [fallbackTasks, setFallbackTasks] = useState<TaskDto[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);
  const tasks = tasksServer.length
    ? tasksServer
    : fallbackTasks.filter((t) => t.projectId === selectedProjectId);

  const grouped = useMemo(() => {
    const g: Record<string, TaskDto[]> = {
      TO_DO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
      BLOCKED: [],
    };
    tasks.forEach((t) => {
      if (g[t.status]) g[t.status].push(t);
      else g.TO_DO.push(t);
    });
    return g;
  }, [tasks]);

  const [createProject] = useCreateProjectMutation();
  const [createTask] = useCreateTaskMutation();
  const [changeTaskStatus] = useChangeTaskStatusMutation();
  const [dragTask, setDragTask] = useState<TaskDto | null>(null);
  const [updateTask] = useUpdateTaskMutation();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: docsResp } = useGetProjectDocumentsQuery(selectedProjectId || '', { skip: !isRealProjectId });
  const [uploadDocument] = useUploadDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const docs = docsResp?.data || [];

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId || !userId) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', selectedProjectId);
    formData.append('userId', userId);
    formData.append('description', file.name);
    setUploading(true);
    setUploadMsg(null);
    try {
      await uploadDocument(formData).unwrap();
      setUploadMsg({ ok: true, text: `Файл "${file.name}" загружен` });
    } catch {
      setUploadMsg({ ok: false, text: 'Ошибка загрузки файла' });
    }
    setUploading(false);
    e.target.value = '';
    setTimeout(() => setUploadMsg(null), 4000);
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/documents/download/${docId}`,
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
      );
      if (!resp.ok) return;
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const openCreateProject = () => {
    setIsCreateOpen(true);
  };
  const closeCreateProject = () => {
    if (creating) return;
    setIsCreateOpen(false);
    setCreateTitle('');
    setCreateDescription('');
    setCreateEndDate('');
  };
  const submitCreateProject = async () => {
    if (!createTitle.trim()) return;
    const body: Partial<ProjectDto> = {
      title: createTitle.trim(),
      description: createDescription.trim(),
      status: 'ACTIVE',
      endDate: createEndDate || undefined,
      createdBy: userId,
    };
    setCreating(true);
    try {
      const res = await createProject(body).unwrap();
      // Auto-add creator as LEADER
      try {
        await addMember({ projectId: res.data.id, userId: userId, role: 'LEADER' }).unwrap();
      } catch { /* may fail if backend auto-adds creator */ }
      await refetchProjects();
      setSelectedProjectId(res.data.id);
      closeCreateProject();
    } catch (err: any) {
      const status = err?.status || err?.data?.code;
      if (status === 403 || status === 'FORBIDDEN') {
        setAddMemberError('Недостаточно прав для создания проекта');
        closeCreateProject();
      } else {
        const local: ProjectDto = {
          id: `local-${Date.now()}`,
          title: body.title || 'Новый проект',
          description: body.description || '',
          status: 'ACTIVE',
          endDate: body.endDate,
        };
        setFallbackProjects((prev) => [local, ...prev]);
        setSelectedProjectId(local.id);
        closeCreateProject();
      }
    } finally {
      setCreating(false);
    }
  };

  const onAddTask = async (status: TaskDto['status']) => {
    if (!selectedProjectId) return;
    setTaskError(null);
    const body: Partial<TaskDto> = {
      projectId: selectedProjectId,
      title: 'Новая задача',
      description: '',
      status,
    };
    try {
      await createTask(body).unwrap();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setTaskError(apiErr?.data?.message || 'Не удалось создать задачу. Проверьте подключение к серверу.');
      const localTask: TaskDto = {
        id: `local-${Date.now()}`,
        projectId: selectedProjectId,
        title: body.title || 'Новая задача',
        description: '',
        status,
        assignedTo: undefined,
        dueDate: undefined,
      };
      setFallbackTasks((prev) => [localTask, ...prev]);
    }
  };

  const onDragStartTask = (task: TaskDto) => {
    setDragTask(task);
  };

  const onDropToColumn = async (status: TaskDto['status']) => {
    if (!dragTask) return;
    try {
      await changeTaskStatus({ taskId: dragTask.id, status }).unwrap();
    } catch {
      setFallbackTasks((prev) =>
        prev.map((t) => (t.id === dragTask.id ? { ...t, status } : t))
      );
    } finally {
      setDragTask(null);
    }
  };

  const onEditTitleStart = (task: TaskDto) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const onEditTitleChange = (title: string) => {
    setEditingTitle(title);
  };

  const onEditTitleCancel = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const onEditTitleCommit = async (taskId: string, title: string) => {
    const next = title.trim() || 'Без названия';
    try {
      await updateTask({ taskId, title: next }).unwrap();
    } catch {
      setFallbackTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: next } : t))
      );
    } finally {
      onEditTitleCancel();
    }
  };

  const teacherProjects: TeacherProject[] = useMemo(() => {
    const base: TeacherProject[] = projects.length
      ? projects.map((p) => {
          const typeMap: Record<string, string> = {
            DIPLOMA: 'Дипломный проект', RESEARCH: 'Научная работа',
            COMMERCIAL_CASE: 'Коммерческий кейс', HACKATHON: 'Хакатон', OTHER: 'Курсовой проект',
          };
          const typeLabel = typeMap[p.templateType || ''] || 'Проект';
          const tasksTotal = p.taskCount ?? 0;
          const tasksDone = p.completedTaskCount ?? 0;
          const progress = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
          const statusRaw = (p.status || '').toUpperCase();
          const statusKey: TeacherStatusKey =
            statusRaw.includes('DONE') || statusRaw.includes('COMPLET') ? 'done' : statusRaw.includes('REVIEW') ? 'review' : 'active';
          const statusLabel = statusKey === 'done' ? 'Завершен' : statusKey === 'review' ? 'На проверке' : 'Активен';
          const deadline = formatDate(p.endDate);
          const updated = p.updatedAt ? formatRelativeTime(p.updatedAt) : '—';
          const members: TeacherMember[] = [];
          const startDate = formatDate(p.startDate);
          const stages: TeacherStage[] = [];
          return {
            id: p.id,
            typeLabel,
            statusLabel,
            statusKey,
            title: p.title,
            description: p.description || 'Описание проекта будет доступно после синхронизации с сервером.',
            members,
            progress,
            tasksDone,
            tasksTotal,
            startDate,
            deadline,
            updated,
            stages,
          } satisfies TeacherProject;
        })
      : [];

    return base;
  }, [projects]);

  const PROJECT_TYPE_LABELS: Record<string, string> = {
    DIPLOMA: 'Дипломный проект', VKR: 'ВКР', COURSEWORK: 'Курсовой проект', RESEARCH: 'Научная работа',
  };

  const headProjects = useMemo<HeadProject[]>(() => {
    const deptProjects = deptDashboard?.data?.projects || [];
    const teacherList = allTeachers?.data || [];
    return deptProjects.map((p: ProjectWithTaskSummary) => {
      const progress = p.tasksTotal > 0 ? Math.round((p.tasksDone / p.tasksTotal) * 100) : 0;
      const curatorUser = p.createdBy ? teacherList.find((t) => t.id === p.createdBy) : undefined;
      const curatorName = curatorUser ? `${curatorUser.firstName || ''} ${curatorUser.lastName || ''}`.trim() : '—';
      return {
        id: p.id,
        typeLabel: PROJECT_TYPE_LABELS[p.projectType || ''] || 'Проект',
        isAwarded: false,
        title: p.title,
        description: p.description || '—',
        progress,
        tasksDone: p.tasksDone,
        tasksTotal: p.tasksTotal,
        memberCount: p.memberCount,
        curator: curatorName,
        members: (p.members || []).map((m) => ({
          initials: `${(m.firstName || '')[0] || ''}${(m.lastName || '')[0] || ''}`.toUpperCase() || 'ИИ',
          name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || '—',
          role: '',
        })),
      };
    });
  }, [deptDashboard, allTeachers]);

  const headStats = useMemo(() => {
    const dd = deptDashboard?.data;
    const topCount = dd?.totalProjects ?? headProjects.length;
    const activeCount = dd?.activeProjects ?? 0;
    const completedCount = dd?.completedProjects ?? 0;
    const avgProgress = headProjects.length
      ? Math.round(headProjects.reduce((sum, p) => sum + p.progress, 0) / headProjects.length)
      : 0;
    return { topCount, activeCount, completedCount, avgProgress };
  }, [headProjects, deptDashboard]);

  const headList = useMemo(() => {
    const copy = [...headProjects];
    if (headTab === 'score') return copy.sort((a, b) => b.progress - a.progress);
    return copy;
  }, [headProjects, headTab]);

  const selectedHeadProject = useMemo(
    () => headProjects.find((p) => p.id === headSelectedId) || null,
    [headProjects, headSelectedId]
  );

  useEffect(() => {
    if (!headSelectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHeadSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [headSelectedId]);

  const teacherCounts = useMemo(() => {
    const c = { all: teacherProjects.length, active: 0, review: 0, done: 0 };
    teacherProjects.forEach((p) => {
      if (p.statusKey === 'active' || p.statusKey === 'delay') c.active += 1;
      else if (p.statusKey === 'review') c.review += 1;
      else if (p.statusKey === 'done') c.done += 1;
    });
    return c;
  }, [teacherProjects]);

  const teacherList = useMemo(() => {
    if (teacherTab === 'all') return teacherProjects;
    if (teacherTab === 'active') return teacherProjects.filter((p) => p.statusKey === 'active' || p.statusKey === 'delay');
    if (teacherTab === 'review') return teacherProjects.filter((p) => p.statusKey === 'review');
    return teacherProjects.filter((p) => p.statusKey === 'done');
  }, [teacherProjects, teacherTab]);

  const openTeacherModal = (id: string) => {
    setTeacherSelectedId(id);
    setTeacherCommentDraft(teacherComments[id] || '');
  };

  const closeTeacherModal = () => {
    setTeacherSelectedId(null);
    setTeacherCommentDraft('');
  };

  const sendTeacherComment = () => {
    if (!teacherSelectedId) return;
    setTeacherComments((prev) => ({ ...prev, [teacherSelectedId]: teacherCommentDraft.trim() }));
    closeTeacherModal();
  };

  return (
    <div className={styles.a26}>
      <div className={styles.text}>
        <p className={styles.a}>Математический анализ</p>
      </div>
      <div className={styles.studentLayout}>
        <Sidebar />
        <div className={styles.container30}>
          <div className={styles.container7}>
            <div className={styles.container5}>
              <p className={styles.a9}>{isHead ? 'Топ проекты' : isTeacher ? 'Курируемые проекты' : 'Мои проекты'}</p>
              <div className={styles.paragraph2}>
                <p className={styles.a10}>
                  {isHead ? 'Кафедра программной инженерии' : 'Добро пожаловать в вашу образовательную среду'}
                </p>
              </div>
            </div>
            <div className={styles.container6}>
              <div className={styles.button7}>
                <NotificationBell iconSrc={BellIcon} />
              </div>
              <div className={styles.button8}>
                <div className={styles.primitiveSpan2}>
                  <div className={styles.text9}>
                    <p className={styles.a11}>{initials}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.mainContent}>
            <div className={styles.projectsPage11}>
              {isHead ? (
                <>
                  <div className={styles.headStats}>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Всего проектов</div>
                        <div className={styles.headStatValue}>{headStats.topCount}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconYellow}`}>
                        <img src={AwardIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Активных</div>
                        <div className={styles.headStatValue}>{headStats.activeCount}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconPurple}`}>
                        <img src={AwardIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Завершённых</div>
                        <div className={styles.headStatValue}>{headStats.completedCount}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconBlue}`}>
                        <img src={FileIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Средний прогресс</div>
                        <div className={styles.headStatValueGreen}>{headStats.avgProgress}%</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconGreen}`}>
                        <HeadTrendIcon className={styles.headStatIcon} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.headTabs}>
                    <button type="button" className={headTab === 'all' ? styles.headTabActive : styles.headTab} onClick={() => setHeadTab('all')}>
                      Все проекты
                    </button>
                    <button type="button" className={headTab === 'score' ? styles.headTabActive : styles.headTab} onClick={() => setHeadTab('score')}>
                      По прогрессу
                    </button>
                  </div>

                  <div className={styles.headList}>
                    {projectsLoading && <p className={styles.loading}>Загрузка...</p>}
                    {!projectsLoading && headList.length === 0 && <p className={styles.empty}>Нет данных</p>}
                    {headList.map((p) => (
                      <HeadProjectCard key={p.id} project={p} onOpen={() => setHeadSelectedId(p.id)} />
                    ))}
                  </div>

                  {selectedHeadProject && <HeadProjectModal project={selectedHeadProject} onClose={() => setHeadSelectedId(null)} />}
                </>
              ) : isTeacher ? (
                <>
                  <div className={styles.teacherTabs}>
                    <button
                      type="button"
                      className={teacherTab === 'all' ? styles.teacherTabActive : styles.teacherTab}
                      onClick={() => setTeacherTab('all')}
                    >
                      Все проекты ({teacherCounts.all})
                    </button>
                    <button
                      type="button"
                      className={teacherTab === 'active' ? styles.teacherTabActive : styles.teacherTab}
                      onClick={() => setTeacherTab('active')}
                    >
                      Активные ({teacherCounts.active})
                    </button>
                    <button
                      type="button"
                      className={teacherTab === 'review' ? styles.teacherTabActive : styles.teacherTab}
                      onClick={() => setTeacherTab('review')}
                    >
                      На проверке ({teacherCounts.review})
                    </button>
                    <button
                      type="button"
                      className={teacherTab === 'done' ? styles.teacherTabActive : styles.teacherTab}
                      onClick={() => setTeacherTab('done')}
                    >
                      Завершенные ({teacherCounts.done})
                    </button>
                  </div>

                  <div className={styles.teacherGrid}>
                    {projectsLoading && <div style={{ padding: 12 }}>Загрузка проектов...</div>}
                    {!projectsLoading && teacherList.length === 0 && <p className={styles.empty}>Нет данных</p>}
                    {!projectsLoading &&
                      teacherList.map((p) => (
                        <TeacherProjectCard key={p.id} project={p} onOpen={() => openTeacherModal(p.id)} />
                      ))}
                  </div>

                  {teacherSelectedId && (
                    <TeacherProjectModal
                      project={teacherProjects.find((p) => p.id === teacherSelectedId) || null}
                      commentDraft={teacherCommentDraft}
                      onChangeComment={setTeacherCommentDraft}
                      onClose={closeTeacherModal}
                      onSendComment={sendTeacherComment}
                      members={(teacherMembersResp?.data || []).map((m) => ({
                        initials: (m.userName || '').split(' ').map((w: string) => w[0] || '').join('').toUpperCase() || m.userId.replace(/-/g, '').slice(0, 2).toUpperCase(),
                        name: m.userName || m.userId.slice(0, 8),
                        role: m.role === 'LEADER' ? 'Руководитель' : m.role === 'MENTOR' ? 'Наставник' : m.role === 'OBSERVER' ? 'Наблюдатель' : 'Участник',
                      }))}
                      tasks={teacherTasksResp?.data || []}
                      documents={teacherDocsResp?.data || []}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className={styles.container8}>
                    <div className={styles.primitiveDiv}>
                      <button
                        type="button"
                        className={studentTab === 'all' ? styles.primitiveButton : styles.tabInactive}
                        onClick={() => setStudentTab('all')}
                      >
                        <p className={styles.a12}>Все проекты</p>
                      </button>
                      <button
                        type="button"
                        className={studentTab === 'active' ? styles.primitiveButton : styles.tabInactive}
                        onClick={() => setStudentTab('active')}
                      >
                        <p className={styles.a13}>Активные</p>
                      </button>
                      <button
                        type="button"
                        className={studentTab === 'archive' ? styles.primitiveButton : styles.tabInactive}
                        onClick={() => setStudentTab('archive')}
                      >
                        <p className={styles.a14}>Архив</p>
                      </button>
                    </div>
                    <div className={styles.button9} onClick={openCreateProject}>
                      <img src={AddIcon} className={styles.icon4} />
                      <p className={styles.a15}>Создать проект</p>
                    </div>
                  </div>

                  <div className={styles.container29}>
                    {projectsLoading && <div style={{ padding: 12 }}>Загрузка проектов...</div>}
                    {projects.length === 0 && !projectsLoading && studentTab === 'all' && (
                      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: '#0e1d45', marginBottom: 8 }}>У вас пока нет проектов</p>
                        <p style={{ fontSize: 14, color: '#6b7280' }}>Создайте свой первый проект, чтобы начать работу</p>
                      </div>
                    )}
                    {!projectsLoading && filteredStudentProjects.length === 0 && studentTab !== 'all' && (
                      <p className={styles.empty}>Нет проектов в этой категории</p>
                    )}
                    {filteredStudentProjects.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onSelect={() => setSelectedProjectId(p.id)}
                      />
                    ))}
                  </div>

                  {isCreateOpen && (
                    <div className={styles.modalOverlay} onClick={closeCreateProject}>
                      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.dialogHeader}>
                          <p className={styles.a}>Создать новый проект</p>
                          <p className={styles.a3pr}>
                            Заполните информацию о проекте для начала работы
                          </p>
                        </div>
                        <div className={styles.projectsPage}>
                          <div className={styles.modalGroup}>
                            <p className={styles.a3pr}>Название проекта</p>
                            <input
                              className={styles.modalInput}
                              placeholder="Введите название проекта"
                              value={createTitle}
                              onChange={(e) => setCreateTitle(e.target.value)}
                            />
                          </div>
                          <div className={styles.modalGroup}>
                            <p className={styles.a3pr}>Описание</p>
                            <textarea
                              className={styles.modalTextarea}
                              placeholder="Опишите цели и задачи проекта"
                              value={createDescription}
                              onChange={(e) => setCreateDescription(e.target.value)}
                            />
                          </div>
                          <div className={styles.modalRow}>
                            <div className={styles.modalGroupHalf}>
                              <p className={styles.a3pr}>Дедлайн</p>
                              <input
                                className={styles.modalInput}
                                type="date"
                                value={createEndDate}
                                onChange={(e) => setCreateEndDate(e.target.value)}
                              />
                            </div>
                            <div className={styles.modalGroupHalf}>
                              <p className={styles.a3pr}>Участники</p>
                              <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px 0 0' }}>Добавить участников можно после создания проекта</p>
                            </div>
                          </div>
                          <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={closeCreateProject} disabled={creating}>
                              Отмена
                            </button>
                            <button className={styles.btnCreate} onClick={submitCreateProject} disabled={creating || !createTitle.trim()}>
                              Создать проект
                            </button>
                          </div>
                        </div>
                        <button className={styles.closeButton} onClick={closeCreateProject} aria-label="Закрыть">
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedProjectId ? (
                    <div className={styles.card7}>
                      <div className={styles.cardHeader}>
                        <p className={styles.a19}>Задачи проекта</p>
                        <p className={styles.aIosAnd2}>
                          Организация задач в колонках статусов
                        </p>
                      </div>
                      {taskError && (
                        <div style={{ padding: '8px 16px', marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{taskError}</span>
                          <button onClick={() => setTaskError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </div>
                      )}
                      <div className={styles.projectsPage10}>
                        <KanbanColumn
                          title="К выполнению"
                          count={grouped.TO_DO.length}
                          tasks={grouped.TO_DO}
                          onAddTask={() => onAddTask('TO_DO')}
                          onDragStart={onDragStartTask}
                          onDrop={() => onDropToColumn('TO_DO')}
                          editingTaskId={editingTaskId}
                          editingTitle={editingTitle}
                          onEditTitleStart={onEditTitleStart}
                          onEditTitleChange={onEditTitleChange}
                          onEditTitleCommit={onEditTitleCommit}
                          onEditTitleCancel={onEditTitleCancel}
                        />
                        <KanbanColumn
                          title="В процессе"
                          count={grouped.IN_PROGRESS.length}
                          tasks={grouped.IN_PROGRESS}
                          onAddTask={() => onAddTask('IN_PROGRESS')}
                          onDragStart={onDragStartTask}
                          onDrop={() => onDropToColumn('IN_PROGRESS')}
                          editingTaskId={editingTaskId}
                          editingTitle={editingTitle}
                          onEditTitleStart={onEditTitleStart}
                          onEditTitleChange={onEditTitleChange}
                          onEditTitleCommit={onEditTitleCommit}
                          onEditTitleCancel={onEditTitleCancel}
                        />
                        <KanbanColumn
                          title="На проверке"
                          count={grouped.REVIEW.length}
                          tasks={grouped.REVIEW}
                          onAddTask={() => onAddTask('REVIEW')}
                          onDragStart={onDragStartTask}
                          onDrop={() => onDropToColumn('REVIEW')}
                          editingTaskId={editingTaskId}
                          editingTitle={editingTitle}
                          onEditTitleStart={onEditTitleStart}
                          onEditTitleChange={onEditTitleChange}
                          onEditTitleCommit={onEditTitleCommit}
                          onEditTitleCancel={onEditTitleCancel}
                        />
                        <KanbanColumn
                          title="Выполнено"
                          count={grouped.DONE.length}
                          tasks={grouped.DONE}
                          onAddTask={() => onAddTask('DONE')}
                          onDragStart={onDragStartTask}
                          onDrop={() => onDropToColumn('DONE')}
                          editingTaskId={editingTaskId}
                          editingTitle={editingTitle}
                          onEditTitleStart={onEditTitleStart}
                          onEditTitleChange={onEditTitleChange}
                          onEditTitleCommit={onEditTitleCommit}
                          onEditTitleCancel={onEditTitleCancel}
                        />
                        <KanbanColumn
                          title="Заблокировано"
                          count={grouped.BLOCKED.length}
                          tasks={grouped.BLOCKED}
                          onAddTask={() => onAddTask('BLOCKED')}
                          onDragStart={onDragStartTask}
                          onDrop={() => onDropToColumn('BLOCKED')}
                          editingTaskId={editingTaskId}
                          editingTitle={editingTitle}
                          onEditTitleStart={onEditTitleStart}
                          onEditTitleChange={onEditTitleChange}
                          onEditTitleCommit={onEditTitleCommit}
                          onEditTitleCancel={onEditTitleCancel}
                        />
                      </div>
                      {tasksLoading && <div style={{ padding: 12 }}>Загрузка задач...</div>}
                      {tasksError && <div style={{ padding: 12 }}>API недоступно — режим офлайн.</div>}

                      {isRealProjectId && (
                        <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid #f1f5f9' }}>
                          <p className={styles.a19} style={{ marginBottom: 10 }}>Участники проекта ({studentMembers.length})</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                            {(() => {
                              const isCurrentUserLeader = studentMembers.some(m => m.userId === userId && m.role === 'LEADER');
                              return studentMembers.map((m) => {
                              const name = m.userName || m.userId.slice(0, 8) + '...';
                              const roleLabel = m.role === 'LEADER' ? 'Руководитель' : m.role === 'MENTOR' ? 'Наставник' : m.role === 'OBSERVER' ? 'Наблюдатель' : 'Участник';
                              const isMe = m.userId === userId;
                              return (
                                <div key={m.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: isMe ? '#eff6ff' : '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontWeight: 600, color: '#0e1d45' }}>{name}{isMe ? ' (Вы)' : ''}</span>
                                    <span style={{ fontSize: 11, color: '#64748b', padding: '2px 6px', background: '#e2e8f0', borderRadius: 4 }}>{roleLabel}</span>
                                  </div>
                                  {isCurrentUserLeader && m.role !== 'LEADER' && m.userId !== userId && (
                                    <button
                                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                                      title="Удалить участника"
                                      onClick={async () => { try { await removeMember({ projectId: selectedProjectId!, userId: m.userId }).unwrap(); refetchMembers(); } catch {} }}
                                    >×</button>
                                  )}
                                </div>
                              );
                            });
                            })()}
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                              placeholder="Email участника"
                              value={addMemberEmail}
                              onChange={(e) => { setAddMemberEmail(e.target.value); setAddMemberError(null); }}
                            />
                            <button
                              style={{ padding: '8px 16px', background: '#3a76f0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              onClick={async () => {
                                if (!addMemberEmail.trim() || !selectedProjectId) return;
                                setAddMemberError(null);
                                // Find user by email from loaded users
                                const found = allUsersForLookup.find(u => u.email === addMemberEmail.trim());
                                if (!found) { setAddMemberError('Пользователь не найден'); return; }
                                if (studentMembers.some(m => m.userId === found.id)) { setAddMemberError('Уже участник'); return; }
                                try {
                                  await addMember({ projectId: selectedProjectId, userId: found.id, role: 'MEMBER' }).unwrap();
                                  refetchMembers();
                                  setAddMemberEmail('');
                                } catch { setAddMemberError('Ошибка при добавлении'); }
                              }}
                            >+ Добавить</button>
                          </div>
                          {addMemberError && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{addMemberError}</p>}
                        </div>
                      )}

                      {isRealProjectId && (
                        <div style={{ marginTop: 20, padding: '16px 0', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <p className={styles.a19}>Документы проекта</p>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#3a76f0', fontSize: 14, fontWeight: 500 }}>
                              <img src={AddIcon} style={{ width: 16, height: 16 }} />
                              {uploading ? 'Загрузка...' : 'Загрузить файл'}
                              <input type="file" style={{ display: 'none' }} onChange={onFileUpload} disabled={uploading} />
                            </label>
                          </div>
                          {uploadMsg && (
                            <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, fontSize: 13, background: uploadMsg.ok ? '#f0fdf4' : '#fef2f2', color: uploadMsg.ok ? '#16a34a' : '#dc2626' }}>
                              {uploadMsg.text}
                            </div>
                          )}
                          {docs.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: 14 }}>Нет документов</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {docs.map((d) => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <img src={FileIcon} style={{ width: 18, height: 18 }} />
                                    <div>
                                      <div style={{ fontSize: 14, fontWeight: 500, color: '#0e1d45' }}>{d.filePath?.split('/').pop()?.replace(/^[a-f0-9-]+_/, '') || d.description || 'Документ'}</div>
                                      {d.description && <div style={{ fontSize: 12, color: '#94a3b8' }}>{d.description}</div>}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <img
                                      src={DownloadIcon}
                                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                                      onClick={() => handleDownload(d.id, d.filePath?.split('/').pop()?.replace(/^[a-f0-9-]+_/, '') || d.description || 'document')}
                                    />
                                    <img
                                      src={CloseIcon}
                                      style={{ width: 18, height: 18, cursor: 'pointer', opacity: 0.5 }}
                                      onClick={() => deleteDocument(d.id)}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.card7}>
                      <div className={styles.cardHeader}>
                        <p className={styles.a19}>Задачи проекта</p>
                        <p className={styles.aIosAnd2}>Выберите проект, чтобы увидеть задачи</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeadProjectCard = ({ project, onOpen }: { project: HeadProject; onOpen: () => void }) => {
  return (
    <div className={styles.headCard} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
      <div className={styles.headCardTop}>
        <div className={styles.headCardTitleRow}>
          <div className={styles.headCardTitle}>
            {project.title}
            {project.isAwarded && (
              <span className={styles.headAwardMark}>
                <img src={AwardIcon} className={styles.headAwardIcon} />
              </span>
            )}
          </div>
          <div className={styles.headCardLeader}>Руководитель: {project.curator}</div>
        </div>

        <div className={styles.headCardDesc}>{project.description}</div>

        <div className={styles.headCardMetaRow}>
          <div className={styles.headCardChips}>
            <span className={styles.headChip}>{project.typeLabel}</span>
            <span className={styles.headMetaPill}>
              <img src={PeopleIcon} className={styles.headMetaImgIcon} />
              {project.memberCount}
            </span>
            <span className={styles.headMetaPill}>
              {project.tasksDone}/{project.tasksTotal} задач
            </span>
          </div>
        </div>

        <div className={styles.headTeamRow}>
          <div className={styles.headAvatars}>
            {project.members.slice(0, 3).map((m) => (
              <div key={m.name} className={styles.headAvatar} title={m.name}>
                {m.initials}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.headScoreRow}>
          <div className={styles.headScoreLabel}>Прогресс</div>
          <div className={styles.headScoreValue}>{project.progress}%</div>
        </div>
        <div className={styles.headScoreBar}>
          <div className={styles.headScoreFill} style={{ width: `${clamp(project.progress, 0, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

const HeadProjectModal = ({ project, onClose }: { project: HeadProject; onClose: () => void }) => {
  const onView = () => window.alert('Просмотр проекта в разработке');
  const onDownload = () => window.alert('Скачивание проекта в разработке');

  return (
    <div className={styles.headModalOverlay} onClick={onClose}>
      <div className={styles.headModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headModalTop}>
          <div className={styles.headModalPills}>
            <span className={styles.headPill}>{project.typeLabel}</span>
            {project.isAwarded && (
              <span className={`${styles.headPill} ${styles.headPillAward}`}>
                <img src={AwardIcon} className={styles.headPillIcon} />
                Награжден
              </span>
            )}
          </div>

          <div className={styles.headModalActions}>
            <button type="button" className={styles.headActionBtn} onClick={onView}>
              <img src={EyeIcon} className={styles.headActionIcon} />
              Просмотр
            </button>
            <button type="button" className={styles.headActionBtn} onClick={onDownload}>
              <img src={DownloadIcon} className={styles.headActionIcon} />
              Скачать
            </button>
            <button type="button" className={styles.headCloseBtn} onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>
        </div>

        <div className={styles.headModalTitle}>{project.title}</div>
        <div className={styles.headModalDesc}>{project.description}</div>

        <div className={styles.headSectionTitle}>Команда проекта</div>
        <div className={styles.headTeamGrid}>
          {project.members.map((m) => (
            <div key={m.name} className={styles.headMemberCard}>
              <div className={styles.headMemberAvatar}>{m.initials}</div>
              <div className={styles.headMemberInfo}>
                <div className={styles.headMemberName}>{m.name}</div>
                <div className={styles.headMemberRole}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.headLeaderLine}>Научный руководитель: {project.curator}</div>

        <div className={styles.headSectionTitle}>Прогресс</div>
        <div className={styles.headCriteria}>
          <div className={styles.headCriteriaRow}>
            <div className={styles.headCriteriaTop}>
              <div className={styles.headCriteriaLabel}>Выполнение задач</div>
              <div className={styles.headCriteriaValue}>{project.tasksDone}/{project.tasksTotal}</div>
            </div>
            <div className={styles.headCriteriaBar}>
              <div className={styles.headCriteriaFill} style={{ width: `${clamp(project.progress, 0, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.headBottomKpis}>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueBlue}>{project.progress}%</div>
            <div className={styles.headKpiLabel}>Прогресс</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueOrange}>{project.tasksDone}</div>
            <div className={styles.headKpiLabel}>Задач выполнено</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueBlue}>{project.tasksTotal}</div>
            <div className={styles.headKpiLabel}>Всего задач</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueGreen}>{project.memberCount}</div>
            <div className={styles.headKpiLabel}>Участников</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeadTrendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 16.5L10 10.5L13.5 14L20 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16.5 7.5H20V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TeacherProjectCard = ({ project, onOpen }: { project: TeacherProject; onOpen: () => void }) => {
  const statusClass =
    project.statusKey === 'active'
      ? styles.teacherStatusActive
      : project.statusKey === 'review'
        ? styles.teacherStatusReview
        : project.statusKey === 'delay'
          ? styles.teacherStatusDelay
          : styles.teacherStatusDone;

  return (
    <div className={styles.teacherCard} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}>
      <div className={styles.teacherCardTop}>
        <span className={styles.teacherTypePill}>{project.typeLabel}</span>
        <span className={`${styles.teacherStatusPill} ${statusClass}`}>{project.statusLabel}</span>
      </div>

      <div className={styles.teacherCardTitle}>{project.title}</div>
      <div className={styles.teacherCardDesc}>{project.description}</div>

      <div className={styles.teacherMembersLabel}>Участники:</div>
      <div className={styles.teacherMembersRow}>
        {project.members.slice(0, 3).map((m) => (
          <div key={m.name} className={styles.teacherMemberAvatar} title={m.name}>
            {m.initials}
          </div>
        ))}
      </div>

      <div className={styles.teacherProgressRow}>
        <div className={styles.teacherProgressLabel}>Прогресс</div>
        <div className={styles.teacherProgressPct}>{project.progress}%</div>
      </div>
      <div className={styles.teacherProgressBar}>
        <div className={styles.teacherProgressFill} style={{ width: `${project.progress}%` }} />
      </div>

      <div className={styles.teacherMetaRow}>
        <div className={styles.teacherMetaItem}>
          <span className={styles.teacherMetaDot} />
          {project.tasksDone}/{project.tasksTotal} задач
        </div>
        <div className={styles.teacherMetaItem}>
          <img src={CalendarIcon} className={styles.teacherMetaIcon} />
          {project.deadline}
        </div>
      </div>
      <div className={styles.teacherUpdated}>Последнее обновление: {project.updated}</div>
    </div>
  );
};

const TeacherProjectModal = ({
  project,
  commentDraft,
  onChangeComment,
  onClose,
  onSendComment,
  members,
  tasks,
  documents,
}: {
  project: TeacherProject | null;
  commentDraft: string;
  onChangeComment: (v: string) => void;
  onClose: () => void;
  onSendComment: () => void;
  members?: TeacherMember[];
  tasks?: TaskDto[];
  documents?: DocumentDto[];
}) => {
  if (!project) return null;
  const displayMembers = members && members.length > 0 ? members : project.members;

  const statusClass =
    project.statusKey === 'active'
      ? styles.teacherStatusActive
      : project.statusKey === 'review'
        ? styles.teacherStatusReview
        : project.statusKey === 'delay'
          ? styles.teacherStatusDelay
          : styles.teacherStatusDone;

  const openProject = () => {
    window.alert('Открытие проекта в разработке');
  };

  const requestReport = () => {
    window.alert('Запрос отчета отправлен (демо)');
  };

  return (
    <div className={styles.teacherModalOverlay} onClick={onClose}>
      <div className={styles.teacherModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.teacherModalClose} type="button" onClick={onClose} aria-label="Закрыть">
          <img src={CloseIcon} className={styles.teacherModalCloseIcon} />
        </button>

        <div className={styles.teacherModalTopRow}>
          <div className={styles.teacherModalPills}>
            <span className={styles.teacherTypePill}>{project.typeLabel}</span>
            <span className={`${styles.teacherStatusPill} ${statusClass}`}>{project.statusLabel}</span>
          </div>
          <button className={styles.teacherOpenBtn} type="button" onClick={openProject}>
            <img src={EyeIcon} className={styles.teacherOpenIcon} />
            Открыть проект
          </button>
        </div>

        <div className={styles.teacherModalTitle}>{project.title}</div>
        <div className={styles.teacherModalDesc}>{project.description}</div>

        <div className={styles.teacherSectionTitle}>Команда проекта</div>
        <div className={styles.teacherTeamGrid}>
          {displayMembers.length === 0 && <p style={{ color: '#737373', fontSize: 14 }}>Нет участников</p>}
          {displayMembers.map((m) => (
            <div key={m.name} className={styles.teacherTeamCard}>
              <div className={styles.teacherTeamAvatar}>{m.initials}</div>
              <div>
                <div className={styles.teacherTeamName}>{m.name}</div>
                <div className={styles.teacherTeamRole}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.teacherStatsGrid}>
          <div className={styles.teacherStatBox}>
            <div className={styles.teacherStatLabel}>Прогресс</div>
            <div className={styles.teacherStatValueBlue}>{project.progress}%</div>
          </div>
          <div className={styles.teacherStatBox}>
            <div className={styles.teacherStatLabel}>Задачи</div>
            <div className={styles.teacherStatValue}>{project.tasksDone}/{project.tasksTotal}</div>
          </div>
          <div className={styles.teacherStatBox}>
            <div className={styles.teacherStatLabel}>Дата начала</div>
            <div className={styles.teacherStatValue}>{project.startDate}</div>
          </div>
          <div className={styles.teacherStatBox}>
            <div className={styles.teacherStatLabel}>Дедлайн</div>
            <div className={styles.teacherStatValue}>{project.deadline}</div>
          </div>
        </div>

        <div className={styles.teacherSectionTitle}>Задачи проекта ({tasks?.length || 0})</div>
        <div className={styles.teacherStages}>
          {(!tasks || tasks.length === 0) && <p style={{ color: '#94a3b8', fontSize: 13 }}>Нет задач</p>}
          {tasks?.map((t) => {
            const done = t.status === 'DONE';
            const statusLabel = t.status === 'TO_DO' ? 'К выполнению' : t.status === 'IN_PROGRESS' ? 'В работе' : t.status === 'REVIEW' ? 'На проверке' : t.status === 'DONE' ? 'Выполнена' : 'Заблокирована';
            return (
              <div key={t.id} className={styles.teacherStageRow}>
                <div className={done ? styles.teacherStageDotDone : styles.teacherStageDotTodo}>
                  {done ? '✓' : '○'}
                </div>
                <div className={styles.teacherStageTitle}>{t.title}</div>
                <div className={styles.teacherStageDate}>{statusLabel}</div>
              </div>
            );
          })}
        </div>

        {documents && documents.length > 0 && (
          <>
            <div className={styles.teacherSectionTitle}>Документы ({documents.length})</div>
            <div className={styles.teacherStages}>
              {documents.map((d) => (
                <div key={d.id} className={styles.teacherStageRow}>
                  <div className={styles.teacherStageDotDone}>📄</div>
                  <div className={styles.teacherStageTitle}>{d.description || d.filePath}</div>
                  <div className={styles.teacherStageDate}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('ru-RU') : ''}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.teacherSectionTitle}>Комментарий преподавателя</div>
        <textarea
          className={styles.teacherComment}
          placeholder="Добавьте комментарий или рекомендации для студентов..."
          value={commentDraft}
          onChange={(e) => onChangeComment(e.target.value)}
        />

        <div className={styles.teacherModalActions}>
          <button className={styles.teacherPrimaryBtn} type="button" onClick={onSendComment}>
            Отправить комментарий
          </button>
          <button className={styles.teacherSecondaryBtn} type="button" onClick={requestReport}>
            <img src={FileIcon} className={styles.teacherSecondaryIcon} />
            Запросить отчет
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onSelect }: { project: ProjectDto; onSelect: () => void }) => {
  const isReal = project.id && !project.id.startsWith('demo-') && !project.id.startsWith('local-');
  const { data: membersResp } = useGetProjectMembersQuery(project.id, { skip: !isReal });
  const memberCount = membersResp?.data?.length ?? 0;

  return (
    <div className={styles.card}>
      <div className={styles.projectsPage}>
        <div className={styles.container9}>
          <div className={styles.cardTitle}>
            <p className={styles.a16}>{project.title}</p>
          </div>
          <div className={styles.cardDescription}>
            <p className={styles.aIosAnd}>{project.description}</p>
          </div>
        </div>
        <div className={styles.icon5}>
          <div className={styles.vector5} />
          <div className={styles.vector6} />
          <div className={styles.vector6} />
        </div>
      </div>
      <div className={styles.projectsPage2}>
        <div className={styles.container12}>
          <div className={styles.container10}>
            <div className={styles.text10}>
              <p className={styles.a17}>Статус</p>
            </div>
            <div className={styles.text11}>
              <p className={styles.a65}>{STATUS_RU[project.status || ''] || project.status}</p>
            </div>
          </div>
          <div className={styles.primitiveDiv2}>
            <div className={styles.container11} />
          </div>
        </div>
        <div className={styles.container15}>
          <div className={styles.container13}>
            <img src={PeopleIcon} className={styles.icon6} />
            <div className={styles.text12}>
              <p className={styles.a17}>{memberCount}</p>
            </div>
          </div>
          <div className={styles.container14}>
            <img src={CalendarIcon} className={styles.icon7} />
            <div className={styles.text13}>
              <p className={styles.a17}>{formatProjectDate(project.endDate)}</p>
            </div>
          </div>
          <button className={styles.primitiveButton} onClick={onSelect}>
            <p className={styles.a12}>Открыть</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({
  title,
  count,
  tasks,
  onAddTask,
  onDragStart,
  onDrop,
  editingTaskId,
  editingTitle,
  onEditTitleStart,
  onEditTitleChange,
  onEditTitleCommit,
  onEditTitleCancel,
}: {
  title: string;
  count: number;
  tasks: TaskDto[];
  onAddTask: () => void;
  onDragStart: (task: TaskDto) => void;
  onDrop: () => void;
  editingTaskId: string | null;
  editingTitle: string;
  onEditTitleStart: (task: TaskDto) => void;
  onEditTitleChange: (title: string) => void;
  onEditTitleCommit: (taskId: string, title: string) => void;
  onEditTitleCancel: () => void;
}) => {
  return (
    <div
      className={styles.container23}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop()}
    >
      <div className={styles.container21}>
        <div className={styles.heading4}>
          <p className={styles.a20}>{title}</p>
        </div>
        <div className={styles.badge2}>
          <p className={styles.a22}>{count}</p>
        </div>
      </div>
      <div className={styles.container22}>
        {tasks.map((t) => (
          <div
            key={t.id}
            className={styles.card3}
            draggable={editingTaskId !== t.id}
            onDragStart={() => onDragStart(t)}
          >
            <div className={styles.cardContent}>
              <div className={styles.projectsPage5}>
                <div className={styles.paragraph3}>
                  {editingTaskId === t.id ? (
                    <input
                      className={styles.taskTitleInput}
                      value={editingTitle}
                      onChange={(e) => onEditTitleChange(e.target.value)}
                      onBlur={() => onEditTitleCommit(t.id, editingTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onEditTitleCommit(t.id, editingTitle);
                        if (e.key === 'Escape') onEditTitleCancel();
                      }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className={styles.aUi}
                      onClick={() => onEditTitleStart(t)}
                      title="Редактировать название"
                    >
                      {t.title}
                    </p>
                  )}
                </div>
                <div className={styles.icon8}>
                  <div className={styles.vector5} />
                  <div className={styles.vector6} />
                  <div className={styles.vector6} />
                </div>
              </div>
              <div className={styles.badge3}>
                <p className={styles.a32}>{STATUS_RU[t.status] || t.status}</p>
              </div>
            </div>
          </div>
        ))}
        <div className={styles.button10} onClick={onAddTask}>
          <img src={AddTaskIcon} className={styles.icon4} />
          <p className={styles.a23}>Добавить задачу</p>
        </div>
      </div>
    </div>
  );
};


export default ProjectsPage;
