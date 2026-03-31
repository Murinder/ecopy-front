import { useEffect, useMemo, useState } from 'react';
import styles from './TeachersPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import SearchIcon from '../../assets/icons/ui-search.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import { useAppSelector } from '../../app/hooks';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

type TeacherItem = {
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
};

type SortKey = 'rating' | 'projects' | 'publications';

const TeachersPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Смирнов В.И.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const isHead = userRole === 'Заведующий кафедрой';

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const teachers = useMemo<TeacherItem[]>(
    () => [
      {
        id: 't1',
        name: 'Иванова Мария Сергеевна',
        title: 'Профессор',
        rating: 4.9,
        activeProjects: 10,
        totalProjects: 45,
        students: 38,
        completion: 89,
        avgGrade: 4.7,
        publications: 18,
        grants: 5,
        hours: 142,
        consultations: 52,
        activity: [
          { name: 'Сен', consultations: 34, projects: 8 },
          { name: 'Окт', consultations: 41, projects: 10 },
          { name: 'Ноя', consultations: 48, projects: 12 },
          { name: 'Дек', consultations: 45, projects: 11 },
          { name: 'Янв', consultations: 53, projects: 13 },
          { name: 'Фев', consultations: 50, projects: 12 },
        ],
        success: [
          { name: 'Отлично', value: 18 },
          { name: 'Хорошо', value: 15 },
          { name: 'Удовл.', value: 8 },
          { name: 'Неуд.', value: 2 },
        ],
        projectsStats: { active: 10, done: 35 },
        studentsStats: { total: 38, active: 36 },
        scienceStats: { publications: 18, grants: 5 },
      },
      {
        id: 't2',
        name: 'Петров Александр Владимирович',
        title: 'Доцент',
        rating: 4.8,
        activeProjects: 12,
        totalProjects: 40,
        students: 45,
        completion: 92,
        avgGrade: 4.6,
        publications: 12,
        grants: 3,
        hours: 156,
        consultations: 47,
        activity: [
          { name: 'Сен', consultations: 28, projects: 9 },
          { name: 'Окт', consultations: 33, projects: 10 },
          { name: 'Ноя', consultations: 39, projects: 11 },
          { name: 'Дек', consultations: 36, projects: 10 },
          { name: 'Янв', consultations: 44, projects: 12 },
          { name: 'Фев', consultations: 46, projects: 12 },
        ],
        success: [
          { name: 'Отлично', value: 22 },
          { name: 'Хорошо', value: 16 },
          { name: 'Удовл.', value: 6 },
          { name: 'Неуд.', value: 1 },
        ],
        projectsStats: { active: 12, done: 28 },
        studentsStats: { total: 45, active: 41 },
        scienceStats: { publications: 12, grants: 3 },
      },
      {
        id: 't3',
        name: 'Козлов Дмитрий Александрович',
        title: 'Доцент',
        rating: 4.7,
        activeProjects: 11,
        totalProjects: 41,
        students: 40,
        completion: 90,
        avgGrade: 4.6,
        publications: 10,
        grants: 2,
        hours: 128,
        consultations: 39,
        activity: [
          { name: 'Сен', consultations: 24, projects: 7 },
          { name: 'Окт', consultations: 30, projects: 9 },
          { name: 'Ноя', consultations: 35, projects: 9 },
          { name: 'Дек', consultations: 33, projects: 10 },
          { name: 'Янв', consultations: 38, projects: 11 },
          { name: 'Фев', consultations: 40, projects: 10 },
        ],
        success: [
          { name: 'Отлично', value: 16 },
          { name: 'Хорошо', value: 18 },
          { name: 'Удовл.', value: 8 },
          { name: 'Неуд.', value: 3 },
        ],
        projectsStats: { active: 11, done: 30 },
        studentsStats: { total: 40, active: 34 },
        scienceStats: { publications: 10, grants: 2 },
      },
      {
        id: 't4',
        name: 'Сидоров Игорь Петрович',
        title: 'Доцент',
        rating: 4.6,
        activeProjects: 9,
        totalProjects: 34,
        students: 35,
        completion: 87,
        avgGrade: 4.5,
        publications: 8,
        grants: 1,
        hours: 116,
        consultations: 33,
        activity: [
          { name: 'Сен', consultations: 20, projects: 6 },
          { name: 'Окт', consultations: 27, projects: 8 },
          { name: 'Ноя', consultations: 29, projects: 8 },
          { name: 'Дек', consultations: 26, projects: 7 },
          { name: 'Янв', consultations: 32, projects: 9 },
          { name: 'Фев', consultations: 31, projects: 8 },
        ],
        success: [
          { name: 'Отлично', value: 14 },
          { name: 'Хорошо', value: 14 },
          { name: 'Удовл.', value: 6 },
          { name: 'Неуд.', value: 2 },
        ],
        projectsStats: { active: 9, done: 25 },
        studentsStats: { total: 35, active: 31 },
        scienceStats: { publications: 8, grants: 1 },
      },
      {
        id: 't5',
        name: 'Волкова Анна Дмитриевна',
        title: 'Старший преподаватель',
        rating: 4.5,
        activeProjects: 8,
        totalProjects: 30,
        students: 32,
        completion: 85,
        avgGrade: 4.4,
        publications: 6,
        grants: 1,
        hours: 104,
        consultations: 29,
        activity: [
          { name: 'Сен', consultations: 18, projects: 5 },
          { name: 'Окт', consultations: 22, projects: 7 },
          { name: 'Ноя', consultations: 25, projects: 7 },
          { name: 'Дек', consultations: 24, projects: 6 },
          { name: 'Янв', consultations: 28, projects: 8 },
          { name: 'Фев', consultations: 27, projects: 7 },
        ],
        success: [
          { name: 'Отлично', value: 12 },
          { name: 'Хорошо', value: 13 },
          { name: 'Удовл.', value: 6 },
          { name: 'Неуд.', value: 1 },
        ],
        projectsStats: { active: 8, done: 22 },
        studentsStats: { total: 32, active: 28 },
        scienceStats: { publications: 6, grants: 1 },
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? teachers.filter((t) => t.name.toLowerCase().includes(q)) : teachers.slice();
    base.sort((a, b) => {
      if (sortBy === 'projects') return b.totalProjects - a.totalProjects;
      if (sortBy === 'publications') return b.publications - a.publications;
      return b.rating - a.rating;
    });
    return base;
  }, [query, sortBy, teachers]);

  const totalStats = useMemo(() => {
    const totalTeachers = teachers.length;
    const avgRating = teachers.reduce((acc, t) => acc + t.rating, 0) / Math.max(1, teachers.length);
    const totalProjects = teachers.reduce((acc, t) => acc + t.totalProjects, 0);
    const publications = teachers.reduce((acc, t) => acc + t.publications, 0);
    const grants = teachers.reduce((acc, t) => acc + t.grants, 0);
    return { totalTeachers, avgRating, totalProjects, publications, grants };
  }, [teachers]);

  const selected = useMemo(() => (selectedId ? teachers.find((t) => t.id === selectedId) || null : null), [selectedId, teachers]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const closeModal = () => setSelectedId(null);

  const successColors = ['#3a76f0', '#60a5fa', '#bedbff', '#d1d5db'];

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Преподаватели</div>
            <div className={styles.subtitle}>Кафедра программной инженерии</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <img src={BellIcon} className={styles.notifIcon} />
              <div className={styles.notifBadge}>4</div>
            </div>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
          {!isHead ? (
            <div className={styles.empty}>Раздел доступен только для роли «Заведующий кафедрой»</div>
          ) : (
            <>
              <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                  <img src={SearchIcon} className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск преподавателей..."
                  />
                </div>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'rating' || v === 'projects' || v === 'publications') setSortBy(v);
                  }}
                >
                  <option value="rating">По рейтингу</option>
                  <option value="projects">По проектам</option>
                  <option value="publications">По публикациям</option>
                </select>
              </div>

              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statLabel}>Всего преподавателей</div>
                    <div className={styles.statValueBlue}>{totalStats.totalTeachers}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statLabel}>Средний рейтинг</div>
                    <div className={styles.statValueGreen}>{totalStats.avgRating.toFixed(1)}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statLabel}>Всего проектов</div>
                    <div className={styles.statValuePurple}>{totalStats.totalProjects}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statLabel}>Публикации</div>
                    <div className={styles.statValueOrange}>{totalStats.publications}</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statLabel}>Гранты</div>
                    <div className={styles.statValueBlue}>{totalStats.grants}</div>
                  </div>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>Список преподавателей</div>
                  <div className={styles.panelSub}>Найдено преподавателей: {filtered.length}</div>
                </div>

                <div className={styles.list}>
                  {filtered.map((t) => {
                    const initialsCard = initialsFromName(t.name);
                    return (
                      <div key={t.id} className={styles.teacherRow}>
                        <div className={styles.teacherAvatar}>{initialsCard}</div>
                        <div className={styles.teacherBody}>
                          <div className={styles.teacherTop}>
                            <div className={styles.teacherName}>{t.name}</div>
                            <span className={styles.teacherPill}>{t.title}</span>
                            <span className={styles.teacherRating}>
                              <img src={AwardIcon} className={styles.teacherRatingIcon} />
                              {t.rating.toFixed(1)}
                            </span>
                          </div>

                          <div className={styles.teacherMetrics}>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Активные проекты</div>
                              <div className={styles.metricValue}>
                                <img src={FileIcon} className={styles.metricIcon} />
                                {t.activeProjects}
                              </div>
                            </div>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Всего проектов</div>
                              <div className={styles.metricValue}>
                                <img src={FileIcon} className={styles.metricIcon} />
                                {t.totalProjects}
                              </div>
                            </div>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Студенты</div>
                              <div className={styles.metricValue}>
                                <img src={PeopleIcon} className={styles.metricIcon} />
                                {t.students}
                              </div>
                            </div>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Завершенность</div>
                              <div className={styles.metricValue}>
                                <span className={styles.metricDotRed} />
                                {t.completion}%
                              </div>
                            </div>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Ср. оценка</div>
                              <div className={styles.metricValue}>
                                <img src={AwardIcon} className={styles.metricIcon} />
                                {t.avgGrade.toFixed(1)}
                              </div>
                            </div>
                            <div className={styles.metric}>
                              <div className={styles.metricLabel}>Публикации</div>
                              <div className={styles.metricValue}>
                                <img src={AwardIcon} className={styles.metricIcon} />
                                {t.publications}
                              </div>
                            </div>
                          </div>

                          <div className={styles.progressWrap}>
                            <div className={styles.progressLabel}>Прогресс завершения проектов</div>
                            <div className={styles.progressBar}>
                              <div className={styles.progressFill} style={{ width: `${t.completion}%` }} />
                            </div>
                            <div className={styles.progressPct}>{t.completion}%</div>
                          </div>
                        </div>

                        <button type="button" className={styles.detailsBtn} onClick={() => setSelectedId(t.id)}>
                          <img src={EyeIcon} className={styles.detailsIcon} />
                          Подробнее
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selected && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modal}>
            <button type="button" className={styles.modalClose} onClick={closeModal}>
              <img src={CloseIcon} className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalTop}>
              <div className={styles.modalAvatar}>{initialsFromName(selected.name)}</div>
              <div>
                <div className={styles.modalName}>{selected.name}</div>
                <div className={styles.modalRole}>{selected.title}</div>
              </div>
            </div>

            <div className={styles.modalKpis}>
              <div className={styles.modalKpi}>
                <div className={styles.modalKpiValue}>{selected.rating.toFixed(1)}</div>
                <div className={styles.modalKpiLabel}>Рейтинг</div>
              </div>
              <div className={styles.modalKpi}>
                <div className={styles.modalKpiValue}>{selected.completion}%</div>
                <div className={styles.modalKpiLabel}>Завершенность</div>
              </div>
              <div className={styles.modalKpi}>
                <div className={styles.modalKpiValue}>{selected.hours}</div>
                <div className={styles.modalKpiLabel}>Часов работы</div>
              </div>
              <div className={styles.modalKpi}>
                <div className={styles.modalKpiValue}>{selected.consultations}</div>
                <div className={styles.modalKpiLabel}>Консультаций</div>
              </div>
            </div>

            <div className={styles.modalCard}>
              <div className={styles.modalCardTitle}>Активность за последние 6 месяцев</div>
              <div className={styles.modalChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selected.activity} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} />
                    <Line type="monotone" dataKey="consultations" stroke="#22c55e" strokeWidth={3} dot={{ r: 3, fill: '#22c55e' }} />
                    <Line type="monotone" dataKey="projects" stroke="#3a76f0" strokeWidth={3} dot={{ r: 3, fill: '#3a76f0' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.modalLegend}>
                <div className={styles.modalLegendItem}>
                  <span className={styles.modalLegendDot} style={{ background: '#22c55e' }} /> Консультации
                </div>
                <div className={styles.modalLegendItem}>
                  <span className={styles.modalLegendDot} style={{ background: '#3a76f0' }} /> Проекты
                </div>
              </div>
            </div>

            <div className={styles.modalCard}>
              <div className={styles.modalCardTitle}>Успеваемость студентов</div>
              <div className={styles.modalChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selected.success} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6a7282', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {selected.success.map((s, idx) => (
                        <Cell key={s.name} fill={successColors[idx % successColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.modalBottomGrid}>
              <div className={styles.modalMiniCard}>
                <div className={styles.modalMiniTitle}>Научная деятельность</div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Публикации:</div>
                  <div className={styles.modalMiniValue}>{selected.scienceStats.publications}</div>
                </div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Гранты:</div>
                  <div className={styles.modalMiniValue}>{selected.scienceStats.grants}</div>
                </div>
              </div>
              <div className={styles.modalMiniCard}>
                <div className={styles.modalMiniTitle}>Проекты</div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Активные:</div>
                  <div className={styles.modalMiniValue}>{selected.projectsStats.active}</div>
                </div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Завершенные:</div>
                  <div className={styles.modalMiniValue}>{selected.projectsStats.done}</div>
                </div>
              </div>
              <div className={styles.modalMiniCard}>
                <div className={styles.modalMiniTitle}>Студенты</div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Всего:</div>
                  <div className={styles.modalMiniValue}>{selected.studentsStats.total}</div>
                </div>
                <div className={styles.modalMiniRow}>
                  <div className={styles.modalMiniLabel}>Активные:</div>
                  <div className={styles.modalMiniValue}>{selected.studentsStats.active}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;

