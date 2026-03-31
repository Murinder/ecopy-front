import { useMemo } from 'react';
import styles from './RatingPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import BoltIcon from '../../assets/icons/ui-bolt.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from 'recharts';

const RatingPage = () => {
  const subjects = useMemo(
    () => [
      { name: 'Математический анализ', value: 95 },
      { name: 'Программирование', value: 92 },
      { name: 'Базы данных', value: 94 },
      { name: 'Физика', value: 88 },
      { name: 'Английский язык', value: 90 },
    ],
    []
  );

  const profile = useMemo(
    () => [
      { subject: 'Учеба', value: 92 },
      { subject: 'Проекты', value: 85 },
      { subject: 'Лидерство', value: 76 },
      { subject: 'Коммуникация', value: 84 },
      { subject: 'Креативность', value: 71 },
      { subject: 'Тех. навыки', value: 88 },
    ],
    []
  );

  const compare = useMemo(
    () => [
      { name: 'Вы', activity: 85, communication: 84, study: 92 },
      { name: 'Средний студент', activity: 70, communication: 68, study: 75 },
      { name: 'Топ-10%', activity: 88, communication: 86, study: 90 },
    ],
    []
  );

  const leaders = useMemo(
    () => [
      { rank: 1, initials: 'АС', name: 'Анна Смирнова', score: 95 },
      { rank: 2, initials: 'ДК', name: 'Дмитрий Козлов', score: 93 },
      { rank: 3, initials: 'ЕН', name: 'Елена Новикова', score: 91 },
      { rank: 12, initials: 'ИИ', name: 'Иван Иванов (Вы)', score: 87, you: true },
    ],
    []
  );

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
              <img src={BellIcon} className={styles.notifIcon} />
              <div className={styles.notifBadge}>3</div>
            </div>
            <div className={styles.avatar}>ии</div>
          </div>
        </div>

        <div className={styles.main}>
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
                  strokeDasharray={`${(2 * Math.PI * 46 * 87) / 100} ${2 * Math.PI * 46}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.ringText}>
                <div className={styles.ringValue}>87</div>
                <div className={styles.ringSub}>из 100</div>
              </div>
            </div>
            <div>
              <div className={styles.heroTitle}>Общий рейтинг</div>
              <div className={styles.heroDesc}>Вы находитесь в топ 97% студентов университета</div>
              <div className={styles.heroStats}>
                <div>
                  <div className={styles.heroStatLabel}>Место в рейтинге</div>
                  <div className={styles.heroStatValue}>#12 из 450</div>
                </div>
                <div>
                  <div className={styles.heroStatLabel}>Рост за месяц</div>
                  <div className={styles.heroStatValue}>+5</div>
                </div>
                <div>
                  <div className={styles.heroStatLabel}>Статус</div>
                  <div className={styles.statusPill}>
                    <img src={AwardIcon} style={{ width: 14, height: 14 }} />
                    Отличник
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
                <div style={{ color: '#6a7282', fontSize: 12 }}>92 из 100</div>
              </div>
              <div className={styles.metricTitle}>Успеваемость</div>
              <div className={styles.metricHint}>Средний балл по всем предметам</div>
              <div className={styles.divider}>
                <div className={styles.dividerInner} style={{ width: '92%' }} />
              </div>
              <div className={styles.kvList}>
                {subjects.map((s) => (
                  <div key={s.name} style={{ display: 'contents' }}>
                    <div>{s.name}</div>
                    <div className={styles.kvValue}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconOrange}`}>
                  <img src={BoltIcon} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ color: '#6a7282', fontSize: 12 }}>85 из 100</div>
              </div>
              <div className={styles.metricTitle}>Активность</div>
              <div className={styles.metricHint}>Участие в проектах и мероприятиях</div>
              <div className={styles.divider}>
                <div className={styles.dividerInner} style={{ width: '85%' }} />
              </div>
              <div className={styles.kvList}>
                <div>Завершено проектов</div>
                <div className={styles.kvValue}>12</div>
                <div>Посещено мероприятий</div>
                <div className={styles.kvValue}>18</div>
                <div>Созданных задач</div>
                <div className={styles.kvValue}>47</div>
                <div>Часов активности</div>
                <div className={styles.kvValue}>124</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={`${styles.metricIcon} ${styles.metricIconPurple}`}>
                  <img src={ChatIcon} style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ color: '#6a7282', fontSize: 12 }}>84 из 100</div>
              </div>
              <div className={styles.metricTitle}>Коммуникация</div>
              <div className={styles.metricHint}>Взаимодействие с командой и сообществом</div>
              <div className={styles.divider}>
                <div className={styles.dividerInner} style={{ width: '84%' }} />
              </div>
              <div className={styles.kvList}>
                <div>Отзывов от коллег</div>
                <div className={styles.kvValue}>28</div>
                <div>Средняя оценка</div>
                <div className={styles.kvValue}>4.6/5</div>
                <div>Помощь другим</div>
                <div className={styles.kvValue}>15 раз</div>
                <div>Участие в дискуссиях</div>
                <div className={styles.kvValue}>42</div>
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Профиль компетенций</div>
              <div className={styles.cardSub}>Ваши навыки и способности</div>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={profile}>
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6a7282', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6a7282', fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#3a76f0" fill="#3a76f0" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Сравнение с другими</div>
              <div className={styles.cardSub}>Ваши результаты относительно других студентов</div>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compare} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#6a7282', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6a7282', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e5e5' }}
                      labelStyle={{ color: '#0a0a0a' }}
                    />
                    <Bar dataKey="activity" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="communication" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="study" fill="#3a76f0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.legendRow}>
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: '#f59e0b' }} />
                  Активность
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: '#8b5cf6' }} />
                  Коммуникация
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: '#3a76f0' }} />
                  Успеваемость
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Достижения</div>
              <div className={styles.cardSub}>Ваши награды и успехи</div>
              <div className={styles.achGrid}>
                <div className={`${styles.achCard} ${styles.achCardActive}`}>
                  <div className={styles.achIcon}>
                    <img src={AwardIcon} style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div className={styles.achName}>Отличник</div>
                    <div className={styles.achDesc}>Средний балл выше 90</div>
                    <div className={styles.achMeta}>Получено: 15 ноября 2025</div>
                  </div>
                </div>
                <div className={`${styles.achCard} ${styles.achCardActive}`}>
                  <div className={styles.achIcon}>
                    <img src={BoltIcon} style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div className={styles.achName}>Активист года</div>
                    <div className={styles.achDesc}>Участие в 15+ мероприятиях</div>
                    <div className={styles.achMeta}>Получено: 10 ноября 2025</div>
                  </div>
                </div>
                <div className={`${styles.achCard} ${styles.achCardActive}`}>
                  <div className={styles.achIcon}>
                    <img src={ChatIcon} style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div className={styles.achName}>Командный игрок</div>
                    <div className={styles.achDesc}>Успешно завершено 10+ проектов</div>
                    <div className={styles.achMeta}>Получено: 5 ноября 2025</div>
                  </div>
                </div>
                <div className={`${styles.achCard} ${styles.locked}`}>
                  <div className={styles.achIcon}>💡</div>
                  <div>
                    <div className={styles.achName}>Инноватор</div>
                    <div className={styles.achDesc}>Создано 5 уникальных проектов</div>
                    <div className={styles.achMeta}>Заблокировано</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Таблица лидеров</div>
              <div className={styles.cardSub}>Топ студентов по рейтингу</div>
              <div className={styles.leaders}>
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
                      <div className={styles.leaderAvatar}>{l.initials}</div>
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
