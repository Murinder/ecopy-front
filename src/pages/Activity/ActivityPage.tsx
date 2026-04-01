import { useMemo, useState } from 'react';
import styles from './ActivityPage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../app/hooks';
import { useGetDashboardSummaryQuery } from '../../services/coreApi';

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

type HeadAnalyticsTabKey = 'performance' | 'activity' | 'science';

const TeacherActivityView = ({ avatarInitials }: { avatarInitials: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: dashboardData } = useGetDashboardSummaryQuery(userId ?? '', { skip: !userId });

  const kpis = useMemo<TeacherKpiItem[]>(() => {
    if (dashboardData?.success && dashboardData.data.kpis) {
      const iconMap: Record<string, string> = { blue: FileIcon, purple: PeopleIcon, green: EyeIcon, orange: ChatIcon };
      return dashboardData.data.kpis.map((k) => ({
        label: k.label,
        value: k.value,
        delta: k.delta || '',
        icon: iconMap[k.iconTone] || FileIcon,
        iconTone: (k.iconTone as TeacherKpiItem['iconTone']) || 'blue',
      }));
    }
    return [];
  }, [dashboardData]);

  const kpiIconWrapClass = (tone: TeacherKpiItem['iconTone']) =>
    tone === 'blue'
      ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconBlue}`
      : tone === 'purple'
        ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconPurple}`
        : tone === 'green'
          ? `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconGreen}`
          : `${styles.teacherKpiIconWrap} ${styles.teacherKpiIconOrange}`;

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
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            {kpis.length > 0 ? (
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
            ) : (
              <p className={styles.empty}>Нет данных</p>
            )}

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активность по проектам</div>
                  <div className={styles.cardSubtitle}>Динамика выполнения задач за последний месяц</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Прогресс студентов</div>
                  <div className={styles.cardSubtitle}>Средняя успеваемость</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.teacherListHeader}>
                  <div>
                    <div className={styles.cardTitle}>Последняя активность</div>
                    <div className={styles.cardSubtitle}>События по курируемым проектам</div>
                  </div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>

              <div className={styles.card}>
                <div className={styles.teacherCardHeaderCol}>
                  <div className={styles.cardTitle}>Активные студенты</div>
                  <div className={styles.cardSubtitle}>Топ по выполненным задачам</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.teacherCardHeaderCol}>
                <div className={styles.cardTitle}>Проекты требующие внимания</div>
                <div className={styles.cardSubtitle}>Проекты с задержками или низкой активностью</div>
              </div>
              <p className={styles.empty}>Нет данных</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentActivityView = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

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
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.kpiGrid}>
              <p className={styles.empty}>Нет данных</p>
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
                <p className={styles.empty}>Нет данных</p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Распределение времени</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Динамика прогресса</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Последняя активность</div>
                </div>
                <p className={styles.empty}>Нет данных</p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Успеваемость по предметам</div>
                <div className={styles.cardSubtitle}>Оценки и посещаемость</div>
              </div>
              <p className={styles.empty}>Нет данных</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeadAnalyticsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [tab, setTab] = useState<HeadAnalyticsTabKey>('performance');

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
                <img src={BellIcon} style={{ width: 16, height: 16, position: 'absolute', top: 10, left: 10 }} />
              </div>
              <div className={styles.avatarSmall}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.headKpiGrid}>
              <p className={styles.empty}>Нет данных</p>
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
                    <p className={styles.empty}>Нет данных</p>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Студенты по курсам</div>
                        <div className={styles.cardSubtitle}>Распределение</div>
                      </div>
                    </div>
                    <p className={styles.empty}>Нет данных</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                    <div>
                      <div className={styles.cardTitle}>Динамика по семестрам</div>
                      <div className={styles.cardSubtitle}>Средний балл, процент выпускников</div>
                    </div>
                  </div>
                  <p className={styles.empty}>Нет данных</p>
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
                  <p className={styles.empty}>Нет данных</p>
                </div>

                <div className={styles.headThreeGrid}>
                  <p className={styles.empty}>Нет данных</p>
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
                    <p className={styles.empty}>Нет данных</p>
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHeader} style={{ justifyContent: 'flex-start' }}>
                      <div>
                        <div className={styles.cardTitle}>Итоги года</div>
                        <div className={styles.cardSubtitle}>Научные достижения</div>
                      </div>
                    </div>
                    <p className={styles.empty}>Нет данных</p>
                  </div>
                </div>

                <div className={styles.headThreeGrid}>
                  <p className={styles.empty}>Нет данных</p>
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
