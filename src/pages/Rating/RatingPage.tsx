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
  useGetTopStudentsQuery,
  useGetRatingBreakdownQuery,
  useGetComparisonQuery,
  useGetAchievementsQuery,
} from '../../services/ratingApi';

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Успеваемость',
  activity: 'Активность',
  communication: 'Коммуникация',
};

const BAR_COLORS = ['#4318FF', '#868CFF'];

const RatingPage = () => {
  const userId = useAppSelector((s) => s.auth.userId) || '';
  const userName = useAppSelector((s) => s.auth.userName) || '';

  const { data: myRatingResp, isLoading: ratingLoading, isError: ratingError } =
    useGetStudentRatingQuery(userId, { skip: !userId });
  const { data: topStudentsResp } = useGetTopStudentsQuery(100);
  const { data: breakdownResp } = useGetRatingBreakdownQuery(userId, { skip: !userId });
  const { data: comparisonResp } = useGetComparisonQuery(userId, { skip: !userId });
  const { data: achievementsResp } = useGetAchievementsQuery(userId, { skip: !userId });

  const myRating = myRatingResp?.data;
  const topStudents = topStudentsResp?.data;
  const breakdown = breakdownResp?.data;
  const comparison = comparisonResp?.data;
  const achievements = achievementsResp?.data;

  const totalScore = myRating?.totalScore ?? 0;
  const scoreRounded = Math.round(totalScore);

  const myRank = useMemo(() => {
    if (!topStudents || !userId) return null;
    const idx = topStudents.findIndex((s) => s.userId === userId);
    return idx >= 0 ? idx + 1 : null;
  }, [topStudents, userId]);

  const totalStudents = topStudents?.length ?? 0;

  const leaders = useMemo(() => {
    if (!topStudents || topStudents.length === 0) {
      return [];
    }
    const top = topStudents.slice(0, 10).map((s, i) => ({
      rank: i + 1,
      name: s.userName ?? `Студент ${s.userId.slice(0, 4)}`,
      score: Math.round(s.totalScore),
      you: s.userId === userId,
    }));
    const meInTop = top.some((l) => l.you);
    if (!meInTop && myRank) {
      top.push({
        rank: myRank,
        name: userName ? `${userName} (Вы)` : 'Вы',
        score: scoreRounded,
        you: true,
      });
    }
    return top;
  }, [topStudents, userId, userName, scoreRounded, myRank]);

  const statusLabel =
    myRating?.verificationStatus === 'VERIFIED' ? 'Подтверждён'
    : myRating?.verificationStatus === 'REJECTED' ? 'Отклонён'
    : 'На проверке';

  const monthGrowthLabel = breakdown?.monthGrowth != null
    ? `${breakdown.monthGrowth >= 0 ? '+' : ''}${Math.round(breakdown.monthGrowth)}`
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
      { subject: 'Коммуникация', value: breakdown.communicationScore },
      { subject: 'Лидерство', value: Math.round((breakdown.activityScore + breakdown.communicationScore) / 2) },
      { subject: 'Проекты', value: Math.round(breakdown.academicScore * 0.8) },
      { subject: 'Инновации', value: Math.round(breakdown.activityScore * 0.7) },
    ];
  }, [breakdown]);

  const barData = useMemo(() => {
    if (!comparison) return [];
    return [
      { name: 'Вы', value: Math.round(comparison.userTotal) },
      { name: 'Среднее', value: Math.round(comparison.avgTotal) },
    ];
  }, [comparison]);

  const initialsFrom = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? '?').toUpperCase();
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
              {userName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'ИИ'}
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
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconBlue}`}>
                  <img src={AwardIcon} alt="" width={20} height={20} />
                </div>
                <div className={styles.cardScoreLabel}>
                  {breakdown ? `${Math.round(breakdown.academicScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Успеваемость</div>
              <div className={styles.metricHint}>Средний балл по всем предметам</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.academicScore)}%`, background: '#4318FF' }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconOrange}`}>
                  <img src={BoltIcon} alt="" width={20} height={20} />
                </div>
                <div className={styles.cardScoreLabel}>
                  {breakdown ? `${Math.round(breakdown.activityScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Активность</div>
              <div className={styles.metricHint}>Участие в проектах и мероприятиях</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.activityScore)}%`, background: '#FFB547' }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconPurple}`}>
                  <img src={ChatIcon} alt="" width={20} height={20} />
                </div>
                <div className={styles.cardScoreLabel}>
                  {breakdown ? `${Math.round(breakdown.communicationScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Коммуникация</div>
              <div className={styles.metricHint}>Взаимодействие с командой и сообществом</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.communicationScore)}%`, background: '#868CFF' }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>
          </div>

          {/* ── Charts: Radar + Bar ── */}
          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Профиль навыков</div>
              <div className={styles.cardSub}>Ваши навыки и способности</div>
              {radarData.length > 0 ? (
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
              {barData.length > 0 ? (
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
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#4318FF' }} /> Вы</div>
                <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#868CFF' }} /> Среднее</div>
              </div>
            </div>
          </div>

          {/* ── Achievements (full width) ── */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Достижения</div>
            <div className={styles.cardSub}>Ваши награды и успехи</div>
            {achievements && achievements.length > 0 ? (
              <div className={styles.achGrid}>
                {achievements.map((a) => (
                  <div key={a.id} className={`${styles.achCard} ${styles.achCardActive}`}>
                    <div className={styles.achIcon}>
                      <img
                        src={a.category === 'activity' ? BoltIcon : a.category === 'communication' ? ChatIcon : AwardIcon}
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
              {leaders.length === 0 && <p className={styles.empty}>Нет данных</p>}
              {leaders.map((l) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;
