import { useMemo } from 'react';
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
    const top3 = topStudents.slice(0, 3).map((s, i) => ({
      rank: i + 1,
      name: s.userName ?? `Студент ${s.userId.slice(0, 4)}`,
      score: Math.round(s.totalScore),
      you: s.userId === userId,
    }));
    const meInTop = top3.some((l) => l.you);
    if (!meInTop && myRank) {
      top3.push({
        rank: myRank,
        name: userName ? `${userName} (Вы)` : 'Вы',
        score: scoreRounded,
        you: true,
      });
    }
    return top3;
  }, [topStudents, userId, userName, scoreRounded, myRank]);

  const statusLabel =
    myRating?.verificationStatus === 'VERIFIED' ? 'Подтверждён'
    : myRating?.verificationStatus === 'REJECTED' ? 'Отклонён'
    : 'На проверке';

  const monthGrowthLabel = breakdown?.monthGrowth != null
    ? `${breakdown.monthGrowth >= 0 ? '+' : ''}${Math.round(breakdown.monthGrowth)}`
    : '—';

  const initialsFrom = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? '?').toUpperCase();
  };

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
            <div className={styles.avatar}>{userName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'ИИ'}</div>
          </div>
        </div>

        <div className={styles.main}>
          {ratingLoading && <p className={styles.loading}>Загрузка...</p>}
          {ratingError && <p className={styles.error}>Ошибка загрузки данных</p>}
          <div className={styles.hero}>
            <div className={styles.ringWrap} style={{ position: 'relative' }}>
              <svg className={styles.ring} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" stroke="#ffffff33" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  stroke="#ffffff"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * 46 * scoreRounded) / 100} ${2 * Math.PI * 46}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.ringText}>
                <div className={styles.ringValue}>{scoreRounded}</div>
                <div className={styles.ringSub}>из 100</div>
              </div>
            </div>
            <div>
              <div className={styles.heroTitle}>Общий рейтинг</div>
              <div className={styles.heroDesc}>Вы находитесь в топ {totalStudents > 0 && myRank ? Math.max(1, Math.ceil((myRank / totalStudents) * 100)) : '—'}% студентов университета</div>
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
                    <img src={AwardIcon} style={{ width: 14, height: 14 }} />
                    {statusLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconBlue}`}>
                  <img src={AwardIcon} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ color: '#6a7282', fontSize: 12 }}>
                  {breakdown ? `${Math.round(breakdown.academicScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Успеваемость</div>
              <div className={styles.metricHint}>Средний балл по всем предметам</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.academicScore)}%` }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconOrange}`}>
                  <img src={BoltIcon} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ color: '#6a7282', fontSize: 12 }}>
                  {breakdown ? `${Math.round(breakdown.activityScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Активность</div>
              <div className={styles.metricHint}>Участие в проектах и мероприятиях</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.activityScore)}%` }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconPurple}`}>
                  <img src={ChatIcon} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ color: '#6a7282', fontSize: 12 }}>
                  {breakdown ? `${Math.round(breakdown.communicationScore)} из 100` : '— из 100'}
                </div>
              </div>
              <div className={styles.metricTitle}>Коммуникация</div>
              <div className={styles.metricHint}>Взаимодействие с командой и сообществом</div>
              {breakdown ? (
                <div className={styles.metricBar}>
                  <div className={styles.metricBarFill} style={{ width: `${Math.round(breakdown.communicationScore)}%` }} />
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Профиль компетенций</div>
              <div className={styles.cardSub}>Ваши навыки и способности</div>
              {breakdown ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  {([
                    { label: 'Успеваемость', value: breakdown.academicScore, color: '#3b82f6' },
                    { label: 'Активность', value: breakdown.activityScore, color: '#f97316' },
                    { label: 'Коммуникация', value: breakdown.communicationScore, color: '#a855f7' },
                  ] as const).map((item) => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: '#6a7282' }}>{Math.round(item.value)}%</span>
                      </div>
                      <div className={styles.metricBar}>
                        <div className={styles.metricBarFill} style={{ width: `${Math.round(item.value)}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Сравнение с другими</div>
              <div className={styles.cardSub}>Ваши результаты относительно других студентов</div>
              {comparison ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {([
                    { label: 'Успеваемость', user: comparison.userAcademic, avg: comparison.avgAcademic },
                    { label: 'Активность', user: comparison.userActivity, avg: comparison.avgActivity },
                    { label: 'Коммуникация', user: comparison.userCommunication, avg: comparison.avgCommunication },
                  ] as const).map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div className={styles.metricBar}>
                            <div className={styles.metricBarFill} style={{ width: `${Math.round(item.user)}%`, background: '#3b82f6' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{Math.round(item.user)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <div style={{ flex: 1 }}>
                          <div className={styles.metricBar}>
                            <div className={styles.metricBarFill} style={{ width: `${Math.round(item.avg)}%`, background: '#d1d5db' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: '#6a7282', minWidth: 28, textAlign: 'right' }}>{Math.round(item.avg)}</span>
                      </div>
                    </div>
                  ))}
                  <div className={styles.legendRow}>
                    <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#3b82f6' }} /> Вы</div>
                    <div className={styles.legendItem}><div className={styles.dot} style={{ background: '#d1d5db' }} /> Среднее</div>
                  </div>
                </div>
              ) : (
                <p className={styles.empty}>Нет данных</p>
              )}
            </div>
          </div>

          <div className={styles.grid2}>
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
                          style={{ width: 20, height: 20 }}
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

            <div className={styles.card}>
              <div className={styles.cardTitle}>Таблица лидеров</div>
              <div className={styles.cardSub}>Топ студентов по рейтингу</div>
              <div className={styles.leaders}>
                {leaders.length === 0 && <p className={styles.empty}>Нет данных</p>}
                {leaders.map((l) => (
                  <div
                    key={`${l.rank}-${l.name}`}
                    className={`${styles.leaderRow} ${l.you ? styles.youRow : ''}`}
                  >
                    <div className={styles.leaderLeft}>
                      <div
                        className={`${styles.rank} ${
                          l.rank === 1 ? styles.rank1 : l.rank === 2 ? styles.rank2 : l.rank === 3 ? styles.rank3 : styles.rank2
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
    </div>
  );
};

export default RatingPage;
