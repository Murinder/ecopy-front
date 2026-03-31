import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
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
import type { RootState } from '../../app/store';
import {
  useGetUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectTasksQuery,
  useCreateTaskMutation,
  useChangeTaskStatusMutation,
  useUpdateTaskMutation,
} from '../../services/projectApi';
import type { TaskDto, ProjectDto } from '../../services/projectApi';

type TeacherTabKey = 'all' | 'active' | 'review' | 'done';

type TeacherStatusKey = 'active' | 'review' | 'done' | 'delay';

type HeadTabKey = 'all' | 'score' | 'rating' | 'popular';

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

type HeadCriteriaItem = {
  key: string;
  label: string;
  value: number;
};

type HeadProject = {
  id: string;
  typeLabel: string;
  isAwarded: boolean;
  title: string;
  description: string;
  rating: number;
  views: number;
  likes: number;
  avgScore: number;
  curator: string;
  members: HeadMember[];
  criteria: HeadCriteriaItem[];
  achievements: string[];
  awards: string[];
  publications: number;
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

const hashToInt = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const ProjectsPage = () => {
  const userId = useSelector((s: RootState) => s.auth.userId) || '00000000-0000-0000-0000-000000000001';
  const userName = useSelector((s: RootState) => s.auth.userName) || 'Иван Иванов';
  const userRole = useSelector((s: RootState) => s.auth.userRole) || 'Студент';
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const {
    data: projectsResp,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetUserProjectsQuery(userId);
  const [fallbackProjects, setFallbackProjects] = useState<ProjectDto[]>([]);
  const projects = useMemo(
    () => [...(projectsResp?.data || []), ...fallbackProjects],
    [projectsResp?.data, fallbackProjects]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [teacherTab, setTeacherTab] = useState<TeacherTabKey>('all');
  const [teacherSelectedId, setTeacherSelectedId] = useState<string | null>(null);
  const [teacherCommentDraft, setTeacherCommentDraft] = useState('');
  const [teacherComments, setTeacherComments] = useState<Record<string, string>>({});
  const [headTab, setHeadTab] = useState<HeadTabKey>('all');
  const [headSelectedId, setHeadSelectedId] = useState<string | null>(null);

  const { data: tasksResp, isLoading: tasksLoading, isError: tasksError } = useGetProjectTasksQuery(
    selectedProjectId || '',
    { skip: !selectedProjectId }
  );
  const tasksServer = tasksResp?.data || [];
  const [fallbackTasks, setFallbackTasks] = useState<TaskDto[]>([]);
  const tasks = tasksServer.length
    ? tasksServer
    : fallbackTasks.filter((t) => t.projectId === selectedProjectId);

  const grouped = useMemo(() => {
    const g: Record<string, TaskDto[]> = {
      TO_DO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    tasks.forEach((t) => {
      if (t.status === 'TO_DO') g.TO_DO.push(t);
      else if (t.status === 'IN_PROGRESS' || t.status === 'REVIEW') g.IN_PROGRESS.push(t);
      else if (t.status === 'DONE') g.DONE.push(t);
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
      await refetchProjects();
      setSelectedProjectId(res.data.id);
      closeCreateProject();
    } catch {
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
    } finally {
      setCreating(false);
    }
  };

  const onAddTask = async (status: TaskDto['status']) => {
    if (!selectedProjectId) return;
    const body: Partial<TaskDto> = {
      projectId: selectedProjectId,
      title: 'Новая задача',
      description: '',
      status,
    };
    try {
      await createTask(body).unwrap();
    } catch {
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
      ? projects.map((p, idx) => {
          const h = hashToInt(p.id || String(idx));
          const typeLabel = idx % 3 === 0 ? 'Курсовой проект' : idx % 3 === 1 ? 'Научная работа' : 'Дипломный проект';
          const tasksTotal = 20 + (h % 10);
          const tasksDone = clamp(Math.floor((tasksTotal * (45 + (h % 51))) / 100), 1, tasksTotal);
          const progress = clamp(Math.round((tasksDone / tasksTotal) * 100), 0, 100);
          const statusRaw = (p.status || '').toUpperCase();
          const statusKey: TeacherStatusKey =
            statusRaw.includes('DONE') || statusRaw.includes('COMPLET') ? 'done' : statusRaw.includes('REVIEW') ? 'review' : 'active';
          const statusLabel = statusKey === 'done' ? 'Завершен' : statusKey === 'review' ? 'На проверке' : 'Активен';
          const deadline = p.endDate || (idx % 2 === 0 ? '15.12.2025' : '30.11.2025');
          const updated = idx % 3 === 0 ? '2 часа назад' : idx % 3 === 1 ? '5 часов назад' : '1 день назад';
          const members: TeacherMember[] = [
            { initials: 'ИИ', name: 'Иван Иванов', role: 'Team Lead' },
            { initials: 'МП', name: 'Мария Петрова', role: 'Designer' },
            { initials: 'АС', name: 'Алексей Сидоров', role: 'Developer' },
          ];
          const startDate = '01.09.2025';
          const stages: TeacherStage[] = [
            { title: 'Проектирование архитектуры', date: '15.09.2025', done: true },
            { title: 'Разработка UI/UX', date: '01.10.2025', done: true },
            { title: 'Backend разработка', date: '20.10.2025', done: true },
            { title: 'Frontend разработка', date: '15.11.2025', done: false },
            { title: 'Тестирование', date: '01.12.2025', done: false },
          ];
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
      : [
          {
            id: 't1',
            typeLabel: 'Курсовой проект',
            statusLabel: 'Активен',
            statusKey: 'active',
            title: 'Разработка мобильного приложения для университета',
            description: 'Создание образовательного мобильного приложения для iOS и Android с функционалом просмотра расписания, оценок и новостей университета.',
            members: [
              { initials: 'ИИ', name: 'Иван Иванов', role: 'Team Lead' },
              { initials: 'МП', name: 'Мария Петрова', role: 'Designer' },
              { initials: 'АС', name: 'Алексей Сидоров', role: 'Developer' },
            ],
            progress: 75,
            tasksDone: 15,
            tasksTotal: 20,
            startDate: '01.09.2025',
            deadline: '15.12.2025',
            updated: '2 часа назад',
            stages: [
              { title: 'Проектирование архитектуры', date: '15.09.2025', done: true },
              { title: 'Разработка UI/UX', date: '01.10.2025', done: true },
              { title: 'Backend разработка', date: '20.10.2025', done: true },
              { title: 'Frontend разработка', date: '15.11.2025', done: false },
              { title: 'Тестирование', date: '01.12.2025', done: false },
            ],
          },
          {
            id: 't2',
            typeLabel: 'Научная работа',
            statusLabel: 'Активен',
            statusKey: 'active',
            title: 'Исследование применения AI в образовании',
            description: 'Научное исследование эффективности применения технологий искусственного интеллекта в образовательном процессе.',
            members: [
              { initials: 'МГ', name: 'Михаил Громов', role: 'Researcher' },
              { initials: 'ОС', name: 'Ольга Соколова', role: 'Analyst' },
            ],
            progress: 60,
            tasksDone: 7,
            tasksTotal: 12,
            startDate: '10.09.2025',
            deadline: '30.11.2025',
            updated: '5 часов назад',
            stages: [
              { title: 'Постановка задачи', date: '15.09.2025', done: true },
              { title: 'Сбор данных', date: '05.10.2025', done: true },
              { title: 'Анализ результатов', date: '10.11.2025', done: false },
              { title: 'Подготовка публикации', date: '25.11.2025', done: false },
            ],
          },
          {
            id: 't3',
            typeLabel: 'Дипломный проект',
            statusLabel: 'На проверке',
            statusKey: 'review',
            title: 'Веб-платформа для управления проектами',
            description: 'Разработка веб-платформы для управления студенческими проектами с функционалом распределения задач и отчётности.',
            members: [{ initials: 'АС', name: 'Алексей Сидоров', role: 'Developer' }],
            progress: 90,
            tasksDone: 23,
            tasksTotal: 25,
            startDate: '01.09.2025',
            deadline: '20.11.2025',
            updated: '1 день назад',
            stages: [
              { title: 'Проектирование', date: '20.09.2025', done: true },
              { title: 'Реализация', date: '30.10.2025', done: true },
              { title: 'Подготовка к защите', date: '15.11.2025', done: false },
            ],
          },
          {
            id: 't4',
            typeLabel: 'Курсовой проект',
            statusLabel: 'Задержка',
            statusKey: 'delay',
            title: 'Система распознавания рукописного текста',
            description: 'Разработка системы на базе нейронных сетей для распознавания рукописного текста на русском языке.',
            members: [
              { initials: 'ДК', name: 'Дмитрий Ковалев', role: 'ML Engineer' },
              { initials: 'АВ', name: 'Анна Васильева', role: 'Developer' },
            ],
            progress: 45,
            tasksDone: 6,
            tasksTotal: 15,
            startDate: '15.09.2025',
            deadline: '15.11.2025',
            updated: '3 дня назад',
            stages: [
              { title: 'Сбор датасета', date: '25.09.2025', done: true },
              { title: 'Обучение модели', date: '20.10.2025', done: false },
              { title: 'Интеграция', date: '10.11.2025', done: false },
            ],
          },
        ] satisfies TeacherProject[];

    return base;
  }, [projects]);

  const headProjects = useMemo<HeadProject[]>(
    () => [
      {
        id: 'h1',
        typeLabel: 'Дипломный проект',
        isAwarded: true,
        title: 'Интеллектуальная система рекомендаций для образования',
        description: 'Система на базе машинного обучения для персонализированных рекомендаций учебных материалов и траекторий обучения.',
        rating: 4.9,
        views: 1240,
        likes: 156,
        avgScore: 98,
        curator: 'Петров А.В.',
        members: [
          { initials: 'ИИ', name: 'Иван Иванов', role: 'Team Lead' },
          { initials: 'МП', name: 'Мария Петрова', role: 'ML Engineer' },
        ],
        criteria: [
          { key: 'code', label: 'Качество Кода', value: 95 },
          { key: 'innov', label: 'Инновационность', value: 98 },
          { key: 'docs', label: 'Документация', value: 92 },
          { key: 'pres', label: 'Презентация', value: 96 },
        ],
        achievements: ['Победитель университетского конкурса', 'Публикация в научном журнале', 'Внедрение в учебный процесс'],
        awards: ['Лучший дипломный проект 2025', 'Приз зрительских симпатий'],
        publications: 1,
      },
      {
        id: 'h2',
        typeLabel: 'ВКР',
        isAwarded: false,
        title: 'Платформа для автоматизации тестирования веб-приложений',
        description: 'Комплексное решение для автоматизированного тестирования с использованием AI для генерации тест-кейсов.',
        rating: 4.8,
        views: 980,
        likes: 124,
        avgScore: 95,
        curator: 'Иванова М.С.',
        members: [
          { initials: 'АС', name: 'Алексей Сидоров', role: 'Fullstack Developer' },
          { initials: 'ОС', name: 'Ольга Смирнова', role: 'QA Engineer' },
        ],
        criteria: [
          { key: 'code', label: 'Качество Кода', value: 93 },
          { key: 'innov', label: 'Инновационность', value: 94 },
          { key: 'docs', label: 'Документация', value: 96 },
          { key: 'pres', label: 'Презентация', value: 95 },
        ],
        achievements: ['Интеграция в учебные лаборатории', 'Победа в хакатоне кафедры'],
        awards: [],
        publications: 0,
      },
      {
        id: 'h3',
        typeLabel: 'Курсовой проект',
        isAwarded: false,
        title: 'Мобильное приложение для управления студенческими проектами',
        description: 'Кросс-платформенное приложение для iOS и Android с функционалом управления задачами и коллаборации.',
        rating: 4.7,
        views: 756,
        likes: 98,
        avgScore: 92,
        curator: 'Сидоров И.П.',
        members: [
          { initials: 'ОС', name: 'Олег Сахаров', role: 'Mobile Developer' },
          { initials: 'ДК', name: 'Дмитрий Козлов', role: 'Designer' },
        ],
        criteria: [
          { key: 'code', label: 'Качество Кода', value: 90 },
          { key: 'innov', label: 'Инновационность', value: 92 },
          { key: 'docs', label: 'Документация', value: 89 },
          { key: 'pres', label: 'Презентация', value: 93 },
        ],
        achievements: ['Пилотное внедрение в студенческих командах'],
        awards: [],
        publications: 0,
      },
      {
        id: 'h4',
        typeLabel: 'Научная работа',
        isAwarded: true,
        title: 'Система распознавания рукописного текста на русском языке',
        description: 'Нейросетевая модель для распознавания рукописного текста с точностью до 94% на тестовых данных.',
        rating: 4.8,
        views: 1120,
        likes: 142,
        avgScore: 94,
        curator: 'Козлов Д.А.',
        members: [
          { initials: 'АВ', name: 'Анна Волкова', role: 'Researcher' },
          { initials: 'НП', name: 'Никита Платонов', role: 'Data Engineer' },
        ],
        criteria: [
          { key: 'code', label: 'Качество Кода', value: 92 },
          { key: 'innov', label: 'Инновационность', value: 95 },
          { key: 'docs', label: 'Документация', value: 90 },
          { key: 'pres', label: 'Презентация', value: 94 },
        ],
        achievements: ['Публикация в сборнике конференции', 'Демонстрация на Дне науки'],
        awards: ['Лучшая научная работа семестра'],
        publications: 2,
      },
      {
        id: 'h5',
        typeLabel: 'Дипломный проект',
        isAwarded: false,
        title: 'Blockchain-платформа для верификации дипломов',
        description: 'Децентрализованная система для выдачи и проверки подлинности образовательных документов.',
        rating: 4.7,
        views: 890,
        likes: 115,
        avgScore: 93,
        curator: 'Петров А.В.',
        members: [
          { initials: 'ЕМ', name: 'Екатерина Михайлова', role: 'Backend Developer' },
          { initials: 'СН', name: 'Сергей Никитин', role: 'Blockchain Engineer' },
        ],
        criteria: [
          { key: 'code', label: 'Качество Кода', value: 91 },
          { key: 'innov', label: 'Инновационность', value: 93 },
          { key: 'docs', label: 'Документация', value: 90 },
          { key: 'pres', label: 'Презентация', value: 92 },
        ],
        achievements: ['Интеграция с университетской системой', 'Демо для партнеров'],
        awards: [],
        publications: 0,
      },
    ],
    []
  );

  const headStats = useMemo(() => {
    const topCount = headProjects.length;
    const awardedCount = headProjects.filter((p) => p.isAwarded || p.awards.length).length;
    const publications = headProjects.reduce((sum, p) => sum + p.publications, 0);
    const avg = topCount ? headProjects.reduce((sum, p) => sum + p.avgScore, 0) / topCount : 0;
    return { topCount, awardedCount, publications, avgScore: avg };
  }, [headProjects]);

  const headList = useMemo(() => {
    const copy = [...headProjects];
    if (headTab === 'score') return copy.sort((a, b) => b.avgScore - a.avgScore);
    if (headTab === 'rating') return copy.sort((a, b) => b.rating - a.rating);
    if (headTab === 'popular') return copy.sort((a, b) => b.views - a.views);
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
                <img src={BellIcon} className={styles.icon3} />
                <div className={styles.badge}>
                  <p className={styles.a32}>3</p>
                </div>
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
                        <div className={styles.headStatLabel}>Топ проектов</div>
                        <div className={styles.headStatValue}>{headStats.topCount}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconYellow}`}>
                        <img src={AwardIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>С наградами</div>
                        <div className={styles.headStatValue}>{headStats.awardedCount}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconPurple}`}>
                        <img src={AwardIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Публикации</div>
                        <div className={styles.headStatValue}>{headStats.publications}</div>
                      </div>
                      <div className={`${styles.headStatIconWrap} ${styles.headStatIconBlue}`}>
                        <img src={FileIcon} className={styles.headStatIcon} />
                      </div>
                    </div>
                    <div className={styles.headStatCard}>
                      <div>
                        <div className={styles.headStatLabel}>Средняя оценка</div>
                        <div className={styles.headStatValueGreen}>{headStats.avgScore.toFixed(1)}</div>
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
                      По оценке
                    </button>
                    <button type="button" className={headTab === 'rating' ? styles.headTabActive : styles.headTab} onClick={() => setHeadTab('rating')}>
                      По рейтингу
                    </button>
                    <button type="button" className={headTab === 'popular' ? styles.headTabActive : styles.headTab} onClick={() => setHeadTab('popular')}>
                      Популярные
                    </button>
                  </div>

                  <div className={styles.headList}>
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
                    />
                  )}
                </>
              ) : (
                <>
                  <div className={styles.container8}>
                    <div className={styles.primitiveDiv}>
                      <div className={styles.primitiveButton}>
                        <p className={styles.a12}>Все проекты</p>
                      </div>
                      <p className={styles.a13}>Активные</p>
                      <p className={styles.a14}>Архив</p>
                    </div>
                    <div className={styles.button9} onClick={openCreateProject}>
                      <img src={AddIcon} className={styles.icon4} />
                      <p className={styles.a15}>Создать проект</p>
                    </div>
                  </div>

                  <div className={styles.container29}>
                    {projectsLoading && <div style={{ padding: 12 }}>Загрузка проектов...</div>}
                    {projects.length === 0 && !projectsLoading && (
                      <DemoProjects onSelect={(id) => setSelectedProjectId(id)} />
                    )}
                    {projects.map((p) => (
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
                              <input
                                className={styles.modalInput}
                                placeholder="Добавить участников"
                                disabled
                              />
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
                      </div>
                      {tasksLoading && <div style={{ padding: 12 }}>Загрузка задач...</div>}
                      {tasksError && <div style={{ padding: 12 }}>API недоступно — режим офлайн.</div>}
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
              <HeadStarIcon className={styles.headMetaIcon} />
              {project.rating.toFixed(1)}
            </span>
            <span className={styles.headMetaPill}>
              <img src={EyeIcon} className={styles.headMetaImgIcon} />
              {project.views}
            </span>
            <span className={styles.headMetaPill}>
              <HeadThumbIcon className={styles.headMetaIcon} />
              {project.likes}
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
          <div className={styles.headScoreLabel}>Общая оценка</div>
          <div className={styles.headScoreValue}>{project.avgScore}/100</div>
        </div>
        <div className={styles.headScoreBar}>
          <div className={styles.headScoreFill} style={{ width: `${clamp(project.avgScore, 0, 100)}%` }} />
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

        <div className={styles.headSectionTitle}>Оценки по критериям</div>
        <div className={styles.headCriteria}>
          {project.criteria.map((c) => (
            <div key={c.key} className={styles.headCriteriaRow}>
              <div className={styles.headCriteriaTop}>
                <div className={styles.headCriteriaLabel}>{c.label}</div>
                <div className={styles.headCriteriaValue}>{clamp(c.value, 0, 100)}/100</div>
              </div>
              <div className={styles.headCriteriaBar}>
                <div className={styles.headCriteriaFill} style={{ width: `${clamp(c.value, 0, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.headSectionTitle}>Достижения</div>
        <div className={styles.headAchievements}>
          {project.achievements.map((a) => (
            <div key={a} className={styles.headAchievementRow}>
              <img src={AwardIcon} className={styles.headAchievementIcon} />
              <div className={styles.headAchievementText}>{a}</div>
            </div>
          ))}
        </div>

        {(project.awards.length || project.isAwarded) && (
          <>
            <div className={styles.headSectionTitle}>Награды</div>
            <div className={styles.headAwardsRow}>
              {project.awards.map((a) => (
                <span key={a} className={styles.headAwardChip}>
                  <img src={AwardIcon} className={styles.headAwardChipIcon} />
                  {a}
                </span>
              ))}
            </div>
          </>
        )}

        <div className={styles.headBottomKpis}>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueBlue}>{project.avgScore}</div>
            <div className={styles.headKpiLabel}>Оценка</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueOrange}>{project.rating.toFixed(1)}</div>
            <div className={styles.headKpiLabel}>Рейтинг</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueBlue}>{project.views}</div>
            <div className={styles.headKpiLabel}>Просмотры</div>
          </div>
          <div className={styles.headKpiCard}>
            <div className={styles.headKpiValueGreen}>{project.likes}</div>
            <div className={styles.headKpiLabel}>Лайки</div>
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

const HeadStarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.75l2.88 5.83 6.44.94-4.66 4.54 1.1 6.41L12 17.92l-5.76 3.03 1.1-6.41-4.66-4.54 6.44-.94L12 2.75z" />
  </svg>
);

const HeadThumbIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 10V21H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h4z" />
    <path d="M10 10h6.3c.6 0 1.16.27 1.54.73.38.46.55 1.06.45 1.65l-1.2 7A2 2 0 0 1 15.12 21H10V10z" />
    <path d="M10 10l2.2-6.1A2 2 0 0 1 14.1 2h.4c.83 0 1.5.67 1.5 1.5V10H10z" />
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
}: {
  project: TeacherProject | null;
  commentDraft: string;
  onChangeComment: (v: string) => void;
  onClose: () => void;
  onSendComment: () => void;
}) => {
  if (!project) return null;

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
          {project.members.map((m) => (
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

        <div className={styles.teacherSectionTitle}>Этапы проекта</div>
        <div className={styles.teacherStages}>
          {project.stages.map((s) => (
            <div key={`${s.title}-${s.date}`} className={styles.teacherStageRow}>
              <div className={s.done ? styles.teacherStageDotDone : styles.teacherStageDotTodo}>
                {s.done ? '✓' : '!'}
              </div>
              <div className={styles.teacherStageTitle}>{s.title}</div>
              <div className={styles.teacherStageDate}>{s.date}</div>
            </div>
          ))}
        </div>

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
              <p className={styles.a65}>{project.status}</p>
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
              <p className={styles.a17}>3</p>
            </div>
          </div>
          <div className={styles.container14}>
            <img src={CalendarIcon} className={styles.icon7} />
            <div className={styles.text13}>
              <p className={styles.a17}>{project.endDate || '-'}</p>
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
                <p className={styles.a32}>{t.status}</p>
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

const DemoProjects = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const demo: ProjectDto[] = [
    {
      id: 'demo-1',
      title: 'Разработка мобильного приложения',
      description: 'Создание образовательного приложения для iOS и Android',
      status: 'ACTIVE',
      endDate: '15.12.2025',
    },
    {
      id: 'demo-2',
      title: 'Исследование AI в образовании',
      description: 'Анализ применения искусственного интеллекта в учебном процессе',
      status: 'ACTIVE',
      endDate: '30.11.2025',
    },
  ];
  return (
    <>
      {demo.map((p) => (
        <ProjectCard key={p.id} project={p} onSelect={() => onSelect(p.id)} />
      ))}
    </>
  );
};

export default ProjectsPage;
