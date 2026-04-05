import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './EventsPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
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
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useApplyToEventMutation,
  useCancelApplicationMutation,
  useGetMyApplicationsQuery,
  useGetEventTeamsQuery,
  useGetTeamJoinRequestsQuery,
  useTeamDecisionMutation,
  useGetEventApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '../../services/eventApi';
import type { TeacherEventViewDto } from '../../services/eventApi';

type EventTag = 'Хакатон' | 'Конференция' | 'Акселератор' | 'Карьера' | 'Обучение';

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
  dateISO?: string;
  endDateISO?: string;
  organizerName?: string;
  eventType?: string;
};

type TeacherEventType = 'Консультация' | 'Хакатон' | 'Конференция' | 'Акселератор' | 'Карьера' | 'Другое';

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
  status?: string;
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

  const [teacherViewDate, setTeacherViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [teacherSelectedId, setTeacherSelectedId] = useState<string | null>(null);
  const [teacherSelectedDay, setTeacherSelectedDay] = useState<number | null>(() => new Date().getDate());
  const [teacherCreateOpen, setTeacherCreateOpen] = useState(false);

  const [teacherCreateType, setTeacherCreateType] = useState<TeacherEventType | ''>('');
  const [teacherCreateTitle, setTeacherCreateTitle] = useState('');
  const [teacherCreateSubtitle, setTeacherCreateSubtitle] = useState('');
  const [teacherCreateDate, setTeacherCreateDate] = useState('');
  const [teacherCreateTime, setTeacherCreateTime] = useState('');
  const [teacherCreateDuration, setTeacherCreateDuration] = useState('60');
  const [teacherCreatePlace, setTeacherCreatePlace] = useState('');
  const [teacherCreateParticipants, setTeacherCreateParticipants] = useState('');
  const [teacherCreateOnline, setTeacherCreateOnline] = useState(false);
  const [teacherCreateError, setTeacherCreateError] = useState('');
  const [teacherCreateStatus, setTeacherCreateStatus] = useState('PUBLISHED');

  const [createEvent, { isLoading: createEventLoading }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updateEventLoading }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: deletingEvent }] = useDeleteEventMutation();
  const [updateApplicationStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();

  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { data: eventApplications = [], isFetching: applicationsLoading } =
    useGetEventApplicationsQuery(teacherSelectedId ?? '', {
      skip: !teacherSelectedId || !applicationsOpen,
    });

  const pendingApplications = eventApplications.filter((a) => a.status === 'SUBMITTED');

  const [teacherEditMode, setTeacherEditMode] = useState(false);
  const [teacherEditType, setTeacherEditType] = useState<TeacherEventType | ''>('');
  const [teacherEditTitle, setTeacherEditTitle] = useState('');
  const [teacherEditSubtitle, setTeacherEditSubtitle] = useState('');
  const [teacherEditDate, setTeacherEditDate] = useState('');
  const [teacherEditTime, setTeacherEditTime] = useState('');
  const [teacherEditDuration, setTeacherEditDuration] = useState('60');
  const [teacherEditPlace, setTeacherEditPlace] = useState('');
  const [teacherEditOnline, setTeacherEditOnline] = useState(false);
  const [teacherEditError, setTeacherEditError] = useState('');
  const [teacherEditStatus, setTeacherEditStatus] = useState('PUBLISHED');

  const teacherEvents: TeacherEvent[] = useMemo(() => {
    if (!apiEvents?.success || !apiEvents.data) return [];
    return apiEvents.data.map((e: TeacherEventViewDto) => ({
      id: e.id,
      type: e.type as TeacherEventType,
      title: e.title,
      subtitle: e.subtitle,
      dateISO: e.dateISO,
      time: e.time,
      durationMin: e.durationMin,
      place: e.place,
      participantCount: e.participantCount,
      status: e.status,
    }));
  }, [apiEvents]);

  const teacherSelected = useMemo(
    () => (teacherSelectedId ? teacherEvents.find((e) => e.id === teacherSelectedId) || null : null),
    [teacherEvents, teacherSelectedId]
  );

  const teacherTypePillClass = (t: TeacherEventType) => {
    if (t === 'Консультация') return `${styles.teacherTypePill} ${styles.teacherTypeBlue}`;
    if (t === 'Хакатон') return `${styles.teacherTypePill} ${styles.teacherTypeOrange}`;
    if (t === 'Конференция') return `${styles.teacherTypePill} ${styles.teacherTypePurple}`;
    if (t === 'Акселератор') return `${styles.teacherTypePill} ${styles.teacherTypeGreen}`;
    return `${styles.teacherTypePill} ${styles.teacherTypeGray}`;
  };


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

  const teacherSelectedDayEvents = useMemo(() => {
    if (teacherSelectedDay == null) return [];
    return (teacherEventsByDay.get(teacherSelectedDay) || []).sort((a, b) => a.time.localeCompare(b.time));
  }, [teacherEventsByDay, teacherSelectedDay]);

  const teacherToday = useMemo(() => {
    const now = new Date();
    const y = teacherViewDate.getFullYear();
    const m = teacherViewDate.getMonth();
    if (now.getFullYear() === y && now.getMonth() === m) return now.getDate();
    return null;
  }, [teacherViewDate]);

  const teacherSelectedDayLabel = useMemo(() => {
    if (teacherSelectedDay == null) return '';
    return `${teacherSelectedDay} ${monthNameGenitive(teacherViewDate.getMonth())}`;
  }, [teacherSelectedDay, teacherViewDate]);

  const teacherCalendar = useMemo(() => {
    const y = teacherViewDate.getFullYear();
    const m = teacherViewDate.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday=0
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

  const teacherCloseDetails = () => {
    setTeacherSelectedId(null);
    setTeacherEditMode(false);
    setApplicationsOpen(false);
    setDeleteConfirm(false);
    setDeleteError('');
  };
  const teacherCloseCreate = () => setTeacherCreateOpen(false);

  const openEditMode = () => {
    if (!teacherSelected) return;
    setTeacherEditType(teacherSelected.type);
    setTeacherEditTitle(teacherSelected.title);
    setTeacherEditSubtitle(teacherSelected.subtitle);
    setTeacherEditDate(teacherSelected.dateISO.slice(0, 10));
    setTeacherEditTime(teacherSelected.time);
    setTeacherEditDuration(String(teacherSelected.durationMin));
    const isOnline = teacherSelected.place.startsWith('http');
    setTeacherEditOnline(isOnline);
    setTeacherEditPlace(teacherSelected.place);
    setTeacherEditStatus(teacherSelected.status ?? 'PUBLISHED');
    setTeacherEditError('');
    setTeacherEditMode(true);
  };

  const handleApplicationDecision = async (appId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateApplicationStatus({ id: appId, status }).unwrap();
    } catch { /* tag invalidation triggers refetch */ }
  };

  const handleDeleteEvent = async () => {
    if (!teacherSelectedId) return;
    try {
      await deleteEvent(teacherSelectedId).unwrap();
      teacherCloseDetails();
    } catch (err: unknown) {
      setDeleteError((err as { data?: { message?: string } })?.data?.message || 'Не удалось удалить мероприятие');
    }
  };

  const submitEdit = async () => {
    if (!teacherSelected || !teacherEditTitle.trim() || !teacherEditDate || !teacherEditTime) return;
    setTeacherEditError('');
    const durationMin = Math.max(5, Number(teacherEditDuration) || 60);
    const startDate = `${teacherEditDate}T${teacherEditTime}:00+03:00`;
    const [hh, mm] = teacherEditTime.split(':').map(Number);
    const endMinutes = hh * 60 + mm + durationMin;
    const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endDate = `${teacherEditDate}T${endH}:${endM}:00+03:00`;
    try {
      await updateEvent({
        id: teacherSelected.id,
        title: teacherEditTitle.trim(),
        description: teacherEditSubtitle.trim() || undefined,
        startDate,
        endDate,
        format: teacherEditOnline ? 'ONLINE' : 'OFFLINE',
        eventType: teacherEditType || undefined,
        location: teacherEditPlace.trim() || undefined,
        status: teacherEditStatus,
      }).unwrap();
      setTeacherEditMode(false);
      teacherCloseDetails();
    } catch (err: unknown) {
      setTeacherEditError((err as { data?: { message?: string } })?.data?.message || 'Не удалось сохранить');
    }
  };

  const teacherOpenCreate = () => {
    setTeacherCreateOpen(true);
    setTeacherCreateError('');
    setTeacherCreateType('');
    setTeacherCreateTitle('');
    setTeacherCreateSubtitle('');
    const y = teacherViewDate.getFullYear();
    const m = teacherViewDate.getMonth();
    const day = teacherSelectedDay ?? new Date().getDate();
    setTeacherCreateDate(`${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setTeacherCreateTime('');
    setTeacherCreateDuration('60');
    setTeacherCreatePlace('');
    setTeacherCreateParticipants('');
    setTeacherCreateOnline(false);
    setTeacherCreateStatus('PUBLISHED');
  };

  const teacherSubmitCreate = async () => {
    if (!teacherCreateType || !teacherCreateTitle.trim() || !teacherCreateDate || !teacherCreateTime || !userId) return;
    setTeacherCreateError('');

    const durationMin = Math.max(5, Number(teacherCreateDuration) || 60);
    const startDate = `${teacherCreateDate}T${teacherCreateTime}:00+03:00`;
    const [hh, mm] = teacherCreateTime.split(':').map(Number);
    const endMinutes = hh * 60 + mm + durationMin;
    const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endDate = `${teacherCreateDate}T${endH}:${endM}:00+03:00`;

    try {
      await createEvent({
        title: teacherCreateTitle.trim(),
        description: teacherCreateSubtitle.trim() || undefined,
        startDate,
        endDate,
        format: teacherCreateOnline ? 'ONLINE' : 'OFFLINE',
        eventType: teacherCreateType,
        createdBy: userId,
        location: teacherCreateOnline ? (teacherCreatePlace.trim() || 'Онлайн') : (teacherCreatePlace.trim() || undefined),
        status: teacherCreateStatus,
      }).unwrap();
      setTeacherCreateOpen(false);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message || 'Не удалось создать мероприятие';
      setTeacherCreateError(msg);
    }
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
                <NotificationBell iconSrc={BellIcon} />
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
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
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
                    const isToday = c.day === teacherToday;
                    const isSelected = c.day === teacherSelectedDay;
                    const cellClasses = [
                      styles.teacherDayCell,
                      dayEvents.length ? styles.teacherDayHasEvents : '',
                      isToday ? styles.teacherDayToday : '',
                      isSelected ? styles.teacherDaySelected : '',
                    ].filter(Boolean).join(' ');

                    return (
                      <div
                        key={`d-${c.day}-${idx}`}
                        className={cellClasses}
                        role="button"
                        tabIndex={0}
                        onClick={() => setTeacherSelectedDay(c.day)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setTeacherSelectedDay(c.day);
                        }}
                      >
                        <div className={`${styles.teacherDayNum} ${isToday ? styles.teacherDayNumToday : ''}`}>{c.day}</div>
                        {dayEvents.length > 0 && (
                          <div className={styles.teacherDayDots}>
                            {dayEvents.slice(0, 3).map((ev, i) => (
                              <span key={i} className={`${styles.teacherDot} ${styles[`teacherDot${ev.type === 'Консультация' ? 'Blue' : ev.type === 'Хакатон' ? 'Orange' : ev.type === 'Конференция' ? 'Purple' : ev.type === 'Акселератор' ? 'Green' : 'Gray'}`]}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.teacherUpcomingCard}>
                <div className={styles.teacherUpcomingTitle}>
                  {teacherSelectedDay != null ? `Мероприятия на ${teacherSelectedDayLabel}` : 'Выберите дату'}
                </div>
                <div className={styles.teacherUpcomingList}>
                  {teacherSelectedDayEvents.map((e) => (
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
                      <div className={styles.teacherUpcomingStripe} style={{ backgroundColor: e.type === 'Консультация' ? '#2563eb' : e.type === 'Хакатон' ? '#d97706' : e.type === 'Конференция' ? '#7e22ce' : e.type === 'Акселератор' ? '#16a34a' : '#475569' }} />
                      <div className={styles.teacherUpcomingBody}>
                        <div className={styles.teacherUpcomingClock}>{e.time}</div>
                        <div className={styles.teacherUpcomingName}>{e.title}</div>
                        <div className={styles.teacherUpcomingPlace}>{e.place}</div>
                        <div className={teacherTypePillClass(e.type)}>{e.type}</div>
                      </div>
                    </div>
                  ))}
                  {teacherSelectedDay != null && !teacherSelectedDayEvents.length && (
                    <div className={styles.teacherUpcomingEmpty}>Нет мероприятий на эту дату</div>
                  )}
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

            {!teacherEditMode ? (
              <>
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
                  <button type="button" className={styles.teacherPrimaryBtn} onClick={openEditMode}>
                    Редактировать
                  </button>
                  <button type="button" className={styles.teacherPrimaryBtn} onClick={() => window.alert('Напоминание отправлено (демо)')}>
                    <img src={ChatIcon} className={styles.teacherBtnIcon} />
                    Отправить напоминание
                  </button>
                  <button type="button" className={styles.teacherSecondaryBtn} onClick={() => teacherDownloadIcs(teacherSelected)}>
                    <img src={FileIcon} className={styles.teacherBtnIcon} />
                    Экспортировать в календарь
                  </button>
                </div>

                <div className={styles.teacherApplicantsSection}>
                  <button
                    type="button"
                    className={styles.teacherSecondaryBtn}
                    onClick={() => setApplicationsOpen((prev) => !prev)}
                    style={{ marginTop: 12 }}
                  >
                    {applicationsOpen ? 'Скрыть заявки' : 'Заявки на участие'}
                  </button>

                  {applicationsOpen && (
                    <div className={styles.teacherApplicantsList}>
                      {applicationsLoading && (
                        <div className={styles.teacherUpcomingEmpty}>Загрузка заявок...</div>
                      )}
                      {!applicationsLoading && pendingApplications.length === 0 && (
                        <div className={styles.teacherUpcomingEmpty}>Нет заявок на рассмотрении</div>
                      )}
                      {pendingApplications.map((app) => (
                        <div key={app.id} className={styles.teacherApplicantRow}>
                          <div className={styles.teacherApplicantName}>{app.userName ?? app.userId}</div>
                          <div className={styles.teacherApplicantRole}>
                            {app.participantRole === 'TEAM_CREATOR' ? 'Создатель команды'
                              : app.participantRole === 'PARTICIPANT' ? 'Участник'
                              : app.participantRole ?? ''}
                          </div>
                          <div className={styles.teacherApplicantActions}>
                            <button
                              type="button"
                              className={styles.teacherSubmitBtn}
                              style={{ height: 36, fontSize: 13, padding: '0 16px' }}
                              disabled={updatingStatus}
                              onClick={() => handleApplicationDecision(app.id, 'APPROVED')}
                            >Одобрить</button>
                            <button
                              type="button"
                              className={styles.teacherCancelBtn}
                              style={{ height: 36, fontSize: 13, padding: '0 16px' }}
                              disabled={updatingStatus}
                              onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                            >Отклонить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.teacherApplicantsSection}>
                  {!deleteConfirm ? (
                    <button
                      type="button"
                      className={styles.teacherCancelBtn}
                      style={{ marginTop: 4, width: '100%' }}
                      onClick={() => setDeleteConfirm(true)}
                    >
                      Удалить мероприятие
                    </button>
                  ) : (
                    <div className={styles.teacherDeleteConfirm}>
                      <span>Удалить мероприятие безвозвратно?</span>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          className={styles.teacherCancelBtn}
                          disabled={deletingEvent}
                          onClick={handleDeleteEvent}
                        >Да, удалить</button>
                        <button
                          type="button"
                          className={styles.teacherSecondaryBtn}
                          onClick={() => { setDeleteConfirm(false); setDeleteError(''); }}
                        >Отмена</button>
                      </div>
                      {deleteError && <div className={styles.teacherEditError}>{deleteError}</div>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={styles.teacherCreateTitle}>Редактировать мероприятие</div>
                <div className={styles.teacherForm}>
                  <div className={styles.teacherField}>
                    <div className={styles.teacherLabel}>Тип мероприятия</div>
                    <select
                      className={styles.teacherSelect}
                      value={teacherEditType}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'Консультация' || v === 'Хакатон' || v === 'Конференция' || v === 'Акселератор' || v === 'Карьера' || v === 'Другое') setTeacherEditType(v);
                        else setTeacherEditType('');
                      }}
                    >
                      <option value="">Выберите тип</option>
                      <option value="Консультация">Консультация</option>
                      <option value="Хакатон">Хакатон</option>
                      <option value="Конференция">Конференция</option>
                      <option value="Акселератор">Акселератор</option>
                      <option value="Карьера">Карьера</option>
                      <option value="Другое">Другое</option>
                    </select>
                  </div>

                  <div className={styles.teacherField}>
                    <div className={styles.teacherLabel}>Название</div>
                    <input
                      className={styles.teacherInput}
                      placeholder="Введите название мероприятия"
                      value={teacherEditTitle}
                      onChange={(e) => setTeacherEditTitle(e.target.value)}
                    />
                  </div>

                  <div className={styles.teacherRow2}>
                    <div className={styles.teacherField}>
                      <div className={styles.teacherLabel}>Дата</div>
                      <input className={styles.teacherInput} type="date" value={teacherEditDate} onChange={(e) => setTeacherEditDate(e.target.value)} />
                    </div>
                    <div className={styles.teacherField}>
                      <div className={styles.teacherLabel}>Время начала</div>
                      <input className={styles.teacherInput} type="time" value={teacherEditTime} onChange={(e) => setTeacherEditTime(e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.teacherRow2}>
                    <div className={styles.teacherField}>
                      <div className={styles.teacherLabel}>Длительность (мин)</div>
                      <input className={styles.teacherInput} inputMode="numeric" value={teacherEditDuration} onChange={(e) => setTeacherEditDuration(e.target.value)} />
                    </div>
                    <div className={styles.teacherField}>
                      <div className={styles.teacherLabel}>{teacherEditOnline ? 'Ссылка для подключения' : 'Место'}</div>
                      <input
                        className={styles.teacherInput}
                        placeholder={teacherEditOnline ? 'https://zoom.us/...' : 'Кабинет 401'}
                        value={teacherEditPlace}
                        onChange={(e) => setTeacherEditPlace(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.teacherField}>
                    <div className={styles.teacherLabel}>Описание</div>
                    <textarea
                      className={styles.teacherTextarea}
                      placeholder="Добавьте описание мероприятия"
                      value={teacherEditSubtitle}
                      onChange={(e) => setTeacherEditSubtitle(e.target.value)}
                    />
                  </div>

                  <label className={styles.teacherCheckboxRow}>
                    <input type="checkbox" checked={teacherEditOnline} onChange={(e) => { setTeacherEditOnline(e.target.checked); setTeacherEditPlace(''); }} />
                    Онлайн мероприятие
                  </label>

                  <div className={styles.teacherField}>
                    <div className={styles.teacherLabel}>Статус</div>
                    <select
                      className={styles.teacherSelect}
                      value={teacherEditStatus}
                      onChange={(e) => setTeacherEditStatus(e.target.value)}
                    >
                      <option value="DRAFT">Черновик (скрыто от студентов)</option>
                      <option value="PUBLISHED">Опубликовано</option>
                      <option value="REGISTRATION_OPEN">Регистрация открыта</option>
                      <option value="COMPLETED">Завершено</option>
                      <option value="CANCELLED">Отменено</option>
                    </select>
                  </div>
                </div>

                {teacherEditError && <div className={styles.teacherCreateError}>{teacherEditError}</div>}

                <div className={styles.teacherCreateActions}>
                  <button type="button" className={styles.teacherCancelBtn} onClick={() => setTeacherEditMode(false)}>
                    Отмена
                  </button>
                  <button
                    type="button"
                    className={styles.teacherSubmitBtn}
                    onClick={submitEdit}
                    disabled={updateEventLoading}
                  >
                    {updateEventLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </>
            )}
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
                    if (v === 'Консультация' || v === 'Хакатон' || v === 'Конференция' || v === 'Акселератор' || v === 'Другое') setTeacherCreateType(v);
                    else setTeacherCreateType('');
                  }}
                >
                  <option value="">Выберите тип</option>
                  <option value="Консультация">Консультация</option>
                  <option value="Хакатон">Хакатон</option>
                  <option value="Конференция">Конференция</option>
                  <option value="Акселератор">Акселератор</option>
                  <option value="Карьера">Карьера</option>
                  <option value="Другое">Другое</option>
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
                  <div className={styles.teacherLabel}>Время начала</div>
                  <input className={styles.teacherInput} type="time" value={teacherCreateTime} onChange={(e) => setTeacherCreateTime(e.target.value)} />
                </div>
              </div>

              <div className={styles.teacherRow2}>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>Длительность (мин)</div>
                  <input className={styles.teacherInput} inputMode="numeric" value={teacherCreateDuration} onChange={(e) => setTeacherCreateDuration(e.target.value)} />
                </div>
                <div className={styles.teacherField}>
                  <div className={styles.teacherLabel}>{teacherCreateOnline ? 'Ссылка для подключения' : 'Место'}</div>
                  <input
                    className={styles.teacherInput}
                    placeholder={teacherCreateOnline ? 'https://zoom.us/...' : 'Кабинет 401'}
                    value={teacherCreatePlace}
                    onChange={(e) => setTeacherCreatePlace(e.target.value)}
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
                <input type="checkbox" checked={teacherCreateOnline} onChange={(e) => { setTeacherCreateOnline(e.target.checked); setTeacherCreatePlace(''); }} />
                Онлайн мероприятие
              </label>

              <div className={styles.teacherField}>
                <div className={styles.teacherLabel}>Статус</div>
                <select
                  className={styles.teacherSelect}
                  value={teacherCreateStatus}
                  onChange={(e) => setTeacherCreateStatus(e.target.value)}
                >
                  <option value="DRAFT">Черновик (скрыто от студентов)</option>
                  <option value="PUBLISHED">Опубликовано</option>
                  <option value="REGISTRATION_OPEN">Регистрация открыта</option>
                </select>
              </div>
            </div>

            {teacherCreateError && <div className={styles.teacherCreateError}>{teacherCreateError}</div>}

            <div className={styles.teacherCreateActions}>
              <button type="button" className={styles.teacherCancelBtn} onClick={teacherCloseCreate}>
                Отмена
              </button>
              <button
                type="button"
                className={styles.teacherSubmitBtn}
                onClick={teacherSubmitCreate}
                disabled={!teacherCreateType || !teacherCreateTitle.trim() || !teacherCreateDate || !teacherCreateTime || createEventLoading}
              >
                {createEventLoading ? 'Создание...' : 'Создать мероприятие'}
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
  PENDING_TEAM_APPROVAL: 'Ожидает одобрения команды',
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'statusPending',
  APPROVED: 'statusApproved',
  REJECTED: 'statusRejected',
  WAITLISTED: 'statusWaitlisted',
  PENDING_TEAM_APPROVAL: 'statusPending',
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
  const [applyExperience, setApplyExperience] = useState('');
  const [applyTelegram, setApplyTelegram] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [createTeamName, setCreateTeamName] = useState('');
  const [teamDecision] = useTeamDecisionMutation();

  // New state for redesigned modal
  const [applyParticipantRole, setApplyParticipantRole] = useState<'PARTICIPANT' | 'OBSERVER' | ''>('');
  const [applyPresentationTitle, setApplyPresentationTitle] = useState('');
  const [applyPresentationDescription, setApplyPresentationDescription] = useState('');
  const [hackathonMode, setHackathonMode] = useState<'create' | 'join' | null>(null);
  const [selectedJoinTeamId, setSelectedJoinTeamId] = useState<string | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  const myApplications = useMemo(
    () => (myApplicationsData ?? []).filter((a) => !userId || a.userId === userId),
    [myApplicationsData, userId]
  );
  const myApplicationByEventId = useMemo(() => {
    const map: Record<string, typeof myApplications[0]> = {};
    myApplications.forEach((a) => { map[a.eventId] = a; });
    return map;
  }, [myApplications]);

  const teamsEventId = selectedId ?? '';
  const { data: eventTeamsData } = useGetEventTeamsQuery(teamsEventId, { skip: !teamsEventId });
  const eventTeams = useMemo(() => eventTeamsData ?? [], [eventTeamsData]);

  const myTeam = useMemo(() => {
    return eventTeams.find((t) =>
      t.createdBy === userId || (t.memberUserIds ?? []).includes(userId ?? '')
    );
  }, [eventTeams, userId]);

  const isTeamLeader = useMemo(() => {
    return myTeam?.createdBy === userId;
  }, [myTeam, userId]);

  const { data: teamJoinRequestsData } = useGetTeamJoinRequestsQuery(
    { eventId: teamsEventId, teamId: myTeam?.id ?? '' },
    { skip: !isTeamLeader || !myTeam?.id || !teamsEventId }
  );
  const pendingJoinRequests = useMemo(() =>
    (teamJoinRequestsData ?? []).filter((a) => a.status === 'PENDING_TEAM_APPROVAL'),
    [teamJoinRequestsData]
  );

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
          dateISO: e.dateISO,
          endDateISO: e.endDateISO,
          organizerName: e.organizerName,
          eventType: e.eventType,
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
          dateISO: e.dateISO,
          endDateISO: e.endDateISO,
          organizerName: e.organizerName,
          eventType: e.eventType,
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
    if (tag === 'Конференция') return `${styles.pill} ${styles.pillBlue}`;
    if (tag === 'Акселератор') return `${styles.pill} ${styles.pillOrange}`;
    if (tag === 'Карьера') return `${styles.pill} ${styles.pillBlue}`;
    return `${styles.pill} ${styles.pillGreen}`;
  };

  const closeModal = () => setSelectedId(null);

  const applyModalEvent = useMemo(() => {
    if (!applyModalEventId) return undefined;
    return [...upcoming, ...past].find((e) => e.id === applyModalEventId);
  }, [applyModalEventId, upcoming, past]);

  const openApplyModal = (eventId: string) => {
    setApplyModalEventId(eventId);
    setApplyMotivation('');
    setApplySkills('');
    setApplyExperience('');
    setApplyTelegram('');
    setApplyParticipantRole('');
    setApplyPresentationTitle('');
    setApplyPresentationDescription('');
    setHackathonMode(null);
    setSelectedJoinTeamId(null);
    setTeamSearchQuery('');
    setCreateTeamName('');
    setApplyError(null);
  };

  const closeApplyModal = () => setApplyModalEventId(null);

  const submitApply = async () => {
    if (!applyModalEventId || !userId) return;
    setApplyError(null);
    const eventType = applyModalEvent?.eventType;

    try {
      if (eventType === 'Конференция' || eventType === 'Акселератор') {
        if (!applyParticipantRole) {
          setApplyError('Выберите роль: Участник или Наблюдатель');
          return;
        }
        if (applyParticipantRole === 'PARTICIPANT' && !applyPresentationTitle.trim()) {
          setApplyError('Укажите название выступления');
          return;
        }
        await applyToEvent({
          eventId: applyModalEventId,
          userId,
          participantRole: applyParticipantRole,
          presentationTitle: applyParticipantRole === 'PARTICIPANT' ? applyPresentationTitle : undefined,
          presentationDescription: applyParticipantRole === 'PARTICIPANT' ? applyPresentationDescription : undefined,
          skills: applySkills || undefined,
        }).unwrap();
      } else if (eventType === 'Хакатон') {
        if (!hackathonMode) {
          setApplyError('Выберите: создать команду или присоединиться');
          return;
        }
        if (hackathonMode === 'create') {
          if (!createTeamName.trim()) {
            setApplyError('Укажите название команды');
            return;
          }
          await applyToEvent({
            eventId: applyModalEventId,
            userId,
            participantRole: 'TEAM_CREATOR',
            teamName: createTeamName.trim(),
            motivation: applyMotivation || undefined,
            skills: applySkills || undefined,
          }).unwrap();
        } else {
          if (!selectedJoinTeamId) {
            setApplyError('Выберите команду');
            return;
          }
          await applyToEvent({
            eventId: applyModalEventId,
            userId,
            participantRole: 'TEAM_JOINER',
            teamId: selectedJoinTeamId,
            motivation: applyMotivation || undefined,
            skills: applySkills || undefined,
          }).unwrap();
        }
      } else {
        const motivationParts = [applyMotivation];
        if (applyExperience.trim()) motivationParts.push(`Опыт: ${applyExperience.trim()}`);
        if (applyTelegram.trim()) motivationParts.push(`Telegram: ${applyTelegram.trim()}`);
        const fullMotivation = motivationParts.join('\n\n');
        await applyToEvent({ eventId: applyModalEventId, userId, motivation: fullMotivation, skills: applySkills }).unwrap();
      }
      closeApplyModal();
    } catch (err: any) {
      setApplyError(err?.data?.message || 'Ошибка при подаче заявки');
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    await cancelApplication(applicationId).catch(() => {});
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
    const toIcsDate = (iso?: string) => {
      if (!iso) return null;
      return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    };
    const dtStart = toIcsDate(event.dateISO) ?? now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const dtEnd = toIcsDate(event.endDateISO) ?? dtStart;
    const safeTitle = event.title.replace(/[\r\n]+/g, ' ').trim();
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ECOPU//Events//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@ecopu.local`,
      `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${safeTitle}`,
      `DESCRIPTION:${event.description.replace(/[\r\n]+/g, ' ').trim()}`,
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
                  <NotificationBell iconSrc={BellIcon} />
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
                      {(app.participantRole === 'TEAM_CREATOR' || app.participantRole === 'TEAM_JOINER') && (
                        <div className={styles.cardDesc} style={{ marginTop: 4 }}>
                          {app.participantRole === 'TEAM_CREATOR' ? 'Создатель команды' : 'Участник команды'}
                        </div>
                      )}
                      {(statusKey === 'SUBMITTED' || statusKey === 'PENDING_TEAM_APPROVAL') && (
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
              <div className={styles.listPanelLayout}>
                <div className={styles.eventList}>
                  {!studentEventsLoading && !studentEventsError && list.length === 0 && <p className={styles.empty}>Нет данных</p>}
                  {list.map((e) => {
                    const existingApp = myApplicationByEventId[e.id];
                    const iconClass = e.tag === 'Хакатон' ? styles.iconHackathon : e.tag === 'Карьера' ? styles.iconCareer : styles.iconEducation;
                    const iconEmoji = e.tag === 'Хакатон' ? '🏆' : e.tag === 'Карьера' ? '💼' : '📚';
                    const isActive = selectedId === e.id;
                    return (
                      <div
                        key={e.id}
                        className={`${styles.eventListItem} ${isActive ? styles.eventListItemActive : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(e.id)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') setSelectedId(e.id);
                        }}
                      >
                        <div className={`${styles.eventListIcon} ${iconClass}`}>{iconEmoji}</div>
                        <div className={styles.eventListBody}>
                          <div className={styles.eventListTitle}>{e.title}</div>
                          <div className={styles.eventListDate}>{e.date} · {e.time}</div>
                        </div>
                        <div className={styles.eventListRight}>
                          <div className={pillClass(e.tag)}>{e.tag}</div>
                          {tab === 'upcoming' ? (
                            existingApp ? (
                              <div className={`${styles.pill} ${styles[STATUS_STYLES[existingApp.status] ?? 'statusPending']}`}>
                                {STATUS_LABELS[existingApp.status] ?? existingApp.status}
                              </div>
                            ) : (
                              <div className={`${styles.pill} ${styles.statusAction}`}>Регистрация</div>
                            )
                          ) : (
                            <div className={`${styles.pill} ${styles.statusRegistered}`}>Завершено</div>
                          )}
                          <span className={styles.eventListArrow}>›</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected ? (
                  <div className={styles.detailPanel}>
                    <div className={styles.cardTop}>
                      <div className={pillClass(selected.tag)}>{selected.tag}</div>
                      <div className={`${styles.pill} ${styles.pillOutline}`}>
                        {tab === 'upcoming' ? 'Предстоящее' : 'Прошедшее'}
                      </div>
                    </div>
                    <div className={styles.detailPanelTitle}>{selected.title}</div>
                    <div className={styles.detailPanelDesc}>{selected.description}</div>

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

                    {selected.organizerName && (
                      <>
                        <div className={styles.sectionLabel}>Организатор</div>
                        <div className={styles.organizerRow}>
                          <div className={styles.orgAvatar}>
                            {selected.organizerName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                          </div>
                          <div className={styles.orgName}>{selected.organizerName}</div>
                        </div>
                      </>
                    )}

                    <div className={styles.sectionLabel}>Теги</div>
                    <div className={styles.tagsRow}>
                      {selected.chips.map((c) => (
                        <div key={c} className={styles.tagChip}>
                          <img src={TagIcon} className={styles.chipIcon} />
                          {c}
                        </div>
                      ))}
                    </div>

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
                                  Отменить заявку
                                </button>
                              )}
                              {existingApp.status === 'PENDING_TEAM_APPROVAL' && (
                                <button
                                  className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                  onClick={() => handleCancelApplication(existingApp.id)}
                                >
                                  Отменить заявку
                                </button>
                              )}
                            </>
                          );
                        }
                        if (selected.tag === 'Хакатон' && myTeam?.createdBy === userId) {
                          return (
                            <div className={`${styles.pill} ${styles.statusPending}`}>
                              Ваша команда создана
                            </div>
                          );
                        }
                        return (
                          <button
                            className={`${styles.actionBtn} ${styles.primaryBtn}`}
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

                    {/* Команда — TEAM_CREATOR видит сразу после создания, TEAM_JOINER — после одобрения */}
                    {selected.tag === 'Хакатон' && myTeam && (() => {
                      const existingApp = myApplicationByEventId[selected.id];
                      const isSelfCreated = myTeam.createdBy === userId;
                      const shouldShow = existingApp && (
                        isSelfCreated
                          ? (existingApp.status === 'SUBMITTED' || existingApp.status === 'APPROVED')
                          : existingApp.status === 'APPROVED'
                      );
                      if (!shouldShow) return null;
                      return (
                        <div style={{ marginTop: 16 }}>
                          <div className={styles.sectionLabel}>Ваша команда</div>
                          <div style={{ padding: '8px 12px', background: '#f0f4ff', borderRadius: 8, marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {myTeam.name}
                              {isTeamLeader && <span style={{ marginLeft: 8, fontSize: 11, color: '#3B82F6' }}>(вы лидер)</span>}
                            </div>
                            {myTeam.memberUserIds && myTeam.memberUserIds.length > 0 && (
                              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                Участников: {myTeam.memberUserIds.length}
                              </div>
                            )}
                          </div>
                          {isTeamLeader && pendingJoinRequests.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#1B2559', marginBottom: 6 }}>
                                Заявки на вступление ({pendingJoinRequests.length})
                              </div>
                              {pendingJoinRequests.map((req) => (
                                <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                                  <span style={{ fontSize: 13 }}>{req.userName || req.userId.slice(0, 8) + '...'}</span>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                      className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                      style={{ padding: '3px 10px', fontSize: 12, height: 'auto' }}
                                      onClick={() => teamDecision({ id: req.id, status: 'APPROVED' })}
                                    >
                                      Принять
                                    </button>
                                    <button
                                      className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                      style={{ padding: '3px 10px', fontSize: 12, height: 'auto' }}
                                      onClick={() => teamDecision({ id: req.id, status: 'REJECTED' })}
                                    >
                                      Отклонить
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className={styles.detailPanel}>
                    <div className={styles.detailPanelPlaceholder}>Выберите мероприятие из списка</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {applyModalEventId && applyModalEvent && (
        <div className={styles.modalOverlay} onClick={closeApplyModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle} style={{ fontSize: 18 }}>Регистрация на мероприятие</div>
              <button className={styles.closeBtn} onClick={closeApplyModal} aria-label="Закрыть">
                <img src={CloseIcon} className={styles.closeIcon} />
              </button>
            </div>

            {/* === Конференция / Акселератор / Карьера === */}
            {(applyModalEvent.eventType === 'Конференция' || applyModalEvent.eventType === 'Акселератор') && (
              <>
                <div className={styles.teacherField} style={{ marginTop: 16 }}>
                  <div className={styles.teacherLabel}>Роль участия *</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="participantRole" value="PARTICIPANT" checked={applyParticipantRole === 'PARTICIPANT'} onChange={() => setApplyParticipantRole('PARTICIPANT')} />
                      Участник
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="participantRole" value="OBSERVER" checked={applyParticipantRole === 'OBSERVER'} onChange={() => setApplyParticipantRole('OBSERVER')} />
                      Наблюдатель
                    </label>
                  </div>
                </div>
                {applyParticipantRole === 'PARTICIPANT' && (
                  <>
                    <div className={styles.teacherField} style={{ marginTop: 12 }}>
                      <div className={styles.teacherLabel}>Название выступления *</div>
                      <input
                        className={styles.teacherInput}
                        placeholder="Тема вашего доклада"
                        value={applyPresentationTitle}
                        onChange={(e) => setApplyPresentationTitle(e.target.value)}
                      />
                    </div>
                    <div className={styles.teacherField} style={{ marginTop: 12 }}>
                      <div className={styles.teacherLabel}>Краткое описание</div>
                      <textarea
                        className={styles.teacherTextarea}
                        placeholder="Опишите содержание выступления"
                        value={applyPresentationDescription}
                        onChange={(e) => setApplyPresentationDescription(e.target.value)}
                        rows={3}
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
                  </>
                )}
              </>
            )}

            {/* === Хакатон === */}
            {applyModalEvent.eventType === 'Хакатон' && (
              <>
                <div className={styles.teacherField} style={{ marginTop: 16 }}>
                  <div className={styles.teacherLabel}>Команда *</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="hackathonMode" value="create" checked={hackathonMode === 'create'} onChange={() => { setHackathonMode('create'); setSelectedJoinTeamId(null); }} />
                      Создать команду
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="hackathonMode" value="join" checked={hackathonMode === 'join'} onChange={() => { setHackathonMode('join'); setCreateTeamName(''); }} />
                      Присоединиться
                    </label>
                  </div>
                </div>
                {hackathonMode === 'create' && (
                  <div className={styles.teacherField} style={{ marginTop: 12 }}>
                    <div className={styles.teacherLabel}>Название команды *</div>
                    <input
                      className={styles.teacherInput}
                      placeholder="Придумайте название"
                      value={createTeamName}
                      onChange={(e) => setCreateTeamName(e.target.value)}
                    />
                  </div>
                )}
                {hackathonMode === 'join' && (
                  <div className={styles.teacherField} style={{ marginTop: 12 }}>
                    <div className={styles.teacherLabel}>Выберите команду *</div>
                    <input
                      className={styles.teacherInput}
                      placeholder="Поиск по названию..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                      {eventTeams
                        .filter((t) => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((team) => (
                          <div
                            key={team.id}
                            onClick={() => setSelectedJoinTeamId(team.id)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: 13,
                              background: selectedJoinTeamId === team.id ? '#dbeafe' : 'transparent',
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            {team.name}
                            <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
                              ({(team.memberUserIds ?? []).length} чел.)
                            </span>
                          </div>
                        ))}
                      {eventTeams.filter((t) => t.name.toLowerCase().includes(teamSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: 13, color: '#94a3b8' }}>Команд не найдено</div>
                      )}
                    </div>
                  </div>
                )}
                {hackathonMode && (
                  <>
                    <div className={styles.teacherField} style={{ marginTop: 12 }}>
                      <div className={styles.teacherLabel}>Мотивация</div>
                      <textarea
                        className={styles.teacherTextarea}
                        placeholder="Расскажите, почему хотите участвовать"
                        value={applyMotivation}
                        onChange={(e) => setApplyMotivation(e.target.value)}
                        rows={3}
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
                  </>
                )}
              </>
            )}

            {/* === Консультация / Другое / default === */}
            {applyModalEvent.eventType !== 'Конференция' && applyModalEvent.eventType !== 'Акселератор' && applyModalEvent.eventType !== 'Хакатон' && (
              <>
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
                <div className={styles.teacherField} style={{ marginTop: 12 }}>
                  <div className={styles.teacherLabel}>Опыт участия</div>
                  <textarea
                    className={styles.teacherTextarea}
                    placeholder="Расскажите о вашем опыте в похожих мероприятиях"
                    value={applyExperience}
                    onChange={(e) => setApplyExperience(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className={styles.teacherField} style={{ marginTop: 12 }}>
                  <div className={styles.teacherLabel}>Контактный Telegram</div>
                  <input
                    className={styles.teacherInput}
                    placeholder="@username"
                    value={applyTelegram}
                    onChange={(e) => setApplyTelegram(e.target.value)}
                  />
                </div>
              </>
            )}

            {applyError && <p style={{ color: '#e53935', fontSize: 13, marginTop: 8 }}>{applyError}</p>}
            <div className={styles.teacherCreateActions} style={{ marginTop: 20 }}>
              <button className={styles.teacherCancelBtn} onClick={closeApplyModal}>Отмена</button>
              <button
                className={styles.teacherSubmitBtn}
                onClick={submitApply}
                disabled={applyLoading}
              >
                {applyLoading ? 'Отправка...' : 'Зарегистрироваться'}
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

  if (userRole === 'Заведующий кафедрой') return <Navigate to="/schedule" replace />;
  if (userRole === 'Преподаватель') return <TeacherEventsView avatarInitials={avatarInitials} />;
  return <StudentEventsView avatarInitials={avatarInitials} />;
};

export default EventsPage;
