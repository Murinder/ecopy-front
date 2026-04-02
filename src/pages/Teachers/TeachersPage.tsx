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
import { useGetTeachersDetailedQuery } from '../../services/coreApi';
import type { TeacherDetailedDto } from '../../services/coreApi';
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

type SortKey = 'rating' | 'projects' | 'publications';


const TeachersPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Смирнов В.И.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const isHead = userRole === 'Заведующий кафедрой';

  const { data: teachersData, isLoading: teachersLoading, isError: teachersError } = useGetTeachersDetailedQuery();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const teachers = useMemo<TeacherDetailedDto[]>(() => {
    return teachersData?.data ?? [];
  }, [teachersData]);

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
                  {teachersLoading && <p className={styles.loading}>Загрузка...</p>}
                  {teachersError && <p className={styles.error}>Ошибка загрузки данных</p>}
                  {!teachersLoading && !teachersError && filtered.length === 0 && (
                    <p className={styles.empty}>Нет данных</p>
                  )}
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

