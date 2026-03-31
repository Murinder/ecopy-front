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
  participants: string[];
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

  const [teacherEvents, setTeacherEvents] = useState<TeacherEvent[]>(() => [
    {
      id: 't-e1',
      type: 'Консультация',
      title: 'Консультация по дипломному проекту',
      subtitle: 'Обсуждение архитектуры проекта и текущего прогресса',
      dateISO: '2025-11-15',
      time: '14:00',
      durationMin: 60,
      place: 'Кабинет 401',
      participants: ['Иван Иванов'],
    },
    {
      id: 't-e2',
      type: 'Защита',
      title: 'Защита курсовых проектов',
      subtitle: 'Промежуточная защита результатов и обратная связь',
      dateISO: '2025-11-20',
      time: '10:00',
      durationMin: 90,
      place: 'Аудитория 305',
      participants: ['Мария Петрова', 'Алексей Сидоров'],
    },
    {
      id: 't-e3',
      type: 'Семинар',
      title: "Семинар 'React'",
      subtitle: 'Разбор практик и архитектурных решений',
      dateISO: '2025-11-18',
      time: '16:00',
      durationMin: 90,
      place: 'Онлайн (Zoom)',
      participants: ['Екатерина Андреева', 'Никита Кузнецов'],
    },
    {
      id: 't-e4',
      type: 'Лекция',
      title: "Лекция 'Алгоритмы'",
      subtitle: 'Алгоритмы и структуры данных: повторение и задачи',
      dateISO: '2025-11-17',
      time: '12:00',
      durationMin: 60,
      place: 'Аудитория 201',
      participants: ['Группа ПИ-21-1'],
    },
    {
      id: 't-e5',
      type: 'Консультация',
      title: 'Консультация по проекту',
      subtitle: 'Согласование плана работ на неделю',
      dateISO: '2025-11-16',
      time: '15:00',
      durationMin: 45,
      place: 'Кабинет 401',
      participants: ['Иван Иванов'],
    },
  ]);

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
    const participants = teacherCreateParticipants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
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
        participants,
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
                <div className={styles.notifBadge}>7</div>
              </div>
              <div className={styles.avatar}>{avatarInitials}</div>
            </div>
          </div>

          <div className={styles.main}>
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
                  <div className={styles.teacherInfoValue}>{teacherSelected.participants.length}</div>
                </div>
              </div>
            </div>

            <div className={styles.teacherSectionTitle}>Участники</div>
            <div className={styles.teacherParticipants}>
              {teacherSelected.participants.map((p) => (
                <div key={p} className={styles.teacherParticipantRow}>
                  <div className={styles.teacherParticipantAvatar}>{initialsFromName(p)}</div>
                  <div className={styles.teacherParticipantName}>{p}</div>
                </div>
              ))}
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

const StudentEventsView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const upcoming = useMemo<EventItem[]>(
    () => [
      {
        id: 'e1',
        tag: 'Хакатон',
        title: 'Tech Innovation Hackathon 2025',
        description:
          '48-часовой хакатон с фокусом на AI и ML технологии. Участвуйте в командах до 5 человек.',
        date: '20 ноября 2025 г.',
        time: '10:00',
        place: 'Главный корпус, Аудитория 401',
        participants: '78/100 участников',
        chips: ['AI', 'ML'],
        isRegistered: true,
      },
      {
        id: 'e2',
        tag: 'Карьера',
        title: "Карьерная ярмарка 'IT Future'",
        description:
          'Встреча с представителями ведущих IT-компаний. Узнайте о вакансиях, стажировках и проектах.',
        date: '25 ноября 2025 г.',
        time: '14:00',
        place: 'Конференц-зал',
        participants: '145/200 участников',
        chips: ['Карьера', 'Стажировки'],
      },
      {
        id: 'e3',
        tag: 'Обучение',
        title: 'Мастер-класс: React и современный Frontend',
        description:
          'Практический мастер-класс по разработке современных веб-приложений с фокусом на архитектуру и UX.',
        date: '28 ноября 2025 г.',
        time: '16:00',
        place: 'Онлайн (Zoom)',
        participants: '56/80 участников',
        chips: ['React', 'Frontend'],
        isRegistered: true,
      },
    ],
    []
  );

  const past = useMemo<EventItem[]>(
    () => [
      {
        id: 'p1',
        tag: 'Карьера',
        title: 'Вебинар: Портфолио для Junior-разработчика',
        description: 'Разбор кейсов, структура портфолио и типовые ошибки.',
        date: '05 октября 2025 г.',
        time: '18:30',
        place: 'Онлайн',
        participants: '220/220 участников',
        chips: ['Карьера'],
        isRegistered: true,
      },
      {
        id: 'p2',
        tag: 'Обучение',
        title: 'Лекция: Основы алгоритмов и структур данных',
        description: 'Базовые структуры данных и практические примеры.',
        date: '12 сентября 2025 г.',
        time: '12:00',
        place: 'Аудитория 105',
        participants: '90/120 участников',
        chips: ['CS'],
        isRegistered: true,
      },
    ],
    []
  );

  const [registered, setRegistered] = useState<Record<string, boolean>>(() => {
    const r: Record<string, boolean> = {};
    [...upcoming, ...past].forEach((e) => {
      if (e.isRegistered) r[e.id] = true;
    });
    return r;
  });

  const list = tab === 'upcoming' ? upcoming : past;
  const counts = { upcoming: upcoming.length, past: past.length };
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
                  <div className={styles.notifBadge}>3</div>
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
            </div>

            <div className={styles.grid}>
              {list.map((e, idx) => {
                const isReg = !!registered[e.id];
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
                        isReg ? (
                          <div className={`${styles.pill} ${styles.statusRegistered}`}>Зарегистрирован</div>
                        ) : (
                          <div
                            className={`${styles.pill} ${styles.statusAction}`}
                            role="button"
                            tabIndex={0}
                            onClick={(clickEv) => {
                              clickEv.stopPropagation();
                              setRegistered((p) => ({ ...p, [e.id]: true }));
                            }}
                            onKeyDown={(ev) => {
                              if (ev.key === 'Enter' || ev.key === ' ') {
                                ev.stopPropagation();
                                setRegistered((p) => ({ ...p, [e.id]: true }));
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

            <div className={styles.modalActions}>
              {registered[selected.id] ? (
                <button
                  className={`${styles.actionBtn} ${styles.dangerBtn}`}
                  onClick={() => setRegistered((p) => ({ ...p, [selected.id]: false }))}
                >
                  ⨯ Отменить регистрацию
                </button>
              ) : (
                <button
                  className={`${styles.actionBtn} ${styles.mutedBtn}`}
                  onClick={() => setRegistered((p) => ({ ...p, [selected.id]: true }))}
                >
                  Зарегистрироваться
                </button>
              )}
              <button className={`${styles.actionBtn} ${styles.mutedBtn}`} onClick={() => downloadIcs(selected)}>
                Добавить в календарь
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
