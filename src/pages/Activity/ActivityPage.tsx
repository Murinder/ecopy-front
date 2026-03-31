import { useMemo, useState } from 'react';
import styles from './ActivityPage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../app/hooks';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

type TeacherKpiItem = {
  label: string;
  value: number;
  delta: string;
  icon: string;
  iconTone: 'blue' | 'purple' | 'green' | 'orange';
};

type TeacherActivityItem = {
  id: string;
  initials: string;
  name: string;
  actionTitle: string;
  actionSub: string;
  timeAgo: string;
  tone: 'blue' | 'purple' | 'green' | 'orange';
};

type TeacherStudentItem = {
  id: string;
  initials: string;
  name: string;
  project: string;
  tasksDone: number;
  tasksTotal: number;
  lastActive: string;
};

type TeacherAttentionProject = {
  id: string;
  title: string;
  statusLabel: string;
  statusTone: 'urgent' | 'attention' | 'low';
  members: string;
  issue: string;
  issueTone: 'red' | 'blue' | 'gray';
};

type HeadAnalyticsTabKey = 'performance' | 'activity' | 'science';

const TeacherActivityView = ({ avatarInitials }: { avatarInitials: string }) => {
  const kpis = useMemo<TeacherKpiItem[]>(
    () => [
      { label: 'Активных проектов', value: 8, delta: '+2', icon: FileIcon, iconTone: 'blue' },
      { label: 'Студентов', value: 24, delta: '+5', icon: PeopleIcon, iconTone: 'purple' },
      { label: 'Задач на проверке', value: 15, delta: '+3', icon: EyeIcon, iconTone: 'green' },
      { label: 'Консультаций', value: 32, delta: '+8', icon: ChatIcon, iconTone: 'orange' },
    ],
    []
  );

  const byProjects = useMemo(
    () => [
      { name: 'Нед 1', created: 14, done: 8 },
      { name: 'Нед 2', created: 18, done: 12 },
      { name: 'Нед 3', created: 22, done: 14 },
      { name: 'Нед 4', created: 26, done: 18 },
    ],
    []
  );

  const studentProgress = useMemo(
    () => [
      { name: 'Сен', value: 75 },
      { name: 'Окт', value: 82 },
      { name: 'Ноя', value: 88 },
      { name: 'Дек', value: 85 },
    ],
    []
  );

  const lastActivity = useMemo<TeacherActivityItem[]>(
    () => [
      {
        id: 'a1',
        initials: 'ИИ',
        name: 'Иван Иванов',
        actionTitle: 'завершил задачу',
        actionSub: 'Мобильное приложение',
        timeAgo: '15 минут назад',
        tone: 'blue',
      },
      {
        id: 'a2',
        initials: 'МП',
        name: 'Мария Петрова',
        actionTitle: 'подала заявку',
        actionSub: 'Новый проект',
        timeAgo: '1 час назад',
        tone: 'purple',
      },
      {
        id: 'a3',
        initials: 'АС',
        name: 'Алексей Сидоров',
        actionTitle: 'отправил на проверку',
        actionSub: 'Исследование AI',
        timeAgo: '2 часа назад',
        tone: 'green',
      },
      {
        id: 'a4',
        initials: 'ОС',
        name: 'Ольга Смирнова',
        actionTitle: 'оставила комментарий',
        actionSub: 'Мобильное приложение',
        timeAgo: '3 часа назад',
        tone: 'orange',
      },
      {
        id: 'a5',
        initials: 'ДК',
        name: 'Дмитрий Козлов',
        actionTitle: 'обновил статус',
        actionSub: 'Веб-сервис',
        timeAgo: '5 часов назад',
        tone: 'blue',
      },
    ],
    []
  );

  const activeStudents = useMemo<TeacherStudentItem[]>(
    () => [
      { id: 's1', initials: 'ИИ', name: 'Иван Иванов', project: 'Мобильное приложение', tasksDone: 12, tasksTotal: 14, lastActive: '15 мин назад' },
      { id: 's2', initials: 'МП', name: 'Мария Петрова', project: 'Мобильное приложение', tasksDone: 10, tasksTotal: 13, lastActive: '1 час назад' },
      { id: 's3', initials: 'АС', name: 'Алексей Сидоров', project: 'Исследование AI', tasksDone: 8, tasksTotal: 11, lastActive: '2 часа назад' },
    ],
    []
  );

  const attentionProjects = useMemo<TeacherAttentionProject[]>(
    () => [
      {
        id: 'p1',
        title: 'Веб-сервис',
        statusLabel: 'Срочно',
        statusTone: 'urgent',
        members: 'Дмитрий Козлов, Елена Новикова',
        issue: 'Задержка: 3 дня',
        issueTone: 'red',
      },
      {
        id: 'p2',
        title: 'Исследование AI',
        statusLabel: 'Внимание',
        statusTone: 'attention',
        members: 'Алексей Сидоров, Ольга Смирнова',
        issue: 'Обновлено: 5 дней назад',
        issueTone: 'gray',
      },
      {
        id: 'p3',
        title: 'Система аналитики',
        statusLabel: 'Низкий',
        statusTone: 'low',
        members: 'Андрей Волков',
        issue: 'На проверке: 2 задачи',
        issueTone: 'blue',
      },
    ],
    []
  );

  const kpiIconWrapClass = (tone: TeacherKpiItem['iconTone']) =>
    tone === 'blue'
      ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconBlue}`
      : tone === 'purple'
        ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconPurple}`
        : tone === 'green'
          ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconGreen}`
          : `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconOrange}`;

  const activityToneClass = (tone: TeacherActivityItem['tone']) =>
    tone === 'blue'
      ? `${styles.teacherActivityDot} ${styles.teacherDotBlue}`
      : tone === 'purple'
        ? `${styles.teacherActivityDot} ${styles.teacherDotPurple}`
        : tone === 'green'
          ? `${styles.teacherActivityDot} ${styles.teacherDotGreen}`
          : `${styles.teacherActivityDot} ${styles.teacherDotOrange}`;

  const projectPillClass = (tone: TeacherAttentionProject['statusTone']) =>
    tone === 'urgent'
      ? `${styles.teacherProjectPill} ${styles.teacherPillUrgent}`
      : tone === 'attention'
        ? `${styles.teacherProjectPill} ${styles.teacherPillAttention}`
        : `${styles.teacherProjectPill} ${styles.teacherPillLow}`;

  const issueClass = (tone: TeacherAttentionProject['issueTone']) =>
    tone === 'red' ? styles.teacherIssueRed : tone === 'blue' ? styles.teacherIssueBlue : styles.teacherIssueGray;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Активность</div>
              <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <div className={styles.notifBadge}>7</div>
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.teacherKpiGrid}>
              {kpis.map((k) => (
                <div key={k.label} className={styles.teacherKpiCard}>
                  <div className={styles.teacherKpiTop}>
                    <div className={kpiIconWrapClass(k.iconTone)}>
                      <img src={k.icon} className={styles.teacherKpiIcon} />
                    </div>
                    <div className={styles.teacherKpiDelta}>{k.delta}</div>
                  </div>
                  <div className={styles.teacherKpiValue}>{k.value}</div>
                  <div className={styles.teacherKpiLabel}>{k.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активность по проектам</div>
                  <div className={styles.cardSubtitle}>Динамика выполнения задач за последний месяц</div>
                </div>
                <div className={styles.chartPlaceholder}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byProjects} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                      <Bar dataKey="done" name="Выполнено" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="created" name="Создано задач" fill="#3a76f0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.teacherLegendRow}>
                  <div className={styles.teacherLegendItem}>
                    <span className={styles.teacherLegendDot} style={{ background: '#10b981' }} />
                    Выполнено
                  </div>
                  <div className={styles.teacherLegendItem}>
                    <span className={styles.teacherLegendDot} style={{ background: '#3a76f0' }} />
                    Создано задач
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Прогресс студентов</div>
                  <div className={styles.cardSubtitle}>Средняя успеваемость</div>
                </div>
                <div className={styles.teacherChartSmall}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentProgress} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} domain={[60, 100]} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                      <Line type="monotone" dataKey="value" stroke="#3a76f0" strokeWidth={3} dot={{ r: 3, fill: '#3a76f0' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherListHeader}>
                  <div>
                    <div className={styles.cardTitle}>Последняя активность</div>
                    <div className={styles.cardSubtitle}>События по курируемым проектам</div>
                  </div>
                  <button type="button" className={styles.teacherLinkBtn} onClick={() => window.alert('Список активности (демо)')}>
                    Показать все →
                  </button>
                </div>
                <div className={styles.teacherActivityList}>
                  {lastActivity.map((a) => (
                    <div key={a.id} className={styles.teacherActivityItem}>
                      <div className={styles.teacherActivityLeft}>
                        <div className={styles.teacherActivityAvatar}>{a.initials}</div>
                        <div className={styles.teacherActivityText}>
                          <div className={styles.teacherActivityName}>{a.name}</div>
                          <div className={styles.teacherActivitySub}>
                            {a.actionTitle} <span className={activityToneClass(a.tone)} /> <span className={styles.teacherActivityProject}>{a.actionSub}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.teacherActivityTime}>{a.timeAgo}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активные студенты</div>
                  <div className={styles.cardSubtitle}>Топ по выполненным задачам</div>
                </div>
                <div className={styles.teacherStudentsList}>
                  {activeStudents.map((s) => {
                    const pct = Math.round((s.tasksDone / Math.max(1, s.tasksTotal)) * 100);
                    return (
                      <div key={s.id} className={styles.teacherStudentRow}>
                        <div className={styles.teacherStudentTop}>
                          <div className={styles.teacherStudentAvatar}>{s.initials}</div>
                          <div className={styles.teacherStudentMain}>
                            <div className={styles.teacherStudentName}>{s.name}</div>
                            <div className={styles.teacherStudentProject}>{s.project}</div>
                          </div>
                          <div className={styles.teacherStudentMetaRight}>
                            <div className={styles.teacherStudentTasks}>
                              {s.tasksDone}/{s.tasksTotal}
                            </div>
                            <div className={styles.teacherStudentPct}>{pct}%</div>
                          </div>
                        </div>
                        <div className={styles.teacherProgressBar}>
                          <div className={styles.teacherProgressFill} style={{ width: `${pct}%` }} />
                        </div>
                        <div className={styles.teacherStudentLast}>Последняя активность: {s.lastActive}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.teacherCardHeaderCol}>
                <div className={styles.cardTitle}>Проекты требующие внимания</div>
                <div className={styles.cardSubtitle}>Проекты с задержками или низкой активностью</div>
              </div>
              <div className={styles.teacherProjectsGrid}>
                {attentionProjects.map((p) => (
                  <div key={p.id} className={styles.teacherProjectCard}>
                    <div className={styles.teacherProjectTop}>
                      <div className={styles.teacherProjectTitle}>{p.title}</div>
                      <span className={projectPillClass(p.statusTone)}>{p.statusLabel}</span>
                    </div>
                    <div className={styles.teacherProjectMembers}>{p.members}</div>
                    <div className={`${styles.teacherProjectIssue} ${issueClass(p.issueTone)}`}>{p.issue}</div>
                    <button type="button" className={styles.teacherProjectBtn} onClick={() => window.alert('Детали проекта (демо)')}>
                      Посмотреть детали
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentActivityView = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const kpis = useMemo(
    () => [
      { title: 'Завершено задач', value: '47', sub: '+12% за месяц' },
      { title: 'Часов обучения', value: '124', sub: '+8% за месяц' },
      { title: 'Посещено мероприятий', value: '18', sub: '+25% за месяц' },
      { title: 'Активность', value: '92%', sub: '+5% за месяц' },
    ],
    []
  );

  const barData = useMemo(
    () => [
      { name: 'Сен', value: 62 },
      { name: 'Окт', value: 75 },
      { name: 'Ноя', value: 84 },
      { name: 'Дек', value: 78 },
      { name: 'Янв', value: 92 },
      { name: 'Фев', value: 96 },
    ],
    []
  );

  const pieData = useMemo(
    () => [
      { name: 'Проекты', value: 40, color: '#3a76f0' },
      { name: 'Коммуникация', value: 10, color: '#60a5fa' },
      { name: 'Мероприятия', value: 15, color: '#bedbff' },
      { name: 'Учеба', value: 35, color: '#0e1d45' },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { user: 'Иван Иванов', action: 'Завершена задача "API интеграция"', date: '2 часа назад', status: 'Готово' },
      { user: 'Иван Иванов', action: 'Сдан экзамен по Математике', date: '5 часов назад', status: 'Отлично' },
      { user: 'Иван Иванов', action: 'Участие в хакатоне', date: '1 день назад', status: 'Участие' },
      { user: 'Иван Иванов', action: 'Создана новая задача "Исследование AI"', date: '2 дня назад', status: 'Создано' },
      { user: 'Иван Иванов', action: 'Пройден курс "React Advanced"', date: '3 дня назад', status: 'Пройдено' },
    ],
    []
  );

  const subjectsData = useMemo(
    () => [
      { name: 'Математический\nанализ', grade: 92, attendance: 96 },
      { name: 'Программирование', grade: 88, attendance: 100 },
      { name: 'Физика', grade: 84, attendance: 90 },
      { name: 'Английский\nязык', grade: 87, attendance: 93 },
      { name: 'Базы данных', grade: 94, attendance: 100 },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Активность</div>
              <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <div className={styles.notifBadge}>3</div>
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.kpiGrid}>
              {kpis.map((k) => (
                <div key={k.title} className={styles.kpiCard}>
                  <div className={styles.kpiTitle}>{k.title}</div>
                  <div className={styles.kpiValue}>{k.value}</div>
                  <div className={styles.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Ежемесячная активность</div>
                  <div className={styles.filters}>
                    <select
                      className={styles.select}
                      value={period}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === 'week' || next === 'month' || next === 'quarter') setPeriod(next);
                      }}
                    >
                      <option value="month">Месяц</option>
                      <option value="week">Неделя</option>
                      <option value="quarter">Квартал</option>
                    </select>
                  </div>
                </div>
                <div className={styles.chartPlaceholder}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                        labelStyle={{ color: '#0a0a0a' }}
                      />
                      <Bar dataKey="value" fill="#3a76f0" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Распределение времени</div>
                </div>
                <div className={styles.donutWrap}>
                  <div className={styles.chartPlaceholder}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {pieData.map((e) => (
                            <Cell key={e.name} fill={e.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.legend}>
                    {pieData.map((e) => (
                      <div key={e.name} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: e.color }} />
                        {e.name} {e.value}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Динамика прогресса</div>
                </div>
                <div className={styles.chartPlaceholder}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                        labelStyle={{ color: '#0a0a0a' }}
                      />
                      <Bar dataKey="value" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Последняя активность</div>
                </div>
                <div className={styles.list}>
                  {activities.map((a) => (
                    <div key={a.action} className={styles.listItem}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontWeight: 600 }}>{a.user}</div>
                        <div style={{ color: '#6a7282' }}>{a.action}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ color: '#6a7282' }}>{a.date}</div>
                        <span className={styles.statusBadge}>{a.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Успеваемость по предметам</div>
                <div className={styles.cardSubtitle}>Оценки и посещаемость</div>
              </div>
              <div className={styles.chartWide}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectsData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                    barCategoryGap={14}
                  >
                    <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6a7282', fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fill: '#6a7282', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                      labelStyle={{ color: '#0a0a0a' }}
                    />
                    <Bar dataKey="grade" name="Оценка" fill="#3a76f0" radius={[6, 6, 6, 6]} />
                    <Bar dataKey="attendance" name="Посещаемость" fill="#60a5fa" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.legendRow}>
                <div className={styles.legendItemInline}>
                  <span className={styles.legendDot} style={{ background: '#3a76f0' }} />
                  Оценка
                </div>
                <div className={styles.legendItemInline}>
                  <span className={styles.legendDot} style={{ background: '#60a5fa' }} />
                  Посещаемость
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeadAnalyticsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [tab, setTab] = useState<HeadAnalyticsTabKey>('performance');

  const kpis = useMemo(
    () => [
      { label: 'Средний балл', value: 4.4, max: 4.5, delta: '+0', icon: AwardIcon, tone: 'blue' as const },
      { label: 'Посещаемость', value: 94, max: 95, delta: '+2', icon: PeopleIcon, tone: 'green' as const },
      { label: 'Публикации', value: 47, max: 40, delta: '+1', icon: FileIcon, tone: 'purple' as const },
    ],
    []
  );

  const performanceByGroup = useMemo(
    () => [
      { name: 'ПИ-22-1', activity: 88, attendance: 96, avgGrade: 4.4 },
      { name: 'ПИ-22-2', activity: 92, attendance: 98, avgGrade: 4.3 },
      { name: 'ПИ-21-1', activity: 86, attendance: 94, avgGrade: 4.2 },
      { name: 'ПИ-21-2', activity: 91, attendance: 97, avgGrade: 4.4 },
      { name: 'ПИ-20-1', activity: 87, attendance: 95, avgGrade: 4.1 },
      { name: 'ПИ-20-2', activity: 89, attendance: 96, avgGrade: 4.2 },
    ],
    []
  );

  const studentsByCourse = useMemo(
    () => [
      { name: '1 курс', value: 120, color: '#3a76f0' },
      { name: '2 курс', value: 110, color: '#10b981' },
      { name: '3 курс', value: 78, color: '#f59e0b' },
      { name: '4 курс', value: 41, color: '#8b5cf6' },
    ],
    []
  );

  const semesters = useMemo(
    () => [
      { name: '2023/1', graduation: 94, avgGrade: 4.1 },
      { name: '2023/2', graduation: 96, avgGrade: 4.2 },
      { name: '2024/1', graduation: 97, avgGrade: 4.25 },
      { name: '2024/2', graduation: 98, avgGrade: 4.3 },
      { name: '2025/1', graduation: 99, avgGrade: 4.35 },
    ],
    []
  );

  const activityByMonth = useMemo(
    () => [
      { name: 'Сен', projects: 45, events: 28, publications: 6 },
      { name: 'Окт', projects: 52, events: 34, publications: 8 },
      { name: 'Ноя', projects: 68, events: 38, publications: 10 },
      { name: 'Дек', projects: 60, events: 26, publications: 7 },
      { name: 'Янв', projects: 72, events: 44, publications: 9 },
      { name: 'Фев', projects: 66, events: 40, publications: 8 },
    ],
    []
  );

  const activityKpis = useMemo(
    () => [
      { label: 'Активных проектов', value: '87', delta: '+12 за месяц', tone: 'blue' as const },
      { label: 'Мероприятий проведено', value: '201', delta: '+18 за месяц', tone: 'green' as const },
      { label: 'Вовлеченность студентов', value: '89%', delta: '+5% за семестр', tone: 'orange' as const },
    ],
    []
  );

  const scienceBars = useMemo(
    () => [
      { name: 'Статьи', value: 47, color: '#3a76f0' },
      { name: 'Конференции', value: 32, color: '#10b981' },
      { name: 'Гранты', value: 8, color: '#f59e0b' },
      { name: 'Патенты', value: 5, color: '#8b5cf6' },
    ],
    []
  );

  const yearResults = useMemo(
    () => [
      { label: 'Статей опубликовано', value: '47', color: '#3a76f0' },
      { label: 'Грантов получено', value: '8', color: '#10b981' },
      { label: 'Конференций', value: '32', color: '#f97316' },
      { label: 'Патентов', value: '5', color: '#8b5cf6' },
    ],
    []
  );

  const scienceKpis = useMemo(
    () => [
      { label: 'Грантовое финансирование', value: '12.5M ₽', tone: 'blue' as const },
      { label: 'Студентов в исследованиях', value: '156', tone: 'green' as const },
      { label: 'Международных публикаций', value: '18', tone: 'purple' as const },
    ],
    []
  );

  const kpiIconWrapClass = (tone: (typeof kpis)[number]['tone']) =>
    tone === 'blue'
      ? `${styles.headKpiIconWrap} ${styles.headKpiIconBlue}`
      : tone === 'green'
        ? `${styles.headKpiIconWrap} ${styles.headKpiIconGreen}`
        : `${styles.headKpiIconWrap} ${styles.headKpiIconPurple}`;

  const activityKpiValueClass = (tone: (typeof activityKpis)[number]['tone']) =>
    tone === 'blue'
      ? styles.headBigValueBlue
      : tone === 'green'
        ? styles.headBigValueGreen
        : styles.headBigValueOrange;

  const scienceKpiValueClass = (tone: (typeof scienceKpis)[number]['tone']) =>
    tone === 'blue' ? styles.headBigValueBlue : tone === 'green' ? styles.headBigValueGreen : styles.headBigValuePurple;

  const pieLabel = ({ name, value }: PieLabelRenderProps) => {
    const labelName = typeof name === 'string' ? name : '—';
    const labelValue = typeof value === 'number' || typeof value === 'string' ? value : '';
    return labelValue === '' ? labelName : `${labelName}: ${labelValue}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Аналитика</div>
              <div className={styles.subtitle}>Кафедра программной инженерии</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <div className={styles.notifBadge}>4</div>
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.headKpiGrid}>
              {kpis.map((k) => (
                <div key={k.label} className={styles.headKpiCard}>
                  <div className={styles.headKpiTop}>
                    <div className={kpiIconWrapClass(k.tone)}>
                      <img src={k.icon} className={styles.headKpiIcon} />
                    </div>
                    <div className={styles.headDeltaChip}>{k.delta}</div>
                  </div>
                  <div className={styles.headKpiLabel}>{k.label}</div>
                  <div className={styles.headKpiValueRow}>
                    <div className={styles.headKpiValue}>{k.value}</div>
                    <div className={styles.headKpiMax}>/{k.max}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.headTabs}>
              <button type="button" className={tab === 'performance' ? styles.headTabActive : styles.headTab} onClick={() => setTab('performance')}>
                Успеваемость
              </button>
              <button type="button" className={tab === 'activity' ? styles.headTabActive : styles.headTab} onClick={() => setTab('activity')}>
                Активность
              </button>
              <button type="button" className={tab === 'science' ? styles.headTabActive : styles.headTab} onClick={() => setTab('science')}>
                Научная работа
              </button>
            </div>

            {tab === 'performance' && (
              <>
                <div className={styles.headChartsRow}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Успеваемость по группам</div>
                        <div className={styles.cardSubtitle}>Средний балл, посещаемость и активность</div>
                      </div>
                    </div>
                    <div className={styles.headChartTall}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceByGroup} margin={{ top: 12, right: 18, left: 0, bottom: 0 }} barCategoryGap={10}>
                          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fill: '#6a7282', fontSize: 12 }} domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6a7282', fontSize: 12 }} domain={[0, 5]} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                          <Bar yAxisId="left" dataKey="activity" name="Активность %" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                          <Bar yAxisId="left" dataKey="attendance" name="Посещаемость %" fill="#10b981" radius={[6, 6, 0, 0]} />
                          <Bar yAxisId="right" dataKey="avgGrade" name="Средний балл" fill="#3a76f0" radius={[6, 6, 0, 0]} barSize={10} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className={styles.teacherLegendRow} style={{ justifyContent: 'center' }}>
                      <div className={styles.teacherLegendItem}>
                        <span className={styles.teacherLegendDot} style={{ background: '#f59e0b' }} />
                        Активность %
                      </div>
                      <div className={styles.teacherLegendItem}>
                        <span className={styles.teacherLegendDot} style={{ background: '#10b981' }} />
                        Посещаемость %
                      </div>
                      <div className={styles.teacherLegendItem}>
                        <span className={styles.teacherLegendDot} style={{ background: '#3a76f0' }} />
                        Средний балл
                      </div>
                    </div>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Студенты по курсам</div>
                        <div className={styles.cardSubtitle}>Распределение</div>
                      </div>
                    </div>
                    <div className={styles.headChartTall}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={studentsByCourse} dataKey="value" nameKey="name" outerRadius={92} label={pieLabel} labelLine>
                            {studentsByCourse.map((p) => (
                              <Cell key={p.name} fill={p.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                    <div>
                      <div className={styles.cardTitle}>Динамика по семестрам</div>
                      <div className={styles.cardSubtitle}>Средний балл, процент выпускников</div>
                    </div>
                  </div>
                  <div className={styles.headChartWide}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={semesters} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fill: '#6a7282', fontSize: 12 }} domain={[0, 100]} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6a7282', fontSize: 12 }} domain={[0, 5]} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                        <Line yAxisId="left" type="monotone" dataKey="graduation" name="Выпуск %" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line yAxisId="right" type="monotone" dataKey="avgGrade" name="Средний балл" stroke="#3a76f0" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.teacherLegendRow} style={{ justifyContent: 'center' }}>
                    <div className={styles.teacherLegendItem}>
                      <span className={styles.teacherLegendDot} style={{ background: '#10b981' }} />
                      Выпуск %
                    </div>
                    <div className={styles.teacherLegendItem}>
                      <span className={styles.teacherLegendDot} style={{ background: '#3a76f0' }} />
                      Средний балл
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === 'activity' && (
              <>
                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                    <div>
                      <div className={styles.cardTitle}>Активность студентов по месяцам</div>
                      <div className={styles.cardSubtitle}>Проекты, мероприятия и публикации</div>
                    </div>
                  </div>
                  <div className={styles.headChartWide}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityByMonth} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                        <Area type="monotone" dataKey="projects" name="Проекты" stroke="#3a76f0" fill="#3a76f033" strokeWidth={2} />
                        <Area type="monotone" dataKey="events" name="Мероприятия" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                        <Area type="monotone" dataKey="publications" name="Публикации" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.teacherLegendRow} style={{ justifyContent: 'center' }}>
                    <div className={styles.teacherLegendItem}>
                      <span className={styles.teacherLegendDot} style={{ background: '#10b981' }} />
                      Мероприятия
                    </div>
                    <div className={styles.teacherLegendItem}>
                      <span className={styles.teacherLegendDot} style={{ background: '#3a76f0' }} />
                      Проекты
                    </div>
                    <div className={styles.teacherLegendItem}>
                      <span className={styles.teacherLegendDot} style={{ background: '#f59e0b' }} />
                      Публикации
                    </div>
                  </div>
                </div>

                <div className={styles.headThreeGrid}>
                  {activityKpis.map((k) => (
                    <div key={k.label} className={styles.headMiniCard}>
                      <div className={activityKpiValueClass(k.tone)}>{k.value}</div>
                      <div className={styles.headMiniLabel}>{k.label}</div>
                      <div className={styles.headMiniDelta}>{k.delta}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'science' && (
              <>
                <div className={styles.headChartsRow}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Научная активность кафедры</div>
                        <div className={styles.cardSubtitle}>За текущий год</div>
                      </div>
                    </div>
                    <div className={styles.headChartTall}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scienceBars} layout="vertical" margin={{ top: 12, right: 12, left: 12, bottom: 0 }} barCategoryGap={12}>
                          <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fill: '#6a7282', fontSize: 12 }} />
                          <YAxis type="category" dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} width={110} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} labelStyle={{ color: '#0a0a0a' }} />
                          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                            {scienceBars.map((b) => (
                              <Cell key={b.name} fill={b.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Итоги года</div>
                        <div className={styles.cardSubtitle}>Научные достижения</div>
                      </div>
                    </div>
                    <div className={styles.headResultsList}>
                      {yearResults.map((r) => (
                        <div key={r.label} className={styles.headResultRow}>
                          <div className={styles.headResultValue} style={{ color: r.color }}>
                            {r.value}
                          </div>
                          <div className={styles.headResultLabel}>{r.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.headThreeGrid}>
                  {scienceKpis.map((k) => (
                    <div key={k.label} className={styles.headMiniCard}>
                      <div className={scienceKpiValueClass(k.tone)}>{k.value}</div>
                      <div className={styles.headMiniLabel}>{k.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';

  return isHead ? <HeadAnalyticsView avatarInitials={initials} /> : isTeacher ? <TeacherActivityView avatarInitials={initials} /> : <StudentActivityView />;
};

export default ActivityPage;
