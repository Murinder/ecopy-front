import { useEffect, useMemo, useState } from 'react';
import styles from './EventsPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import CalendarIcon from '../../assets/icons/mjbmqg4r-fgt12s1.svg';
import ScheduleIcon from '../../assets/icons/mjbmnzii-lc4urbp.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import LocationIcon from '../../assets/icons/ui-location.svg';
import TagIcon from '../../assets/icons/ui-tag.svg';
import AddIcon from '../../assets/icons/mjbmqg4r-6km8pgq.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import { useAppSelector } from '../../app/hooks';
import {
  useGetStudentEventsQuery,
  useGetTeacherEventsQuery,
  useApplyToEventMutation,
  useCancelApplicationMutation,
  useGetMyApplicationsQuery,
  useGetEventTeamsQuery,
  useCreateTeamMutation,
  useJoinTeamMutation,
} from '../../services/eventApi';

type EventTag = 'Хакатон' | 'Карьера' | 'Обучение';

type EventItem = {
  id: string;
  tag: EventTag;
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  participants: string;
  chips: string[];
  isRegistered?: boolean;
};

type TeacherEventType = 'Консультация' | 'Лекция' | 'Семинар' | 'Защита';

type TeacherEvent = {
  id: string;
  type: TeacherEventType;
  title: string;
  subtitle: string;
  dateISO: string;
  time: string;
  durationMin: number;
  place: string;
  participantCount: number;
};

const monthName = (monthIndex: number) => {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  return months[monthIndex] || '';
};

const monthNameGenitive = (monthIndex: number) => {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  return months[monthIndex] || '';
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


const TeacherEventsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: apiEvents, isLoading: eventsLoading, isError: eventsError } = useGetTeacherEventsQuery(userId ?? '', { skip: !userId });

  const [teacherViewDate, setTeacherViewDate] = useState(() => new Date(2025, 10, 1));
  const [teacherSelectedId, setTeacherSelectedId] = useState<string | null>(null);
  const [teacherCreateOpen, setTeacherCreateOpen] = useState(false);

  const [teacherCreateType, setTeacherCreateType] = useState<TeacherEventType | ''>('');
  const [teacherCreateTitle, setTeacherCreateTitle] = useState('');
  const [teacherCreateSubtitle, setTeacherCreateSubtitle] = useState('');
  const [teacherCreateDate, setTeacherCreateDate] = useState('');
  const [teacherCreateTime, setTeacherCreateTime] = useState('');
  const [teacherCreateDuration, setTeacherCreateDuration] = useState('60');
  const [teacherCreatePlace, setTeacherCreatePlace] = useState('Кабинет 401');
  const [teacherCreateParticipants, setTeacherCreateParticipants] = useState('');
  const [teacherCreateOnline, setTeacherCreateOnline] = useState(false);

  const [teacherEvents, setTeacherEvents] = useState<TeacherEvent[]>([]);

  useEffect(() => {
    if (apiEvents?.success && apiEvents.data.length > 0) {
      setTeacherEvents(apiEvents.data.map((e) => ({
        id: e.id,
        type: e.type as TeacherEventType,
        title: e.title,
        subtitle: e.subtitle,
        dateISO: e.dateISO,
        time: e.time,
        durationMin: e.durationMin,
        place: e.place,
        participantCount: e.participantCount,
      })));
    }
  }, [apiEvents]);

  const teacherSelected = useMemo(
    () => (teacherSelectedId ? teacherEvents.find((e) => e.id === teacherSelectedId) || null : null),
    [teacherEvents, teacherSelectedId]
  );

  const teacherTypePillClass = (t: TeacherEventType) => {
    if (t === 'Консультация') return `${styles.teacherTypePill} ${styles.teacherTypeBlue}`;
    if (t === 'Лекция') return `${styles.teacherTypePill} ${styles.teacherTypeOrange}`;
    if (t === 'Семинар') return `${styles.teacherTypePill} ${styles.teacherTypePurple}`;
    return `${styles.teacherTypePill} ${styles.teacherTypeGreen}`;
  };

  const teacherTypeTextClass = (t: TeacherEventType) => {
    if (t === 'Консультация') return styles.teacherTextBlue;
    if (t === 'Лекция') return styles.teacherTextOrange;
    if (t === 'Семинар') return styles.teacherTextPurple;
    return styles.teacherTextGreen;
  };

  const teacherWeekItems = useMemo(() => {
    const now = new Date(2025, 10, 14, 12, 0, 0, 0);
    const to = new Date(now);
    to.setDate(now.getDate() + 7);

    const within = (e: TeacherEvent) => {
      const [h, m] = e.time.split(':').map((n) => Number(n));
      const dt = new Date(`${e.dateISO}T${e.time}:00`);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
      return dt >= now && dt <= to;
    };

    return teacherEvents
      .filter(within)
      .sort((a, b) => {
        const da = new Date(`${a.dateISO}T${a.time}:00`).getTime();
        const db = new Date(`${b.dateISO}T${b.time}:00`).getTime();
        return da - db;
      });
  }, [teacherEvents]);

  const teacherMonthKey = useMemo(
    () => `${teacherViewDate.getFullYear()}-${String(teacherViewDate.getMonth() + 1).padStart(2, '0')}`,
    [teacherViewDate]
  );

  const teacherMonthEvents = useMemo(
    () => teacherEvents.filter((e) => e.dateISO.startsWith(teacherMonthKey)),
    [teacherEvents, teacherMonthKey]
  );

  const teacherEventsByDay = useMemo(() => {
    const map = new Map<number, TeacherEvent[]>();
    teacherMonthEvents.forEach((e) => {
      const day = Number(e.dateISO.slice(8, 10));
      if (!Number.isFinite(day)) return;
      const prev = map.get(day) || [];
      map.set(day, [...prev, e]);
    });
    map.forEach((arr, key) => {
      arr.sort((a, b) => a.time.localeCompare(b.time));
      map.set(key, arr);
    });
    return map;
  }, [teacherMonthEvents]);

  const teacherCalendar = useMemo(() => {
    const y = teacherViewDate.getFullYear();
    const m = teacherViewDate.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells: Array<{ day: number | null }> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d });
    while (cells.length < 42) cells.push({ day: null });
    return cells;
  }, [teacherViewDate]);

  const teacherMonthLabel = useMemo(
    () => `${monthName(teacherViewDate.getMonth())} ${teacherViewDate.getFullYear()}`,
    [teacherViewDate]
  );

  const teacherPrevMonth = () => {
    setTeacherViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const teacherNextMonth = () => {
    setTeacherViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const teacherCloseDetails = () => setTeacherSelectedId(null);
  const teacherCloseCreate = () => setTeacherCreateOpen(false);

  const teacherOpenCreate = () => {
    setTeacherCreateOpen(true);
    setTeacherCreateType('');
    setTeacherCreateTitle('');
    setTeacherCreateSubtitle('');
    const y = teacherViewDate.getFullYear();
    const m = teacherViewDate.getMonth();
    setTeacherCreateDate(`${y}-${String(m + 1).padStart(2, '0')}-01`);
    setTeacherCreateTime('');
    setTeacherCreateDuration('60');
    setTeacherCreatePlace('Кабинет 401');
    setTeacherCreateParticipants('');
    setTeacherCreateOnline(false);
  };

  const teacherSubmitCreate = () => {
    if (!teacherCreateType || !teacherCreateTitle.trim() || !teacherCreateDate || !teacherCreateTime) return;
    const duration = Math.max(5, Number(teacherCreateDuration) || 60);
    const id = `t-${Math.random().toString(16).slice(2)}`;
    setTeacherEvents((prev) => [
      ...prev,
      {
        id,
        type: teacherCreateType,
        title: teacherCreateTitle.trim(),
        subtitle: teacherCreateSubtitle.trim() || '—',
        dateISO: teacherCreateDate,
        time: teacherCreateTime,
        durationMin: duration,
        place: teacherCreateOnline ? 'Онлайн (Zoom)' : teacherCreatePlace.trim() || '—',
        participantCount: 0,
      },
    ]);
    setTeacherCreateOpen(false);
  };

  const teacherDownloadIcs = (event: TeacherEvent) => {
    const [hh, mm] = event.time.split(':').map((n) => Number(n));
    const start = new Date(`${event.dateISO}T${event.time}:00`);
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || Number.isNaN(start.getTime())) return;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + event.durationMin);
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(
        d.getHours()
      ).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;

    const now = new Date();
    const safeTitle = event.title.replace(/[\r\n]+/g, ' ').trim();
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ECOPU//TeacherEvents//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@ecopu.local`,
      `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${safeTitle}`,
      `DESCRIPTION:${event.subtitle.replace(/[\r\n]+/g, ' ').trim()}`,
      `LOCATION:${event.place.replace(/[\r\n]+/g, ' ').trim()}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!teacherSelectedId && !teacherCreateOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        teacherCloseDetails();
        teacherCloseCreate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [teacherCreateOpen, teacherSelectedId]);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Календарь мероприятий</div>
              <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <img src={BellIcon} className={styles.notifIcon} />
              </div>
              <div className={styles.avatar}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
            {eventsLoading && <p className={styles.loading}>Загрузка...</p>}
            {eventsError && <p className={styles.error}>Ошибка загрузки данных</p>}
            <div className={styles.teacherHeaderRow}>
              <div className={styles.teacherMonthNav}>
                <button type="button" className={styles.teacherNavBtn} onClick={teacherPrevMonth} aria-label="Предыдущий месяц">
                  ‹
                </button>
                <div className={styles.teacherMonthLabel}>{teacherMonthLabel}</div>
                <button type="button" className={styles.teacherNavBtn} onClick={teacherNextMonth} aria-label="Следующий месяц">
                  ›
                </button>
              </div>

              <button type="button" className={styles.teacherCreateBtn} onClick={teacherOpenCreate}>
                <img src={AddIcon} className={styles.teacherCreateIcon} />
                Создать мероприятие
              </button>
            </div>

            <div className={styles.teacherGrid}>
              <div className={styles.teacherCalendarCard}>
                <div className={styles.teacherCardTitle}>Календарь мероприятий</div>
                <div className={styles.teacherWeekdays}>
                  {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((d) => (
                    <div key={d} className={styles.teacherWeekday}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className={styles.teacherCalendarGrid}>
                  {teacherCalendar.map((c, idx) => {
                    if (!c.day) {
                      return <div key={`e-${idx}`} className={`${styles.teacherDayCell} ${styles.teacherDayEmpty}`} />;
                    }
                    const dayEvents = teacherEventsByDay.get(c.day) || [];
                    const first = dayEvents[0];
                    return (
                      <div
                        key={`d-${c.day}-${idx}`}
                        className={`${styles.teacherDayCell} ${dayEvents.length ? styles.teacherDayHasEvents : ''}`}
                        role={dayEvents.length ? 'button' : undefined}
                        tabIndex={dayEvents.length ? 0 : -1}
                        onClick={() => (first ? setTeacherSelectedId(first.id) : undefined)}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && first) setTeacherSelectedId(first.id);
                        }}
                      >
                        <div className={styles.teacherDayNum}>{c.day}</div>
                        {first && (
                          <div className={`${styles.teacherDayEvent} ${teacherTypeTextClass(first.type)}`}>
                            {first.time} {first.title.slice(0, 10)}
                            {first.title.length > 10 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.teacherUpcomingCard}>
                <div className={styles.teacherUpcomingTitle}>Ближайшие события</div>
                <div className={styles.teacherUpcomingSub}>На этой неделе</div>
                <div className={styles.teacherUpcomingList}>
                  {teacherWeekItems.map((e) => (
                    <div
                      key={e.id}
                      className={styles.teacherUpcomingItem}
                      role="button"
                      tabIndex={0}
                      onClick={() => setTeacherSelectedId(e.id)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') setTeacherSelectedId(e.id);
                      }}
                    >
                      <div className={styles.teacherUpcomingTime}>
                        <div className={styles.teacherUpcomingDay}>{Number(e.dateISO.slice(8, 10))}</div>
                        <div className={styles.teacherUpcomingClock}>{e.time}</div>
                      </div>
                      <div className={styles.teacherUpcomingBody}>
                        <div className={teacherTypePillClass(e.type)}>{e.type}</div>
                        <div className={styles.teacherUpcomingName}>{e.title}</div>
                        <div className={styles.teacherUpcomingPlace}>{e.place}</div>
                      </div>
                    </div>
                  ))}
                  {!teacherWeekItems.length && <div className={styles.teacherUpcomingEmpty}>Нет событий на этой неделе</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {teacherSelected && (
        <div className={styles.teacherModalOverlay} onClick={teacherCloseDetails}>
          <div className={styles.teacherDetailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.teacherModalClose} type="button" onClick={teacherCloseDetails} aria-label="Закрыть">
              ×
            </button>

            <div className={teacherTypePillClass(teacherSelected.type)}>{teacherSelected.type}</div>
            <div className={styles.teacherModalTitle}>{teacherSelected.title}</div>
            <div className={styles.teacherModalSubtitle}>{teacherSelected.subtitle}</div>

            <div className={styles.teacherInfoGrid}>
              <div className={styles.teacherInfoItem}>
                <div className={`${styles.teacherInfoIconWrap} ${styles.teacherWrapBlue}`}>
                  <img src={CalendarIcon} className={styles.teacherInfoIcon} />
                </div>
                <div>
                  <div className={styles.teacherInfoLabel}>Дата</div>
                  <div className={styles.teacherInfoValue}>
                    {Number(teacherSelected.dateISO.slice(8, 10))} {monthNameGenitive(Number(teacherSelected.dateISO.slice(5, 7)) - 1)} {teacherSelected.dateISO.slice(0, 4)} г.
                  </div>
                </div>
              </div>
              <div className={styles.teacherInfoItem}>
                <div className={`${styles.teacherInfoIconWrap} ${styles.teacherWrapGreen}`}>
                  <img src={ScheduleIcon} className={styles.teacherInfoIcon} />
                </div>
                <div>
                  <div className={styles.teacherInfoLabel}>Время</div>
                  <div className={styles.teacherInfoValue}>
                    {teacherSelected.time} ({teacherSelected.durationMin} мин)
                  </div>
                </div>
              </div>
              <div className={styles.teacherInfoItem}>
                <div className={`${styles.teacherInfoIconWrap} ${styles.teacherWrapPurple}`}>
                  <img src={LocationIcon} className={styles.teacherInfoIcon} />
                </div>
                <div>
                  <div className={styles.teacherInfoLabel}>Место</div>
                  <div className={styles.teacherInfoValue}>{teacherSelected.place}</div>
                </div>
              </div>
              <div className={styles.teacherInfoItem}>
                <div className={`${styles.teacherInfoIconWrap} ${styles.teacherWrapOrange}`}>
                  <img src={PeopleIcon} className={styles.teacherInfoIcon} />
                </div>
                <div>
                  <div className={styles.teacherInfoLabel}>Участники</div>
                  <div className={styles.teacherInfoValue}>{teacherSelected.participantCount} чел.</div>
                </div>
              </div>
            </div>

            <div className={styles.teacherModalActions}>
              <button type="button" className={styles.teacherPrimaryBtn} onClick={() => window.alert('Напоминание отправлено (демо)')}>
                <img src={ChatIcon} className={styles.teacherBtnIcon} />
                Отправить напоминание
              </button>
              <button type="button" className={styles.teacherSecondaryBtn} onClick={() => teacherDownloadIcs(teacherSelected)}>
                <img src={FileIcon} className={styles.teacherBtnIcon} />
                Экспортировать в календарь
              </button>
            </div>
          </div>
        </div>
      )}

      {teacherCreateOpen && (
        <div className={styles.teacherModalOverlay} onClick={teacherCloseCreate}>
          <div className={styles.teacherCreateModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.teacherModalClose} type="button" onClick={teacherCloseCreate} aria-label="Закрыть">
              ×
            </button>

            <div className={styles.teacherCreateTitle}>Создать новое мероприятие</div>
            <div className={styles.teacherCreateSub}>Заполните информацию о мероприятии</div>

            <div className={styles.teacherForm}>
              <div className={styles.teacherField}>
                <div className={styles.teacherLabel}>Тип мероприятия</div>
                <select
                  className={styles.teacherSelect}
                  value={teacherCreateType}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'Консультация' || v === 'Лекция' || v === 'Семинар' || v === 'Защита') setTeacherCreateType(v);
                    else setTeacherCreateType('');
                  }}
                >
                  <option value="">Выберите тип</option>
                  <option value="Консультация">Консультация</option>
                  <option value="Лекция">Лекция</option>
                  <option value="Семинар">Семинар</option>
                  <option value="Защита">Защита</option>
                </select>
              </div>

              <div className={styles.teacherField}>
                <div className={styles.teacherLabel}>Название</div>
                <input
                  className={styles.teacherInput}
                  placeholder="Введите название мероприятия"
                  value={teacherCreateTitle}
                  onChange={(e) => setTeacherCreateTitle(e.target.value)}
                />
              </div>

              <div className={styles.teacherRow2}>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>Дата</div>
                  <input className={styles.teacherInput} type="date" value={teacherCreateDate} onChange={(e) => setTeacherCreateDate(e.target.value)} />
                </div>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>Время</div>
                  <input className={styles.teacherInput} type="time" value={teacherCreateTime} onChange={(e) => setTeacherCreateTime(e.target.value)} />
                </div>
              </div>

              <div className={styles.teacherRow2}>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>Длительность (мин)</div>
                  <input className={styles.teacherInput} inputMode="numeric" value={teacherCreateDuration} onChange={(e) => setTeacherCreateDuration(e.target.value)} />
                </div>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>Место</div>
                  <input
                    className={styles.teacherInput}
                    placeholder="Кабинет 401"
                    value={teacherCreatePlace}
                    onChange={(e) => setTeacherCreatePlace(e.target.value)}
                    disabled={teacherCreateOnline}
                  />
                </div>
              </div>

              <div className={styles.teacherField}>
                <div className={styles.teacherLabel}>Участники</div>
                <input
                  className={styles.teacherInput}
                  placeholder="Введите имена студентов"
                  value={teacherCreateParticipants}
                  onChange={(e) => setTeacherCreateParticipants(e.target.value)}
                />
              </div>

              <div className={styles.teacherField}>
                <div className={styles.teacherLabel}>Описание</div>
                <textarea
                  className={styles.teacherTextarea}
                  placeholder="Добавьте описание мероприятия"
                  value={teacherCreateSubtitle}
                  onChange={(e) => setTeacherCreateSubtitle(e.target.value)}
                />
              </div>

              <label className={styles.teacherCheckboxRow}>
                <input type="checkbox" checked={teacherCreateOnline} onChange={(e) => setTeacherCreateOnline(e.target.checked)} />
                Онлайн мероприятие
              </label>
            </div>

            <div className={styles.teacherCreateActions}>
              <button type="button" className={styles.teacherCancelBtn} onClick={teacherCloseCreate}>
                Отмена
              </button>
              <button
                type="button"
                className={styles.teacherSubmitBtn}
                onClick={teacherSubmitCreate}
                disabled={!teacherCreateType || !teacherCreateTitle.trim() || !teacherCreateDate || !teacherCreateTime}
              >
                Создать мероприятие
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


type AppTab = 'upcoming' | 'past' | 'my';

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Заявка отправлена',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  WAITLISTED: 'В листе ожидания',
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'statusPending',
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
  WAITLISTED: 'statusWaitlisted',
};

const StudentEventsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const { data: apiEvents, isLoading: studentEventsLoading, isError: studentEventsError } = useGetStudentEventsQuery(userId, { skip: false });
  const { data: myApplicationsData } = useGetMyApplicationsQuery();
  const [applyToEvent, { isLoading: applyLoading }] = useApplyToEventMutation();
  const [cancelApplication] = useCancelApplicationMutation();

  const [tab, setTab] = useState<AppTab>('upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applyModalEventId, setApplyModalEventId] = useState<string | null>(null);
  const [applyMotivation, setApplyMotivation] = useState('');
  const [applySkills, setApplySkills] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [teamModalEventId, setTeamModalEventId] = useState<string | null>(null);
  const [createTeamName, setCreateTeamName] = useState('');
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [createTeam] = useCreateTeamMutation();
  const [joinTeam] = useJoinTeamMutation();

  const myApplications = useMemo(() => myApplicationsData ?? [], [myApplicationsData]);
  const myApplicationByEventId = useMemo(() => {
    const map: Record<string, typeof myApplications[0]> = {};
    myApplications.forEach((a) => { map[a.eventId] = a; });
    return map;
  }, [myApplications]);

  const { data: eventTeamsData } = useGetEventTeamsQuery(teamModalEventId ?? '', { skip: !teamModalEventId });
  const eventTeams = useMemo(() => eventTeamsData ?? [], [eventTeamsData]);

  const upcoming = useMemo<EventItem[]>(() => {
    if (apiEvents?.success && apiEvents.data.length > 0) {
      return apiEvents.data
        .filter((e) => !e.isPast)
        .map((e) => ({
          id: e.id,
          tag: e.tag as EventTag,
          title: e.title,
          description: e.description,
          date: e.date,
          time: e.time,
          place: e.place,
          participants: e.participants,
          chips: e.chips,
          isRegistered: e.isRegistered,
        }));
    }
    return [];
  }, [apiEvents]);

  const past = useMemo<EventItem[]>(() => {
    if (apiEvents?.success && apiEvents.data.length > 0) {
      return apiEvents.data
        .filter((e) => e.isPast)
        .map((e) => ({
          id: e.id,
          tag: e.tag as EventTag,
          title: e.title,
          description: e.description,
          date: e.date,
          time: e.time,
          place: e.place,
          participants: e.participants,
          chips: e.chips,
          isRegistered: e.isRegistered,
        }));
    }
    return [];
  }, [apiEvents]);

  const list = tab === 'upcoming' ? upcoming : past;
  const counts = { upcoming: upcoming.length, past: past.length, my: myApplications.length };
  const allEvents = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const selected = useMemo(
    () => (selectedId ? allEvents.find((e) => e.id === selectedId) : undefined),
    [allEvents, selectedId]
  );

  const pillClass = (tag: EventTag) => {
    if (tag === 'Хакатон') return `${styles.pill} ${styles.pillPurple}`;
    if (tag === 'Карьера') return `${styles.pill} ${styles.pillBlue}`;
    return `${styles.pill} ${styles.pillGreen}`;
  };

  const closeModal = () => setSelectedId(null);

  const openApplyModal = (eventId: string) => {
    setApplyModalEventId(eventId);
    setApplyMotivation('');
    setApplySkills('');
    setApplyError(null);
  };

  const closeApplyModal = () => setApplyModalEventId(null);

  const submitApply = async () => {
    if (!applyModalEventId || !userId) return;
    setApplyError(null);
    try {
      await applyToEvent({ eventId: applyModalEventId, userId, motivation: applyMotivation, skills: applySkills }).unwrap();
      closeApplyModal();
    } catch {
      setApplyError('Ошибка при подаче заявки');
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    await cancelApplication(applicationId).catch(() => {});
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!userId) return;
    await joinTeam({ teamId, userId, role: 'member' }).catch(() => {});
  };

  const handleCreateTeam = async () => {
    if (!teamModalEventId || !createTeamName.trim()) return;
    await createTeam({ eventId: teamModalEventId, name: createTeamName.trim() }).unwrap().catch(() => {});
    setCreateTeamName('');
    setCreateTeamOpen(false);
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const downloadIcs = (event: EventItem) => {
    const now = new Date();
    const safeTitle = event.title.replace(/[\\r\\n]+/g, ' ').trim();
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ECOPU//Events//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@ecopu.local`,
      `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}Z$/, 'Z')}`,
      `SUMMARY:${safeTitle}`,
      `DESCRIPTION:${event.description.replace(/[\\r\\n]+/g, ' ').trim()}`,
      `LOCATION:${event.place.replace(/[\\r\\n]+/g, ' ').trim()}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\\r\\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Мероприятия</div>
              <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
            </div>
              <div className={styles.topActions}>
                <div className={styles.notif}>
                  <img src={BellIcon} className={styles.notifIcon} />
                </div>
              <div className={styles.avatar}>{avatarInitials}</div>
              </div>
            </div>

          <div className={styles.main}>
            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${tab === 'upcoming' ? styles.tabActive : ''}`}
                onClick={() => setTab('upcoming')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setTab('upcoming');
                }}
              >
                Предстоящие ({counts.upcoming})
              </div>
              <div
                className={`${styles.tab} ${tab === 'past' ? styles.tabActive : ''}`}
                onClick={() => setTab('past')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setTab('past');
                }}
              >
                Прошедшие ({counts.past})
              </div>
              <div
                className={`${styles.tab} ${tab === 'my' ? styles.tabActive : ''}`}
                onClick={() => setTab('my')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setTab('my');
                }}
              >
                Мои заявки ({counts.my})
              </div>
            </div>

            {studentEventsLoading && <p className={styles.loading}>Загрузка...</p>}
            {studentEventsError && <p className={styles.error}>Ошибка загрузки данных</p>}

            {tab === 'my' ? (
              <div className={styles.grid}>
                {myApplications.length === 0 && <p className={styles.empty}>У вас нет заявок</p>}
                {myApplications.map((app) => {
                  const event = allEvents.find((e) => e.id === app.eventId);
                  const statusKey = app.status;
                  return (
                    <div key={app.id} className={`${styles.card} ${styles.halfLeft}`}>
                      <div className={styles.cardTop}>
                        {event && <div className={pillClass(event.tag)}>{event.tag}</div>}
                        <div className={`${styles.pill} ${styles[STATUS_STYLES[statusKey] ?? 'statusPending']}`}>
                          {STATUS_LABELS[statusKey] ?? statusKey}
                        </div>
                      </div>
                      <div className={styles.cardTitle}>{event?.title ?? app.eventId}</div>
                      {event && <div className={styles.cardDesc}>{event.date} · {event.place}</div>}
                      {app.motivation && <div className={styles.cardDesc} style={{ marginTop: 4, fontStyle: 'italic' }}>{app.motivation}</div>}
                      {statusKey === 'SUBMITTED' && (
                        <div className={styles.modalActions} style={{ marginTop: 12 }}>
                          <button
                            className={`${styles.actionBtn} ${styles.dangerBtn}`}
                            onClick={() => handleCancelApplication(app.id)}
                          >
                            Отменить заявку
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.grid}>
                {!studentEventsLoading && !studentEventsError && list.length === 0 && <p className={styles.empty}>Нет данных</p>}
                {list.map((e, idx) => {
                  const existingApp = myApplicationByEventId[e.id];
                  const placeClass = idx === 0 ? styles.fullLeft : idx === 1 ? styles.fullRight : styles.halfLeft;
                  return (
                    <div
                      key={e.id}
                      className={`${styles.card} ${placeClass}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(e.id)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') setSelectedId(e.id);
                      }}
                    >
                      <div className={styles.cardTop}>
                        <div className={pillClass(e.tag)}>{e.tag}</div>
                        {tab === 'upcoming' ? (
                          existingApp ? (
                            <div className={`${styles.pill} ${styles[STATUS_STYLES[existingApp.status] ?? 'statusPending']}`}>
                              {STATUS_LABELS[existingApp.status] ?? existingApp.status}
                            </div>
                          ) : (
                            <div
                              className={`${styles.pill} ${styles.statusAction}`}
                              role="button"
                              tabIndex={0}
                              onClick={(clickEv) => {
                                clickEv.stopPropagation();
                                openApplyModal(e.id);
                              }}
                              onKeyDown={(ev) => {
                                if (ev.key === 'Enter' || ev.key === ' ') {
                                  ev.stopPropagation();
                                  openApplyModal(e.id);
                                }
                              }}
                            >
                              Зарегистрироваться
                            </div>
                          )
                        ) : (
                          <div className={`${styles.pill} ${styles.statusRegistered}`}>Завершено</div>
                        )}
                      </div>

                      <div className={styles.cardTitle}>{e.title}</div>
                      <div className={styles.cardDesc}>{e.description}</div>

                      <div className={styles.meta}>
                        <div className={styles.metaRow}>
                          <img src={CalendarIcon} className={styles.metaIcon} />
                          {e.date}
                        </div>
                        <div className={styles.metaRow}>
                          <img src={ScheduleIcon} className={styles.metaIcon} />
                          {e.time}
                        </div>
                        <div className={styles.metaRow}>{e.place}</div>
                      </div>

                      <div className={styles.cardBottom}>
                        <div className={styles.participants}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={PeopleIcon} className={styles.metaIcon} />
                            {e.participants}
                          </div>
                        </div>
                        <div className={styles.chips}>
                          {e.chips.map((c) => (
                            <div key={c} className={styles.chip}>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <div className={styles.modalBadges}>
                <div className={pillClass(selected.tag)}>{selected.tag}</div>
                <div className={`${styles.pill} ${styles.pillOutline}`}>
                  {tab === 'upcoming' ? 'Предстоящее' : 'Прошедшее'}
                </div>
              </div>
              <button className={styles.closeBtn} onClick={closeModal} aria-label="Закрыть">
                <img src={CloseIcon} className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.modalTitle}>{selected.title}</div>
            <div className={styles.modalDesc}>{selected.description}</div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={`${styles.infoIconWrap} ${styles.wrapBlue}`}>
                  <img src={CalendarIcon} className={styles.metaIcon} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Дата</div>
                  <div className={styles.infoValue}>{selected.date}</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={`${styles.infoIconWrap} ${styles.wrapGreen}`}>
                  <img src={ScheduleIcon} className={styles.metaIcon} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Время</div>
                  <div className={styles.infoValue}>{selected.time}</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={`${styles.infoIconWrap} ${styles.wrapPurple}`}>
                  <img src={LocationIcon} className={styles.metaIcon} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Место</div>
                  <div className={styles.infoValue}>{selected.place}</div>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={`${styles.infoIconWrap} ${styles.wrapOrange}`}>
                  <img src={PeopleIcon} className={styles.metaIcon} />
                </div>
                <div>
                  <div className={styles.infoLabel}>Участники</div>
                  <div className={styles.infoValue}>{selected.participants.replace(' участников', '')}</div>
                </div>
              </div>
            </div>

            <div className={styles.sectionLabel}>Организатор</div>
            <div className={styles.organizerRow}>
              <div className={styles.orgAvatar}>Ст</div>
              <div className={styles.orgName}>Студенческий совет ИТ</div>
            </div>

            <div className={styles.sectionLabel}>Теги</div>
            <div className={styles.tagsRow}>
              {selected.chips.map((c) => (
                <div key={c} className={styles.tagChip}>
                  <img src={TagIcon} className={styles.chipIcon} />
                  {c}
                </div>
              ))}
            </div>

            {selected.tag === 'Хакатон' && (
              <>
                <div className={styles.sectionLabel}>Команды</div>
                <div style={{ marginBottom: 8 }}>
                  {eventTeams.map((team) => (
                    <div key={team.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span>{team.name}</span>
                      {team.createdBy !== userId && (
                        <button className={`${styles.actionBtn} ${styles.mutedBtn}`} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleJoinTeam(team.id)}>
                          Вступить
                        </button>
                      )}
                    </div>
                  ))}
                  {eventTeams.length === 0 && <p style={{ color: '#888', fontSize: 13 }}>Команд пока нет</p>}
                </div>
                {!createTeamOpen ? (
                  <button
                    className={`${styles.actionBtn} ${styles.mutedBtn}`}
                    style={{ marginBottom: 12 }}
                    onClick={() => { setTeamModalEventId(selected.id); setCreateTeamOpen(true); }}
                  >
                    + Создать команду
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      className={styles.teacherInput}
                      placeholder="Название команды"
                      value={createTeamName}
                      onChange={(e) => setCreateTeamName(e.target.value)}
                    />
                    <button className={`${styles.actionBtn} ${styles.mutedBtn}`} onClick={handleCreateTeam} disabled={!createTeamName.trim()}>
                      Создать
                    </button>
                    <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setCreateTeamOpen(false)}>
                      Отмена
                    </button>
                  </div>
                )}
              </>
            )}

            <div className={styles.modalActions}>
              {(() => {
                const existingApp = myApplicationByEventId[selected.id];
                if (existingApp) {
                  return (
                    <>
                      <div className={`${styles.pill} ${styles[STATUS_STYLES[existingApp.status] ?? 'statusPending']}`} style={{ alignSelf: 'center' }}>
                        {STATUS_LABELS[existingApp.status] ?? existingApp.status}
                      </div>
                      {existingApp.status === 'SUBMITTED' && (
                        <button
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => handleCancelApplication(existingApp.id)}
                        >
                          ⨯ Отменить заявку
                        </button>
                      )}
                    </>
                  );
                }
                return (
                  <button
                    className={`${styles.actionBtn} ${styles.mutedBtn}`}
                    onClick={() => openApplyModal(selected.id)}
                  >
                    Зарегистрироваться
                  </button>
                );
              })()}
              <button className={`${styles.actionBtn} ${styles.mutedBtn}`} onClick={() => downloadIcs(selected)}>
                Добавить в календарь
              </button>
            </div>
          </div>
        </div>
      )}

      {applyModalEventId && (
        <div className={styles.modalOverlay} onClick={closeApplyModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle} style={{ fontSize: 18 }}>Подать заявку</div>
              <button className={styles.closeBtn} onClick={closeApplyModal} aria-label="Закрыть">
                <img src={CloseIcon} className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.teacherField} style={{ marginTop: 16 }}>
              <div className={styles.teacherLabel}>Мотивация *</div>
              <textarea
                className={styles.teacherTextarea}
                placeholder="Расскажите, почему хотите участвовать"
                value={applyMotivation}
                onChange={(e) => setApplyMotivation(e.target.value)}
                rows={4}
              />
            </div>
            <div className={styles.teacherField} style={{ marginTop: 12 }}>
              <div className={styles.teacherLabel}>Навыки</div>
              <input
                className={styles.teacherInput}
                placeholder="Например: Python, ML, React"
                value={applySkills}
                onChange={(e) => setApplySkills(e.target.value)}
              />
            </div>
            {applyError && <p style={{ color: '#e53935', fontSize: 13, marginTop: 8 }}>{applyError}</p>}
            <div className={styles.teacherCreateActions} style={{ marginTop: 20 }}>
              <button className={styles.teacherCancelBtn} onClick={closeApplyModal}>Отмена</button>
              <button
                className={styles.teacherSubmitBtn}
                onClick={submitApply}
                disabled={applyLoading || !applyMotivation.trim()}
              >
                {applyLoading ? 'Отправка...' : 'Подать заявку'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Иван Иванов';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const avatarInitials = useMemo(() => initialsFromName(userName), [userName]);
  const isTeacher = userRole === 'Преподаватель' || userRole === 'Заведующий кафедрой';

  return isTeacher ? <TeacherEventsView avatarInitials={avatarInitials} /> : <StudentEventsView avatarInitials={avatarInitials} />;
};

export default EventsPage;
