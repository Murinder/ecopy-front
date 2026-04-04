import { useMemo, useState } from 'react';
import styles from './ActivityPage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../app/hooks';
import { useGetDashboardSummaryQuery, useGetProfileQuery } from '../../services/coreApi';
import type { KpiItem, ActivityItem, StudentItem, AttentionProject, SimpleKpi, PieSlice, ActivityLogItem, SubjectItem, GroupPerformance } from '../../services/coreApi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

type HeadAnalyticsTabKey = 'performance' | 'activity' | 'science';

const iconMap: Record<string, string> = { blue: FileIcon, purple: PeopleIcon, green: EyeIcon, orange: ChatIcon };

const kpiIconWrapClass = (tone: string) =>
  tone === 'blue'
    ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconBlue}`
    : tone === 'purple'
      ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconPurple}`
      : tone === 'green'
        ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconGreen}`
        : `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconOrange}`;

const dotClass = (tone: string) => {
  const map: Record<string, string> = {
    blue: styles.teacherDotBlue,
    purple: styles.teacherDotPurple,
    green: styles.teacherDotGreen,
    orange: styles.teacherDotOrange,
  };
  return `${styles.teacherActivityDot} ${map[tone] || styles.teacherDotBlue}`;
};

const pillClass = (tone: string) => {
  if (tone === 'red') return `${styles.teacherProjectPill} ${styles.teacherPillUrgent}`;
  if (tone === 'orange' || tone === 'yellow') return `${styles.teacherProjectPill} ${styles.teacherPillAttention}`;
  return `${styles.teacherProjectPill} ${styles.teacherPillLow}`;
};

// ==================== TEACHER VIEW ====================

const TeacherActivityView = ({ avatarInitials }: { avatarInitials: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: dashboardData } = useGetDashboardSummaryQuery(userId ?? '', { skip: !userId });
  const d = dashboardData?.success ? dashboardData.data : undefined;

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
                <NotificationBell iconSrc={BellIcon} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            {/* KPI Cards */}
            {d?.kpis?.length ? (
              <div className={styles.teacherKpiGrid}>
                {d.kpis.map((k: KpiItem) => (
                  <div key={k.label} className={styles.teacherKpiCard}>
                    <div className={styles.teacherKpiTop}>
                      <div className={kpiIconWrapClass(k.iconTone)}>
                        <img src={iconMap[k.iconTone] || FileIcon} className={styles.teacherKpiIcon} />
                      </div>
                      {k.delta && <div className={styles.teacherKpiDelta}>{k.delta}</div>}
                    </div>
                    <div className={styles.teacherKpiValue}>{k.value}</div>
                    <div className={styles.teacherKpiLabel}>{k.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Нет данных</p>
            )}

            {/* Charts Row 1: Weekly Activity + Student Progress */}
            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активность по проектам</div>
                  <div className={styles.cardSubtitle}>Динамика выполнения задач за последний месяц</div>
                </div>
                {d?.weeklyChart?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.weeklyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="created" fill="#3a76f0" name="Создано" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="done" fill="#22c55e" name="Завершено" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Прогресс студентов</div>
                  <div className={styles.cardSubtitle}>Средняя успеваемость</div>
                </div>
                {d?.studentProgress?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.studentProgress} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number | undefined) => `${v ?? 0}%`} />
                      <Bar dataKey="value" fill="#3a76f0" name="Прогресс" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>
            </div>

            {/* Charts Row 2: Last Activity + Active Students */}
            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherListHeader}>
                  <div>
                    <div className={styles.cardTitle}>Последняя активность</div>
                    <div className={styles.cardSubtitle}>События по курируемым проектам</div>
                  </div>
                </div>
                {d?.lastActivity?.length ? (
                  <div className={styles.teacherActivityList}>
                    {d.lastActivity.map((a: ActivityItem) => (
                      <div key={a.id} className={styles.teacherActivityItem}>
                        <div className={styles.teacherActivityLeft}>
                          <div className={styles.teacherActivityAvatar}>{a.initials}</div>
                          <div className={styles.teacherActivityText}>
                            <span className={styles.teacherActivityName}>{a.actionTitle}</span>
                            <span className={styles.teacherActivitySub}>
                              <span className={dotClass(a.tone)} />
                              <span className={styles.teacherActivityProject}>{a.actionSub}</span>
                            </span>
                          </div>
                        </div>
                        <span className={styles.teacherActivityTime}>{a.timeAgo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активные студенты</div>
                  <div className={styles.cardSubtitle}>Топ по выполненным задачам</div>
                </div>
                {d?.activeStudents?.length ? (
                  <div className={styles.teacherStudentsList}>
                    {d.activeStudents.map((s: StudentItem) => {
                      const pct = s.tasksTotal > 0 ? Math.round((s.tasksDone / s.tasksTotal) * 100) : 0;
                      return (
                        <div key={s.id} className={styles.teacherStudentRow}>
                          <div className={styles.teacherStudentTop}>
                            <div className={styles.teacherStudentAvatar}>{s.initials}</div>
                            <div className={styles.teacherStudentMain}>
                              <span className={styles.teacherStudentName}>{s.name}</span>
                              <span className={styles.teacherStudentProject}>{s.project}</span>
                            </div>
                            <div className={styles.teacherStudentMetaRight}>
                              <span className={styles.teacherStudentTasks}>{s.tasksDone}/{s.tasksTotal}</span>
                              <span className={styles.teacherStudentPct}>{pct}%</span>
                            </div>
                          </div>
                          <div className={styles.teacherProgressBar}>
                            <div className={styles.teacherProgressFill} style={{ width: `${pct}%` }} />
                          </div>
                          {s.lastActive && <span className={styles.teacherStudentLast}>{s.lastActive}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>
            </div>

            {/* Attention Projects */}
            <div className={styles.card}>
              <div className={styles.teacherCardHeaderCol}>
                <div className={styles.cardTitle}>Проекты требующие внимания</div>
                <div className={styles.cardSubtitle}>Проекты с задержками или низкой активностью</div>
              </div>
              {d?.attentionProjects?.length ? (
                <div className={styles.teacherProjectsGrid}>
                  {d.attentionProjects.map((p: AttentionProject) => (
                    <div key={p.id} className={styles.teacherProjectCard}>
                      <div className={styles.teacherProjectTop}>
                        <span className={styles.teacherProjectTitle}>{p.title}</span>
                        <span className={pillClass(p.issueTone)}>{p.statusLabel}</span>
                      </div>
                      <span className={styles.teacherProjectMembers}>{p.members}</span>
                      <span className={`${styles.teacherProjectIssue} ${p.issueTone === 'red' ? styles.teacherIssueRed : styles.teacherIssueGray}`}>
                        {p.issue}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STUDENT VIEW ====================

const STATUS_LABELS: Record<string, string> = {
  gray: 'Информация',
  green: 'Успешно',
  red: 'Ошибка',
  yellow: 'В ожидании',
  blue: 'В работе',
};

const STATUS_COLORS: Record<string, string> = {
  gray: '#6b7280',
  green: '#16a34a',
  red: '#dc2626',
  yellow: '#d97706',
  blue: '#2563eb',
};

const formatActivityDate = (date: string) => {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const StudentActivityView = ({ avatarInitials }: { avatarInitials: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: dashboardData } = useGetDashboardSummaryQuery(userId ?? '', { skip: !userId });
  const d = dashboardData?.success ? dashboardData.data : undefined;

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
                <NotificationBell iconSrc={BellIcon} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            {/* Student KPI Grid */}
            {d?.studentKpis?.length ? (
              <div className={styles.kpiGrid}>
                {d.studentKpis.map((k: SimpleKpi) => (
                  <div key={k.title} className={styles.kpiCard}>
                    <span className={styles.kpiTitle}>{k.title}</span>
                    <span className={styles.kpiValue}>{k.value}</span>
                    {k.sub && <span className={styles.kpiSub}>{k.sub}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.kpiGrid}>
                <p className={styles.empty}>Нет данных</p>
              </div>
            )}

            {/* Charts Row 1: Monthly Activity + Time Distribution */}
            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Ежемесячная активность</div>
                  <div className={styles.cardSubtitle}>Выполненные задачи за последние 6 месяцев</div>
                </div>
                {d?.barData?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3a76f0" name="Задачи" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Распределение времени</div>
                </div>
                {d?.pieData?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={d.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {d.pieData.map((entry: PieSlice, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>
            </div>

            {/* Charts Row 2: Progress Dynamics + Last Activity */}
            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Динамика прогресса</div>
                </div>
                {d?.barData?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={d.barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3a76f0" strokeWidth={2} dot={{ r: 4 }} name="Задачи" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Последняя активность</div>
                </div>
                {d?.activities?.length ? (
                  <div className={styles.list}>
                    {d.activities.map((a: ActivityLogItem, i: number) => (
                      <div key={i} className={styles.listItem}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0a0a0a' }}>{a.user}</div>
                          <div style={{ fontSize: 13, color: '#6a7282' }}>{a.action}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#6a7282' }}>{formatActivityDate(a.date)}</div>
                          <span className={styles.statusBadge} style={{ color: STATUS_COLORS[a.status] || '#6b7280' }}>
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>Нет данных</p>
                )}
              </div>
            </div>

            {/* Subjects Performance */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Успеваемость по предметам</div>
                <div className={styles.cardSubtitle}>Оценки и посещаемость</div>
              </div>
              {d?.subjectsData?.length ? (
                <table className={styles.simpleTable}>
                  <thead>
                    <tr>
                      <th>Предмет</th>
                      <th>Оценка</th>
                      <th>Посещаемость</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.subjectsData.map((s: SubjectItem) => (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td>{s.grade}%</td>
                        <td>{s.attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== HEAD VIEW ====================

const HeadAnalyticsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [tab, setTab] = useState<HeadAnalyticsTabKey>('performance');
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: dashboardData } = useGetDashboardSummaryQuery(userId ?? '', { skip: !userId });
  const { data: profileData } = useGetProfileQuery(userId ?? '', { skip: !userId });
  const d = dashboardData?.success ? dashboardData.data : undefined;
  const departmentName = profileData?.data?.departmentName || 'Кафедра';

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Аналитика</div>
              <div className={styles.subtitle}>{departmentName}</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <NotificationBell iconSrc={BellIcon} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            {/* Head KPI Grid */}
            {d?.headKpis?.length ? (
              <div className={styles.headKpiGrid}>
                {d.headKpis.map((k: KpiItem) => (
                  <div key={k.label} className={styles.headKpiCard}>
                    <div className={styles.headKpiTop}>
                      <div className={kpiIconWrapClass(k.iconTone)}>
                        <img src={iconMap[k.iconTone] || FileIcon} className={styles.headKpiIcon} />
                      </div>
                      {k.delta && <div className={styles.headDeltaChip}>{k.delta}</div>}
                    </div>
                    <div className={styles.headKpiValue}>{k.value}</div>
                    <div className={styles.headKpiLabel}>{k.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.headKpiGrid}>
                <p className={styles.empty}>Нет данных</p>
              </div>
            )}

            {/* Tabs */}
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

            {/* Performance Tab */}
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
                    {d?.performanceByGroup?.length ? (
                      <table className={styles.simpleTable}>
                        <thead>
                          <tr>
                            <th>Группа</th>
                            <th>Активность</th>
                            <th>Посещаемость</th>
                            <th>Ср. балл</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.performanceByGroup.map((g: GroupPerformance) => (
                            <tr key={g.name}>
                              <td>{g.name}</td>
                              <td>{g.activity}%</td>
                              <td>{g.attendance}%</td>
                              <td>{g.avgGrade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={styles.empty}>Нет данных</p>
                    )}
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Студенты по курсам</div>
                        <div className={styles.cardSubtitle}>Распределение</div>
                      </div>
                    </div>
                    {d?.studentsByCourse?.length ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={d.studentsByCourse} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                            {d.studentsByCourse.map((entry: PieSlice, i: number) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className={styles.empty}>Нет данных</p>
                    )}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                    <div>
                      <div className={styles.cardTitle}>Динамика по семестрам</div>
                      <div className={styles.cardSubtitle}>Средний балл, процент выпускников</div>
                    </div>
                  </div>
                  {d?.semesters?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={d.semesters}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgGrade" stroke="#3a76f0" strokeWidth={2} name="Ср. балл" />
                        <Line type="monotone" dataKey="graduation" stroke="#22c55e" strokeWidth={2} name="% выпускников" />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className={styles.empty}>Нет данных</p>
                  )}
                </div>
              </>
            )}

            {/* Activity Tab */}
            {tab === 'activity' && (
              <>
                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                    <div>
                      <div className={styles.cardTitle}>Активность студентов по месяцам</div>
                      <div className={styles.cardSubtitle}>Проекты, мероприятия и публикации</div>
                    </div>
                  </div>
                  {d?.activityByMonth?.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={d.activityByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="projects" fill="#3a76f0" name="Проекты" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="events" fill="#22c55e" name="Мероприятия" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="publications" fill="#f59e0b" name="Публикации" radius={[4, 4, 0, 0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className={styles.empty}>Нет данных</p>
                  )}
                </div>

                <div className={styles.headThreeGrid}>
                  {d?.headKpis?.slice(0, 3).map((k: KpiItem, i: number) => {
                    const colors = [styles.headBigValueBlue, styles.headBigValueGreen, styles.headBigValueOrange];
                    return (
                      <div key={k.label} className={styles.headMiniCard}>
                        <span className={colors[i]}>{k.value}</span>
                        <span className={styles.headMiniLabel}>{k.label}</span>
                      </div>
                    );
                  }) ?? <p className={styles.empty}>Нет данных</p>}
                </div>
              </>
            )}

            {/* Science Tab */}
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
                    {d?.activityByMonth?.length ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={d.activityByMonth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="publications" fill="#8b5cf6" name="Публикации" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="projects" fill="#3a76f0" name="Проекты" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className={styles.empty}>Нет данных</p>
                    )}
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Итоги года</div>
                        <div className={styles.cardSubtitle}>Научные достижения</div>
                      </div>
                    </div>
                    {d?.headKpis?.length ? (
                      <div className={styles.headResultsList}>
                        {d.headKpis.map((k: KpiItem) => (
                          <div key={k.label} className={styles.headResultRow}>
                            <span className={styles.headResultLabel}>{k.label}</span>
                            <span className={styles.headResultValue}>{k.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.empty}>Нет данных</p>
                    )}
                  </div>
                </div>

                <div className={styles.headThreeGrid}>
                  {d?.headKpis?.slice(0, 3).map((k: KpiItem, i: number) => {
                    const colors = [styles.headBigValuePurple, styles.headBigValueBlue, styles.headBigValueGreen];
                    return (
                      <div key={`sci-${k.label}`} className={styles.headMiniCard}>
                        <span className={colors[i]}>{k.value}</span>
                        <span className={styles.headMiniLabel}>{k.label}</span>
                      </div>
                    );
                  }) ?? <p className={styles.empty}>Нет данных</p>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN ====================

const ActivityPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';

  return isHead ? <HeadAnalyticsView avatarInitials={initials} /> : isTeacher ? <TeacherActivityView avatarInitials={initials} /> : <StudentActivityView avatarInitials={initials} />;
};

export default ActivityPage;
