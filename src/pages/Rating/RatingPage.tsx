import { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import styles from './RatingPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import AwardIcon from '../../assets/icons/ui-award.svg';
import BoltIcon from '../../assets/icons/ui-bolt.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import { useAppSelector } from '../../app/hooks';
import {
  useGetStudentRatingQuery,
  useGetRatingBreakdownQuery,
  useGetComparisonQuery,
  useGetAchievementsQuery,
  useGetLeaderboardQuery,
} from '../../services/ratingApi';

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Успеваемость',
  activity: 'Активность',
  achievements: 'Достижения',
};

const BAR_COLORS = ['#4318FF', '#6C5DD3', '#868CFF', '#A8C5FF'];

const RatingPage = () => {
  const userId = useAppSelector((s) => s.auth.userId) || '';
  const userName = useAppSelector((s) => s.auth.userName) || '';

  const { data: myRatingResp, isLoading: ratingLoading, isError: ratingError } =
    useGetStudentRatingQuery(userId, { skip: !userId });
  const { data: breakdownResp, isError: breakdownError } = useGetRatingBreakdownQuery(userId, { skip: !userId });
  const { data: comparisonResp, isError: comparisonError } = useGetComparisonQuery(userId, { skip: !userId });
  const { data: achievementsResp, isError: achievementsError } = useGetAchievementsQuery(userId, { skip: !userId });
  const { data: leaderboardResp, isError: leaderboardError } = useGetLeaderboardQuery(
    { userId, limit: 10 },
    { skip: !userId },
  );

  const myRating = myRatingResp?.data;
  const breakdown = breakdownResp?.data;
  const comparison = comparisonResp?.data;
  const achievements = achievementsResp?.data;
  const leaderboard = leaderboardResp?.data;

  const totalScore = myRating?.totalScore ?? 0;
  const scoreRounded = Math.round(totalScore);

  const myRank = leaderboard?.userRank ?? null;
  const totalStudents = leaderboard?.totalStudents ?? 0;

  const leaders = useMemo(() => {
    if (!leaderboard?.topStudents || leaderboard.topStudents.length === 0) {
      return [];
    }
    const top: Array<{ rank: number; name: string; score: number; you: boolean; separator?: boolean }> =
      leaderboard.topStudents.map((s, i) => ({
        rank: i + 1,
        name: s.userName ?? `Студент ${s.userId.slice(0, 4)}`,
        score: Math.round(s.totalScore),
        you: s.userId === userId,
      }));
    const meInTop = top.some((l) => l.you);
    if (!meInTop && myRank) {
      top.push({ rank: 0, name: '...', score: 0, you: false, separator: true });
      top.push({
        rank: myRank,
        name: userName ? `${userName} (Вы)` : 'Вы',
        score: scoreRounded,
        you: true,
      });
    }
    return top;
  }, [leaderboard, userId, userName, scoreRounded, myRank]);

  const statusLabel =
    myRating?.verificationStatus === 'VERIFIED' ? 'Подтверждён'
    : myRating?.verificationStatus === 'REJECTED' ? 'Отклонён'
    : 'На проверке';

  const monthGrowthLabel = breakdown?.monthGrowth != null
    ? `${breakdown.monthGrowth >= 0 ? '+' : ''}${Math.round(breakdown.monthGrowth)} баллов`
    : '—';

  const levelLabel = scoreRounded >= 90 ? 'Отлично'
    : scoreRounded >= 70 ? 'Хорошо'
    : scoreRounded >= 50 ? 'Удовлетворительно'
    : 'Нужно улучшить';

  const radarData = useMemo(() => {
    if (!breakdown) return [];
    return [
      { subject: 'Академичность', value: breakdown.academicScore },
      { subject: 'Активность', value: breakdown.activityScore },
      { subject: 'Достижения', value: breakdown.achievementsScore },
      { subject: 'Лидерство', value: breakdown.leadershipScore ?? 0 },
      { subject: 'Проекты', value: breakdown.projectsScore ?? 0 },
      { subject: 'Инновации', value: breakdown.innovationScore ?? 0 },
    ];
  }, [breakdown]);

  const barData = useMemo(() => {
    if (!comparison) return [];
    return [
      { name: 'Я', value: Math.round(comparison.userTotal) },
      { name: 'Группа', value: Math.round(comparison.groupAvg ?? 0) },
      { name: 'Кафедра', value: Math.round(comparison.departmentAvg ?? 0) },
      { name: 'Факультет', value: Math.round(comparison.facultyAvg ?? 0) },
    ];
  }, [comparison]);

  const initialsFrom = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? 'И').toUpperCase();
  };

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDash = (ringCircumference * scoreRounded) / 100;

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Мой рейтинг</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatar}>
              {initialsFrom(userName)}
            </div>
          </div>
        </div>

        <div className={styles.main}>
          {ratingLoading && <p className={styles.loading}>Загрузка...</p>}
          {ratingError && <p className={styles.error}>Ошибка загрузки данных</p>}

          {/* ── Hero ── */}
          <div className={styles.hero}>
            <div className={styles.ringWrap}>
              <svg className={styles.ring} viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#05CD99" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r={ringRadius} stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  stroke="url(#ringGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${ringCircumference}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.ringText}>
                <div className={styles.ringValue}>{scoreRounded}</div>
                <div className={styles.ringSub}>Общий рейтинг</div>
              </div>
              <div className={styles.levelLabel}>{levelLabel}</div>
            </div>
            <div>
              <div className={styles.heroTitle}>Общий рейтинг</div>
              <div className={styles.heroDesc}>
                Вы находитесь в топ {totalStudents > 0 && myRank ? Math.max(1, Math.ceil((myRank / totalStudents) * 100)) : '—'}% студентов университета
              </div>
              <div className={styles.heroStats}>
                <div>
                  <div className={styles.heroStatLabel}>Место в рейтинге</div>
                  <div className={styles.heroStatValue}>#{myRank ?? '—'} из {totalStudents}</div>
                </div>
                <div>
                  <div className={styles.heroStatLabel}>Рост за месяц</div>
                  <div className={styles.heroStatValue}>{monthGrowthLabel}</div>
                </div>
                <div>
                  <div className={styles.heroStatLabel}>Статус</div>
                  <div className={styles.statusPill}>
                    <img src={AwardIcon} alt="" width={14} height={14} />
                    {statusLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3 Metric Cards ── */}
          <div className={styles.grid3}>
            {([
              { key: 'academic', label: 'Успеваемость', hint: 'Средний балл по всем предметам', icon: AwardIcon, iconClass: styles.metricIconBlue, color: '#4318FF', score: breakdown?.academicScore },
              { key: 'activity', label: 'Активность', hint: 'Участие в проектах и мероприятиях', icon: BoltIcon, iconClass: styles.metricIconOrange, color: '#FFB547', score: breakdown?.activityScore },
              { key: 'achievements', label: 'Достижения', hint: 'Ваши достижения и портфолио', icon: ChatIcon, iconClass: styles.metricIconPurple, color: '#868CFF', score: breakdown?.achievementsScore },
            ] as const).map((cat) => {
              const subs = breakdown?.subParameters?.[cat.key] ?? [];
              return (
                <div key={cat.key} className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={`${styles.metricIcon} ${cat.iconClass}`}>
                      <img src={cat.icon} alt="" width={20} height={20} />
                    </div>
                    <div className={styles.cardScoreLabel}>
                      {cat.score != null ? `${Math.round(cat.score)} из 100` : '— из 100'}
                    </div>
                  </div>
                  <div className={styles.metricTitle}>{cat.label}</div>
                  <div className={styles.metricHint}>{cat.hint}</div>
                  {cat.score != null ? (
                    <div className={styles.metricBar}>
                      <div className={styles.metricBarFill} style={{ width: `${Math.round(cat.score)}%`, background: cat.color }} />
                    </div>
                  ) : (
                    <p className={styles.empty}>Нет данных</p>
                  )}
                  {subs.length > 0 && (
                    <div className={styles.subParams}>
                      {subs.map((s) => (
                        <div key={s.name} className={styles.subParamRow}>
                          <span className={styles.subParamName}>{s.name}</span>
                          <span className={styles.subParamValue}>+{Math.round(s.score)} ({s.count})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Charts: Radar + Bar ── */}
          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Профиль навыков</div>
              <div className={styles.cardSub}>Ваши навыки и способности</div>
              {breakdownError ? (
                <p className={styles.error}>Ошибка загрузки данных</p>
              ) : radarData.length > 0 ? (
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#4318FF" fill="#4318FF" fillOpacity={0.2} dot={{ r: 3, fill: '#4318FF' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Сравнение с другими</div>
              <div className={styles.cardSub}>Ваши результаты относительно других студентов</div>
              {comparisonError ? (
                <p className={styles.error}>Ошибка загрузки данных</p>
              ) : barData.length > 0 ? (
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={56}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#1B2559' }}
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
              <div className={styles.legendRow}>
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#4318FF' }} /> Я</div>
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#6C5DD3' }} /> Группа</div>
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#868CFF' }} /> Кафедра</div>
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#A8C5FF' }} /> Факультет</div>
              </div>
            </div>
          </div>

          {/* ── Achievements (full width) ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Достижения</div>
            <div className={styles.cardSub}>Ваши награды и успехи</div>
            {achievementsError ? (
              <p className={styles.error}>Ошибка загрузки достижений</p>
            ) : achievements && achievements.length > 0 ? (
              <div className={styles.achGrid}>
                {achievements.map((a) => (
                  <div key={a.id} className={`${styles.achCard} ${styles.achCardActive}`}>
                    <div className={styles.achIcon}>
                      <img
                        src={a.category === 'activity' ? BoltIcon : a.category === 'achievements' ? ChatIcon : AwardIcon}
                        alt=""
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <div className={styles.achName}>{a.title}</div>
                      <div className={styles.achDesc}>{a.description}</div>
                      <div className={styles.achMeta}>
                        +{Math.round(a.score)} баллов
                        {a.earnedAt ? ` \u00b7 ${new Date(a.earnedAt).toLocaleDateString('ru-RU')}` : ''}
                        {' \u00b7 '}{CATEGORY_LABELS[a.category] ?? a.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Нет данных</p>
            )}
          </div>

          {/* ── Leaderboard (full width) ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Таблица лидеров</div>
            <div className={styles.cardSub}>Топ студентов по рейтингу</div>
            <div className={styles.leaders}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderLeft}>
                  <span>Позиция</span>
                  <span>Имя</span>
                </div>
                <span>Рейтинг</span>
              </div>
              {leaderboardError && <p className={styles.error}>Ошибка загрузки рейтинга</p>}
              {!leaderboardError && leaders.length === 0 && <p className={styles.empty}>Нет данных</p>}
              {leaders.map((l) =>
                l.separator ? (
                  <div key="separator" className={styles.separatorRow}>···</div>
                ) : (
                  <div
                    key={`${l.rank}-${l.name}`}
                    className={`${styles.leaderRow} ${l.you ? styles.youRow : ''}`}
                  >
                    <div className={styles.leaderLeft}>
                      <div
                        className={`${styles.rank} ${
                          l.rank === 1 ? styles.rank1
                          : l.rank === 2 ? styles.rank2
                          : l.rank === 3 ? styles.rank3
                          : styles.rankDefault
                        }`}
                      >
                        {l.rank}
                      </div>
                      <div className={styles.leaderAvatar}>{initialsFrom(l.name)}</div>
                      <div className={styles.leaderName}>{l.name}</div>
                    </div>
                    <div className={styles.leaderScore}>{l.score}</div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;
