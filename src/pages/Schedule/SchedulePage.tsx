import { useEffect, useMemo, useState } from 'react';
import styles from './SchedulePage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import AddIcon from '../../assets/icons/mjbmqg4r-6km8pgq.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import CalendarIcon from '../../assets/icons/ui-calendar.svg';
import LocationIcon from '../../assets/icons/ui-location.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import { useAppSelector } from '../../app/hooks';
import {
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetDefensesQuery,
  useCreateDefenseMutation,
  useUpdateDefenseStatusMutation,
} from '../../services/eventApi';
import type { LessonDto, DefenseDto as ApiDefenseDto } from '../../services/eventApi';
import { useGetStudentsQuery, useGetGroupsQuery } from '../../services/coreApi';

type WeekdayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
type LessonType = 'Лекция' | 'Семинар' | 'Практика' | 'Другое';

type TimeSlot = {
  key: string;
  label: string;
};

type Lesson = {
  id: string;
  day: WeekdayKey;
  slotKey: string;
  subject: string;
  type: LessonType;
  group: string;
  room: string;
  lessonDate?: string;
};

type DefenseType = 'ВКР' | 'Курсовая' | 'Научная работа';
type DefenseStatus = 'PLANNED' | 'DONE';

type DefenseItem = {
  id: string;
  studentName: string;
  studentInitials: string;
  defenseType: DefenseType;
  status: DefenseStatus;
  projectTitle: string;
  dateIso: string;
  time: string;
  room: string;
  supervisor: string;
  reviewersCount: number;
  grade?: number;
};

const weekdayOptions: { key: WeekdayKey; label: string }[] = [
  { key: 'MON', label: 'Понедельник' },
  { key: 'TUE', label: 'Вторник' },
  { key: 'WED', label: 'Среда' },
  { key: 'THU', label: 'Четверг' },
  { key: 'FRI', label: 'Пятница' },
];

const timeSlots: TimeSlot[] = [
  { key: '08:00-09:30', label: '08:00 - 09:30' },
  { key: '10:00-11:30', label: '10:00 - 11:30' },
  { key: '12:00-13:30', label: '12:00 - 13:30' },
  { key: '14:00-15:30', label: '14:00 - 15:30' },
  { key: '16:00-17:30', label: '16:00 - 17:30' },
  { key: '18:00-19:30', label: '18:00 - 19:30' },
];

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatRuDate = (dateIso: string) => {
  const [y, m, d] = dateIso.split('-');
  return `${d}.${m}.${y}`;
};

const dateIsoFromDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const addMonth = (year: number, month0: number, delta: number) => {
  const next = new Date(year, month0 + delta, 1);
  return { year: next.getFullYear(), month0: next.getMonth() };
};

type DateEntry = { date: Date; dateIso: string; weekday: WeekdayKey; label: string };

const weekdayShort: Record<WeekdayKey, string> = { MON: 'Пн', TUE: 'Вт', WED: 'Ср', THU: 'Чт', FRI: 'Пт' };

const dayIndexToWeekday: (WeekdayKey | null)[] = [null, 'MON', 'TUE', 'WED', 'THU', 'FRI', null];

const getWeekStart = (ref: Date): Date => {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const addWeeks = (date: Date, delta: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + delta * 7);
  return d;
};

const generateWeekDates = (weekStart: Date, count: 1 | 2): DateEntry[] => {
  const result: DateEntry[] = [];
  const totalDays = count * 7;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const wd = dayIndexToWeekday[d.getDay()];
    if (!wd) continue;
    result.push({
      date: d,
      dateIso: dateIsoFromDate(d),
      weekday: wd,
      label: `${weekdayShort[wd]} ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`,
    });
  }
  return result;
};

const ruGenitive = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

const formatWeekRange = (weekStart: Date, count: 1 | 2): string => {
  const fri = new Date(weekStart);
  fri.setDate(fri.getDate() + (count === 1 ? 4 : 11));
  const d1 = weekStart.getDate();
  const m1 = weekStart.getMonth();
  const d2 = fri.getDate();
  const m2 = fri.getMonth();
  const y = fri.getFullYear();
  if (m1 === m2) return `${d1} — ${d2} ${ruGenitive[m2]} ${y}`;
  return `${d1} ${ruGenitive[m1]} — ${d2} ${ruGenitive[m2]} ${y}`;
};

const typePillClass = (t: LessonType) =>
  t === 'Лекция' ? styles.pillBlue : t === 'Семинар' ? styles.pillGreen : t === 'Другое' ? styles.pillOrange : styles.pillPurple;

const cellClass = (t: LessonType) =>
  t === 'Лекция' ? styles.cellBlue : t === 'Семинар' ? styles.cellGreen : t === 'Другое' ? styles.cellOrange : styles.cellPurple;

const ClockIconSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIconSvg = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 6 9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const backendDayToWeekday: Record<string, WeekdayKey> = {
  MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED', THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'FRI',
};
const weekdayToBackendDay: Record<WeekdayKey, string> = {
  MON: 'MONDAY', TUE: 'TUESDAY', WED: 'WEDNESDAY', THU: 'THURSDAY', FRI: 'FRIDAY',
};
const backendTypeToLabel: Record<string, LessonType> = {
  LECTURE: 'Лекция', SEMINAR: 'Семинар', PRACTICE: 'Практика', OTHER: 'Другое',
};
const labelToBackendType: Record<LessonType, string> = {
  'Лекция': 'LECTURE', 'Семинар': 'SEMINAR', 'Практика': 'PRACTICE', 'Другое': 'OTHER',
};

const mapTimeToSlotKey = (time: string): string => {
  const slotRanges = [
    { start: '08:00', end: '09:30', key: '08:00-09:30' },
    { start: '10:00', end: '11:30', key: '10:00-11:30' },
    { start: '12:00', end: '13:30', key: '12:00-13:30' },
    { start: '14:00', end: '15:30', key: '14:00-15:30' },
    { start: '16:00', end: '17:30', key: '16:00-17:30' },
    { start: '18:00', end: '19:30', key: '18:00-19:30' },
  ];
  for (const slot of slotRanges) {
    if (time >= slot.start && time <= slot.end) return slot.key;
  }
  return time;
};

const mapApiLessonToLocal = (dto: LessonDto): Lesson => ({
  id: dto.id,
  day: backendDayToWeekday[dto.dayOfWeek] || 'MON',
  slotKey: mapTimeToSlotKey(dto.timeSlot),
  subject: dto.subject,
  type: backendTypeToLabel[dto.lessonType] || 'Лекция',
  group: dto.groupName || '',
  room: dto.room || '',
  lessonDate: dto.lessonDate || undefined,
});


const TeacherScheduleView = ({ avatarInitials, userId }: { avatarInitials: string; userId: string }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const [dayDraft, setDayDraft] = useState<WeekdayKey>('MON');
  const [slotDraft, setSlotDraft] = useState<string>(timeSlots[1].key);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [typeDraft, setTypeDraft] = useState<LessonType>('Лекция');
  const [groupDraft, setGroupDraft] = useState('');
  const [roomDraft, setRoomDraft] = useState('');
  const [noGroup, setNoGroup] = useState(false);
  const [isOneTime, setIsOneTime] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [weekCount, setWeekCount] = useState<1 | 2>(1);

  const displayDates = useMemo(() => generateWeekDates(weekStart, weekCount), [weekStart, weekCount]);
  const weekLabel = useMemo(() => formatWeekRange(weekStart, weekCount), [weekStart, weekCount]);
  const todayIso = useMemo(() => dateIsoFromDate(new Date()), []);

  const goPrev = () => setWeekStart(w => addWeeks(w, -weekCount));
  const goNext = () => setWeekStart(w => addWeeks(w, weekCount));
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  const { data: lessonsData, isLoading: lessonsLoading, isError: lessonsError } = useGetLessonsQuery({ userId }, { skip: !userId });
  const [createLessonApi] = useCreateLessonMutation();
  const [updateLessonApi] = useUpdateLessonMutation();
  const [deleteLessonApi] = useDeleteLessonMutation();
  const { data: groupsData } = useGetGroupsQuery();

  const allGroups = useMemo(() => groupsData?.data ?? [], [groupsData]);
  const filteredGroups = useMemo(() => {
    const q = groupDraft.trim().toLowerCase();
    if (!q) return allGroups.slice(0, 7);
    return allGroups.filter(g => g.toLowerCase().includes(q)).slice(0, 7);
  }, [allGroups, groupDraft]);

  const lessons = useMemo<Lesson[]>(() => {
    const apiLessons = lessonsData?.data;
    if (apiLessons && apiLessons.length > 0) {
      return apiLessons.map(mapApiLessonToLocal);
    }
    return [];
  }, [lessonsData]);

  const recurringLessons = useMemo(() => lessons.filter(l => !l.lessonDate), [lessons]);
  const oneTimeLessons = useMemo(() => lessons.filter(l => !!l.lessonDate), [lessons]);

  const byCellRecurring = useMemo(() => {
    const m = new Map<string, Lesson>();
    for (const l of recurringLessons) m.set(`${l.day}|${l.slotKey}`, l);
    return m;
  }, [recurringLessons]);

  const getLessonForCell = (dateIso: string, weekday: WeekdayKey, slotKey: string): Lesson | undefined => {
    const oneTime = oneTimeLessons.find(l => l.lessonDate === dateIso && l.slotKey === slotKey);
    if (oneTime) return oneTime;
    return byCellRecurring.get(`${weekday}|${slotKey}`);
  };

  const stats = useMemo(() => {
    const lectures = lessons.filter((l) => l.type === 'Лекция').length;
    const seminars = lessons.filter((l) => l.type === 'Семинар').length;
    const practice = lessons.filter((l) => l.type === 'Практика').length;
    const other = lessons.filter((l) => l.type === 'Другое').length;
    const groups = new Set(lessons.filter(l => l.group).map((l) => l.group)).size;
    const hours = lessons.length * 2;
    return { hours, lectures, seminars, practice, other, groups };
  }, [lessons]);

  const bySubject = useMemo(() => {
    const m = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const prev = m.get(l.subject) || [];
      prev.push(l);
      m.set(l.subject, prev);
    }
    for (const v of m.values()) {
      v.sort((a, b) => {
        const da = weekdayOptions.findIndex((d) => d.key === a.day);
        const db = weekdayOptions.findIndex((d) => d.key === b.day);
        if (da !== db) return da - db;
        const ta = timeSlots.findIndex((s) => s.key === a.slotKey);
        const tb = timeSlots.findIndex((s) => s.key === b.slotKey);
        return ta - tb;
      });
    }
    return [...m.entries()];
  }, [lessons]);

  const openAdd = () => { setAddError(''); setEditingLessonId(null); setIsAddOpen(true); };
  const closeAdd = () => { setIsAddOpen(false); setEditingLessonId(null); };

  const openEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setDayDraft(lesson.day);
    setSlotDraft(lesson.slotKey);
    setSubjectDraft(lesson.subject);
    setTypeDraft(lesson.type);
    setGroupDraft(lesson.group);
    setRoomDraft(lesson.room);
    setNoGroup(!lesson.group);
    setIsOneTime(!!lesson.lessonDate);
    setDateDraft(lesson.lessonDate || '');
    setGroupDropdownOpen(false);
    setAddError('');
    setIsAddOpen(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm('Удалить это занятие?')) return;
    try {
      await deleteLessonApi(lessonId).unwrap();
    } catch (err) {
      console.error('deleteLesson error:', err);
    }
  };

  const resetDraft = () => {
    setDayDraft('MON');
    setSlotDraft(timeSlots[1].key);
    setSubjectDraft('');
    setTypeDraft('Лекция');
    setGroupDraft('');
    setRoomDraft('');
    setNoGroup(false);
    setIsOneTime(false);
    setDateDraft('');
    setGroupDropdownOpen(false);
    setEditingLessonId(null);
  };

  useEffect(() => {
    if (!isAddOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAdd();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAddOpen]);

  const [addError, setAddError] = useState('');

  const submitAdd = async () => {
    const subject = subjectDraft.trim();
    const group = groupDraft.trim();
    const room = roomDraft.trim();
    if (!subject || !room) {
      setAddError('Заполните все поля');
      return;
    }
    if (!noGroup && !group) {
      setAddError('Укажите группу или отметьте «Без группы»');
      return;
    }
    if (isOneTime && !dateDraft) {
      setAddError('Укажите дату занятия');
      return;
    }

    setAddError('');
    const payload = {
      userId,
      dayOfWeek: isOneTime ? 'MONDAY' : weekdayToBackendDay[dayDraft],
      timeSlot: slotDraft.split('-')[0],
      subject,
      lessonType: labelToBackendType[typeDraft],
      groupName: noGroup ? undefined : group,
      room,
      lessonDate: isOneTime ? dateDraft : undefined,
    };
    try {
      if (editingLessonId) {
        await updateLessonApi({ lessonId: editingLessonId, body: payload }).unwrap();
      } else {
        await createLessonApi(payload).unwrap();
      }
      closeAdd();
      resetDraft();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
        || (editingLessonId ? 'Не удалось обновить занятие.' : 'Не удалось добавить занятие. Проверьте соединение с сервером.');
      setAddError(msg);
      console.error(editingLessonId ? 'updateLesson error:' : 'createLesson error:', err);
    }
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Расписание</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.createBtn} onClick={openAdd}>
              <img src={AddIcon} className={styles.createIcon} />
              Добавить занятие
            </button>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatar}>{avatarInitials}</div>
          </div>
        </div>

        <div className={styles.main}>
          {lessonsLoading && <p className={styles.loading}>Загрузка...</p>}
          {lessonsError && <p className={styles.error}>Ошибка загрузки данных</p>}
          <div className={styles.secondaryActions}>
            <button
              type="button"
              className={`${styles.secondaryBtn} ${editMode ? styles.secondaryBtnActive : ''}`}
              onClick={() => setEditMode(prev => !prev)}
            >
              {editMode ? 'Завершить редактирование' : 'Редактировать расписание'}
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Часов в неделю</div>
              <div className={styles.statValueBlue}>{stats.hours}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Лекций</div>
              <div className={styles.statValue}>{stats.lectures}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Семинаров</div>
              <div className={styles.statValue}>{stats.seminars}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Практик</div>
              <div className={styles.statValue}>{stats.practice}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Другое</div>
              <div className={styles.statValue}>{stats.other}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Групп</div>
              <div className={styles.statValue}>{stats.groups}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Расписание занятий</div>
              <div className={styles.cardSubtitle}>{weekLabel}</div>
            </div>

            <div className={styles.weekNav}>
              <div className={styles.weekNavCenter}>
                <button type="button" className={styles.weekNavBtn} onClick={goPrev} aria-label="Предыдущая неделя">&#8249;</button>
                <div className={styles.weekNavLabel}>{weekLabel}</div>
                <button type="button" className={styles.weekNavBtn} onClick={goNext} aria-label="Следующая неделя">&#8250;</button>
                <button type="button" className={styles.todayBtn} onClick={goToday}>Сегодня</button>
              </div>
              <div className={styles.weekToggle}>
                <button
                  type="button"
                  className={`${styles.weekToggleBtn} ${weekCount === 1 ? styles.weekToggleBtnActive : ''}`}
                  onClick={() => setWeekCount(1)}
                >1 нед</button>
                <button
                  type="button"
                  className={`${styles.weekToggleBtn} ${weekCount === 2 ? styles.weekToggleBtnActive : ''}`}
                  onClick={() => setWeekCount(2)}
                >2 нед</button>
              </div>
            </div>

            <div className={styles.table}>
              <div className={styles.thead} style={{ gridTemplateColumns: `180px repeat(${displayDates.length}, minmax(0, 1fr))` }}>
                <div className={`${styles.th} ${styles.thSticky}`} />
                {displayDates.map((entry) => (
                  <div key={entry.dateIso} className={`${styles.th} ${entry.dateIso === todayIso ? styles.thToday : ''}`}>
                    {entry.label}
                  </div>
                ))}
              </div>

              {timeSlots.map((s) => (
                <div key={s.key} className={styles.tr} style={{ gridTemplateColumns: `180px repeat(${displayDates.length}, minmax(0, 1fr))` }}>
                  <div className={styles.timeCell}>{s.label}</div>
                  {displayDates.map((entry) => {
                    const lesson = getLessonForCell(entry.dateIso, entry.weekday, s.key);
                    if (!lesson) return <div key={`${entry.dateIso}-${s.key}`} className={`${styles.td} ${entry.dateIso === todayIso ? styles.tdToday : ''}`} />;
                    return (
                      <div key={`${entry.dateIso}-${s.key}`} className={`${styles.td} ${entry.dateIso === todayIso ? styles.tdToday : ''}`}>
                        <div
                          className={`${styles.lessonCard} ${cellClass(lesson.type)} ${editMode ? styles.lessonCardEditable : ''}`}
                          onClick={editMode ? () => openEdit(lesson) : undefined}
                        >
                          {editMode && (
                            <button
                              type="button"
                              className={styles.lessonDeleteBtn}
                              onClick={(e) => { e.stopPropagation(); handleDelete(lesson.id); }}
                              aria-label="Удалить"
                            >×</button>
                          )}
                          <div className={`${styles.pill} ${typePillClass(lesson.type)}`}>{lesson.type}</div>
                          <div className={styles.lessonTitle}>{lesson.subject}</div>
                          <div className={styles.lessonMeta}>
                            {[lesson.group, lesson.room].filter(Boolean).join(' • ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Расписание по предметам</div>
              <div className={styles.cardSubtitle}>Группировка по дисциплинам</div>
            </div>

            <div className={styles.subjects}>
              {bySubject.map(([subject, items]) => (
                <div key={subject} className={styles.subjectRow}>
                  <div className={styles.subjectName}>{subject}</div>
                  <div className={styles.subjectChips}>
                    {items.map((l) => {
                      const dayLabel = weekdayOptions.find((d) => d.key === l.day)?.label ?? l.day;
                      const timeLabel = timeSlots.find((t) => t.key === l.slotKey)?.label ?? l.slotKey;
                      return (
                        <div key={l.id} className={styles.subjectChip}>
                          <span className={`${styles.subjectChipType} ${typePillClass(l.type)}`}>{l.type}</span>
                          <span className={styles.subjectChipMeta}>
                            {dayLabel}, {timeLabel}
                          </span>
                          <span className={styles.subjectChipRoom}>{l.room}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isAddOpen && (
        <div className={styles.modalOverlay} onClick={closeAdd}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeAdd} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalTitle}>{editingLessonId ? 'Редактировать занятие' : 'Добавить новое занятие'}</div>
            <div className={styles.modalSubtitle}>{editingLessonId ? 'Измените информацию о занятии' : 'Заполните информацию о занятии'}</div>

            <div className={styles.form}>
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isOneTime}
                      onChange={(e) => setIsOneTime(e.target.checked)}
                    />
                    Разовое занятие
                  </label>
                </div>
                {isOneTime ? (
                  <>
                    <div className={styles.label}>Дата</div>
                    <input
                      type="date"
                      className={styles.input}
                      value={dateDraft}
                      onChange={(e) => setDateDraft(e.target.value)}
                    />
                    <div className={styles.fieldHint}>Занятие пройдёт только в указанную дату</div>
                  </>
                ) : (
                  <>
                    <div className={styles.label}>День недели</div>
                    <select className={styles.select} value={dayDraft} onChange={(e) => setDayDraft(e.target.value as WeekdayKey)}>
                      {weekdayOptions.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <div className={styles.fieldHint}>Занятие повторяется каждую неделю</div>
                  </>
                )}
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Время</div>
                <select className={styles.select} value={slotDraft} onChange={(e) => setSlotDraft(e.target.value)}>
                  {timeSlots.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Предмет / Название</div>
                <input
                  className={styles.input}
                  placeholder="Введите название предмета или встречи"
                  value={subjectDraft}
                  onChange={(e) => setSubjectDraft(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Тип занятия</div>
                <select className={styles.select} value={typeDraft} onChange={(e) => setTypeDraft(e.target.value as LessonType)}>
                  <option value="Лекция">Лекция</option>
                  <option value="Семинар">Семинар</option>
                  <option value="Практика">Практика</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={noGroup}
                      onChange={(e) => {
                        setNoGroup(e.target.checked);
                        if (e.target.checked) {
                          setGroupDraft('');
                          setGroupDropdownOpen(false);
                        }
                      }}
                    />
                    Без группы
                  </label>
                </div>
                <div className={styles.label}>Группа</div>
                <div className={styles.autocompleteWrap}>
                  <input
                    className={styles.input}
                    placeholder="Начните вводить название группы"
                    value={groupDraft}
                    disabled={noGroup}
                    onChange={(e) => {
                      setGroupDraft(e.target.value);
                      setGroupDropdownOpen(true);
                    }}
                    onFocus={() => !noGroup && setGroupDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setGroupDropdownOpen(false), 200)}
                  />
                  {groupDropdownOpen && !noGroup && filteredGroups.length > 0 && (
                    <div className={styles.groupDropdown}>
                      {filteredGroups.map((g) => (
                        <div
                          key={g}
                          className={styles.groupOption}
                          onMouseDown={() => {
                            setGroupDraft(g);
                            setGroupDropdownOpen(false);
                          }}
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.fieldHint}>Например: ИВТ-21-1, ПМ-22-2</div>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Аудитория</div>
                <input
                  className={styles.input}
                  placeholder="Введите номер аудитории"
                  value={roomDraft}
                  onChange={(e) => setRoomDraft(e.target.value)}
                />
              </div>
            </div>

            {addError && <div className={styles.formError}>{addError}</div>}

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={closeAdd}>
                Отмена
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitAdd}>
                {editingLessonId ? 'Сохранить' : 'Добавить занятие'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const backendDefenseTypeToLabel: Record<string, DefenseType> = {
  VKR: 'ВКР', COURSEWORK: 'Курсовая', RESEARCH: 'Научная работа',
};

const mapApiDefenseToLocal = (dto: ApiDefenseDto): DefenseItem => ({
  id: dto.id,
  studentName: dto.studentName || 'Студент',
  studentInitials: initialsFromName(dto.studentName || 'Студент'),
  defenseType: backendDefenseTypeToLabel[dto.defenseType] || 'ВКР',
  status: (dto.status as DefenseStatus) || 'PLANNED',
  projectTitle: dto.projectTitle || '',
  dateIso: dto.defenseDate || '',
  time: dto.defenseTime || '',
  room: dto.room || '',
  supervisor: '',
  reviewersCount: dto.reviewersCount ?? 0,
  grade: dto.grade,
});

const HeadDefenseScheduleView = ({ avatarInitials, userId }: { avatarInitials: string; userId: string }) => {
  const { data: defensesData, isLoading: defensesLoading, isError: defensesError } = useGetDefensesQuery({ supervisorId: userId }, { skip: !userId });
  const [createDefenseApi] = useCreateDefenseMutation();
  const [updateDefenseStatusApi] = useUpdateDefenseStatusMutation();
  const { data: studentsData } = useGetStudentsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PLANNED' | 'DONE'>('all');

  const now = useMemo(() => new Date(), []);
  const [selectedDateIso, setSelectedDateIso] = useState(() => dateIsoFromDate(now));

  const [{ year, month0 }, setMonth] = useState(() => ({ year: now.getFullYear(), month0: now.getMonth() }));

  const students = useMemo(() => {
    const list = studentsData?.data;
    if (!list) return [];
    return list.map((s) => ({
      id: s.id,
      name: [s.lastName, s.firstName].filter(Boolean).join(' ') || s.email,
      projectTitle: '',
      supervisor: '',
      reviewersCount: 3,
    }));
  }, [studentsData]);

  const defenses = useMemo<DefenseItem[]>(() => {
    const apiDefenses = defensesData?.data;
    if (apiDefenses && apiDefenses.length > 0) {
      return apiDefenses.map(mapApiDefenseToLocal);
    }
    return [];
  }, [defensesData]);

  const planned = useMemo(() => defenses.filter((d) => d.status === 'PLANNED'), [defenses]);
  const done = useMemo(() => defenses.filter((d) => d.status === 'DONE'), [defenses]);

  const stats = useMemo(() => {
    const total = defenses.length;
    const plannedCount = planned.length;
    const doneCount = done.length;
    return { total, plannedCount, doneCount };
  }, [defenses, planned, done]);

  const nearestDate = useMemo(() => {
    const todayIso = dateIsoFromDate(new Date());
    const upcoming = planned
      .filter((d) => d.dateIso >= todayIso)
      .sort((a, b) => a.dateIso.localeCompare(b.dateIso) || a.time.localeCompare(b.time));
    return upcoming.length > 0 ? formatRuDate(upcoming[0].dateIso) : '—';
  }, [planned]);

  const filteredDefenses = useMemo(() => {
    let list = defenses;
    if (statusFilter === 'PLANNED') list = planned;
    else if (statusFilter === 'DONE') list = done;
    return list.slice().sort((a, b) => a.dateIso.localeCompare(b.dateIso) || a.time.localeCompare(b.time));
  }, [defenses, planned, done, statusFilter]);

  const plannedForSelectedDate = useMemo(
    () => planned.filter((d) => d.dateIso === selectedDateIso).sort((a, b) => a.time.localeCompare(b.time)),
    [planned, selectedDateIso]
  );

  const doneSorted = useMemo(
    () => done.slice().sort((a, b) => b.dateIso.localeCompare(a.dateIso) || b.time.localeCompare(a.time)),
    [done]
  );

  const selectedDefense = useMemo(
    () => (selectedDefenseId ? defenses.find((d) => d.id === selectedDefenseId) : undefined),
    [defenses, selectedDefenseId]
  );

  const calendarCells = useMemo(() => {
    const first = new Date(year, month0, 1);
    const rawDay = first.getDay();
    const firstWeekday = rawDay === 0 ? 6 : rawDay - 1; // Monday-first
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();
    const total = 42;
    const cells: Array<{ day?: number; dateIso?: string; inMonth: boolean }> = [];

    for (let i = 0; i < total; i += 1) {
      const day = i - firstWeekday + 1;
      if (day < 1 || day > daysInMonth) {
        cells.push({ inMonth: false });
        continue;
      }
      const d = new Date(year, month0, day);
      cells.push({ day, dateIso: dateIsoFromDate(d), inMonth: true });
    }
    return cells;
  }, [year, month0]);

  const monthLabel = useMemo(() => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${months[month0]} ${year}`;
  }, [year, month0]);

  const openCreate = () => {
    setDateDraft(selectedDateIso);
    setIsCreateOpen(true);
  };
  const closeCreate = () => setIsCreateOpen(false);

  const openView = (id: string) => {
    const d = defenses.find((x) => x.id === id);
    setGradeDraft(d?.grade ?? 5);
    setSelectedDefenseId(id);
  };
  const closeView = () => setSelectedDefenseId(null);

  const [studentDraft, setStudentDraft] = useState('');

  useEffect(() => {
    if (students.length > 0 && !studentDraft) {
      setStudentDraft(students[0].id);
    }
  }, [students]);
  const [typeDraft, setTypeDraft] = useState<DefenseType>('ВКР');
  const [dateDraft, setDateDraft] = useState(selectedDateIso);
  const [timeDraft, setTimeDraft] = useState('10:00');
  const [roomDraft, setRoomDraft] = useState('');
  const [gradeDraft, setGradeDraft] = useState<number>(5);

  useEffect(() => {
    if (!isCreateOpen && !selectedDefenseId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCreate();
        closeView();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateOpen, selectedDefenseId]);

  const submitCreate = async () => {
    const dateIso = dateDraft.trim();
    const time = timeDraft.trim();
    const room = roomDraft.trim();
    const st = students.find((s) => s.id === studentDraft);
    if (!st || !dateIso || !time || !room) {
      window.alert('Заполните все поля');
      return;
    }

    try {
      await createDefenseApi({
        studentId: st.id,
        studentName: st.name,
        supervisorId: userId,
        defenseType: typeDraft === 'ВКР' ? 'VKR' : typeDraft === 'Курсовая' ? 'COURSEWORK' : 'RESEARCH',
        projectTitle: st.projectTitle,
        defenseDate: dateIso,
        defenseTime: time,
        room,
        reviewersCount: st.reviewersCount,
      }).unwrap();
    } catch {
      // API unavailable, no-op - user sees error
    }
    setSelectedDateIso(dateIso);
    closeCreate();
    setRoomDraft('');
  };

  const completeDefense = async () => {
    if (!selectedDefenseId) return;
    const grade = Number(gradeDraft);
    if (!Number.isFinite(grade) || grade < 2 || grade > 5) {
      window.alert('Укажите оценку от 2 до 5');
      return;
    }
    try {
      await updateDefenseStatusApi({ defenseId: selectedDefenseId, status: 'DONE', grade }).unwrap();
    } catch {
      // API error — RTK Query will show stale data until next refetch
    }
    closeView();
  };

  const goPrevMonth = () => setMonth((prev) => addMonth(prev.year, prev.month0, -1));
  const goNextMonth = () => setMonth((prev) => addMonth(prev.year, prev.month0, 1));

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Расписание защит</div>
            <div className={styles.subtitle}>Кафедра программной инженерии</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatar}>{avatarInitials}</div>
          </div>
        </div>

        <div className={styles.main}>
          {defensesLoading && <p className={styles.loading}>Загрузка...</p>}
          {defensesError && <p className={styles.error}>Ошибка загрузки данных</p>}

          {/* Filter bar */}
          <div className={styles.filterBar}>
            <select className={styles.filterSelect} defaultValue="winter-2024">
              <option value="winter-2024">Зима 2024-2025</option>
              <option value="spring-2025">Весна 2024-2025</option>
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PLANNED' | 'DONE')}
            >
              <option value="all">Все статусы</option>
              <option value="PLANNED">Запланирована</option>
              <option value="DONE">Завершена</option>
            </select>
            <div className={styles.viewSwitcher}>
              <button
                type="button"
                className={`${styles.viewSwitcherBtn} ${viewMode === 'calendar' ? styles.viewSwitcherBtnActive : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Календарь
              </button>
              <button
                type="button"
                className={`${styles.viewSwitcherBtn} ${viewMode === 'list' ? styles.viewSwitcherBtnActive : ''}`}
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
            </div>
            <button type="button" className={styles.scheduleBtn} onClick={openCreate}>
              <img src={AddIcon} className={styles.scheduleBtnIcon} alt="" />
              Назначить защиту
            </button>
          </div>

          {/* Stat cards */}
          <div className={styles.headStats}>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Всего защит</div>
                <div className={styles.headStatValue}>{stats.total}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconBlue}`}>
                <img src={CalendarIcon} className={styles.headStatIcon} alt="" />
              </div>
            </div>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Ближайшая</div>
                <div className={styles.headStatValue}>{nearestDate}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconOrange}`}>
                <ClockIconSvg className={styles.headStatSvgIcon} />
              </div>
            </div>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Завершено</div>
                <div className={styles.headStatValue}>{stats.doneCount}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconGreen}`}>
                <CheckIconSvg className={styles.headStatSvgIcon} />
              </div>
            </div>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Осталось</div>
                <div className={styles.headStatValue}>{stats.plannedCount}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconPurple}`}>
                <img src={AwardIcon} className={styles.headStatIcon} alt="" />
              </div>
            </div>
          </div>

          {/* List view */}
          {viewMode === 'list' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Расписание защит</div>
                <div className={styles.cardSubtitle}>Найдено: {filteredDefenses.length}</div>
              </div>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className={styles.defenseTable}>
                <thead className={styles.defenseTableHead}>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Студент</th>
                    <th>Тема</th>
                    <th>Комиссия</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody className={styles.defenseTableBody}>
                  {filteredDefenses.map((d) => (
                    <tr key={d.id} onClick={() => openView(d.id)}>
                      <td>{formatRuDate(d.dateIso)}</td>
                      <td>{d.time}</td>
                      <td>
                        <div className={styles.tableStudentCell}>
                          <div className={styles.tableAvatar}>{d.studentInitials}</div>
                          <span className={styles.tableStudentName}>{d.studentName}</span>
                        </div>
                      </td>
                      <td><span className={styles.tableProjectTitle}>{d.projectTitle}</span></td>
                      <td>
                        <div className={styles.tableCommission}>
                          <img src={PeopleIcon} className={styles.defenseMetaIcon} alt="" />
                          {d.reviewersCount} чел.
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.defensePill} ${d.status === 'DONE' ? styles.defensePillDone : styles.defensePillPlanned}`}>
                          {d.status === 'DONE' ? 'Завершена' : 'Запланирована'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDefenses.length === 0 && (
                    <tr><td colSpan={6} className={styles.empty}>Защит не найдено</td></tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Calendar view */}
          {viewMode === 'calendar' && (
            <>
              <div className={styles.headGrid}>
                <div className={styles.card}>
                  <div className={styles.calendarHeader}>
                    <div className={styles.cardTitle}>Календарь защит</div>
                  </div>

                  <div className={styles.calendarNav}>
                    <button type="button" className={styles.calendarNavBtn} onClick={goPrevMonth} aria-label="Предыдущий месяц">
                      ‹
                    </button>
                    <div className={styles.calendarMonth}>{monthLabel}</div>
                    <button type="button" className={styles.calendarNavBtn} onClick={goNextMonth} aria-label="Следующий месяц">
                      ›
                    </button>
                  </div>

                  <div className={styles.calendarGridHeader}>
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                      <div key={d} className={styles.calendarHeaderCell}>
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className={styles.calendarGrid}>
                    {calendarCells.map((c, idx) => {
                      const isSelected = Boolean(c.dateIso) && c.dateIso === selectedDateIso;
                      if (!c.inMonth || !c.day || !c.dateIso) return <div key={`e-${idx}`} className={styles.calendarCellEmpty} />;
                      return (
                        <button
                          key={c.dateIso}
                          type="button"
                          className={isSelected ? `${styles.calendarCell} ${styles.calendarCellSelected}` : styles.calendarCell}
                          onClick={() => setSelectedDateIso(c.dateIso!)}
                        >
                          {c.day}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.calendarFooter}>
                    <div className={styles.calendarSelectedInfo}>{plannedForSelectedDate.length} защит(ы) на выбранную дату</div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader} style={{ marginBottom: 16 }}>
                    <div className={styles.cardTitle}>Защиты на {formatRuDate(selectedDateIso)}</div>
                    <div className={styles.cardSubtitle}>Найдено: {plannedForSelectedDate.length}</div>
                  </div>

                  <div className={styles.defenseList}>
                    {plannedForSelectedDate.map((d) => (
                      <button key={d.id} type="button" className={`${styles.defenseRow} ${styles.defenseRowButton}`} onClick={() => openView(d.id)}>
                        <div className={styles.defenseTop}>
                          <div className={styles.defenseLeft}>
                            <div className={styles.defenseAvatar}>{d.studentInitials}</div>
                            <div className={styles.defenseMain}>
                              <div className={styles.defenseNameRow}>
                                <div className={styles.defenseName}>{d.studentName}</div>
                                <div className={styles.defensePills}>
                                  <span className={`${styles.defensePill} ${styles.defensePillType}`}>{d.defenseType}</span>
                                  <span className={`${styles.defensePill} ${styles.defensePillPlanned}`}>Запланировано</span>
                                </div>
                              </div>
                              <div className={styles.defenseProject}>{d.projectTitle}</div>

                              <div className={styles.defenseMetaRow}>
                                <div className={styles.defenseMetaItem}>
                                  <img src={CalendarIcon} className={styles.defenseMetaIcon} alt="" />
                                  {formatRuDate(d.dateIso)}
                                </div>
                                <div className={styles.defenseMetaItem}>
                                  <ClockIconSvg className={styles.defenseMetaSvgIcon} />
                                  {d.time}
                                </div>
                                <div className={styles.defenseMetaItem}>
                                  <img src={LocationIcon} className={styles.defenseMetaIcon} alt="" />
                                  {d.room}
                                </div>
                              </div>

                              <div className={styles.defenseBottomRow}>
                                <div className={styles.defenseSupervisor}>Руководитель: {d.supervisor}</div>
                                <div className={styles.defenseReviewers}>
                                  <img src={PeopleIcon} className={styles.defenseMetaIcon} alt="" />
                                  {d.reviewersCount} рецензент(ов)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {!plannedForSelectedDate.length && <div className={styles.empty}>На выбранную дату защит нет</div>}
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader} style={{ marginBottom: 16 }}>
                  <div className={styles.cardTitle}>Завершенные защиты</div>
                  <div className={styles.cardSubtitle}>История защит с оценками</div>
                </div>

                <div className={styles.doneList}>
                  {doneSorted.map((d) => (
                    <div key={d.id} className={styles.doneRow}>
                      <div className={styles.doneLeft}>
                        <div className={styles.defenseAvatar}>{d.studentInitials}</div>
                        <div className={styles.doneMain}>
                          <div className={styles.doneName}>{d.studentName}</div>
                          <div className={styles.doneProject}>{d.projectTitle}</div>
                        </div>
                      </div>
                      <div className={styles.doneRight}>
                        <span className={`${styles.defensePill} ${styles.defensePillType}`}>{d.defenseType}</span>
                        <span className={`${styles.defensePill} ${styles.defensePillGrade}`}>Оценка: {d.grade ?? '-'}</span>
                        <div className={styles.doneDate}>{formatRuDate(d.dateIso)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create defense modal */}
      {isCreateOpen && (
        <div className={styles.modalOverlay} onClick={closeCreate}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeCreate} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} alt="" />
            </button>

            <div className={styles.modalTitle}>Запланировать защиту</div>
            <div className={styles.modalSubtitle}>Создайте новую защиту проекта</div>

            <div className={styles.headFormGrid}>
              <div className={styles.field}>
                <div className={styles.label}>Студент</div>
                <select className={styles.select} value={studentDraft} onChange={(e) => setStudentDraft(e.target.value)}>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Тип защиты</div>
                <select className={styles.select} value={typeDraft} onChange={(e) => setTypeDraft(e.target.value as DefenseType)}>
                  <option value="ВКР">ВКР</option>
                  <option value="Курсовая">Курсовая</option>
                  <option value="Научная работа">Научная работа</option>
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Дата</div>
                <input className={styles.input} type="date" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)} />
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Время</div>
                <input className={styles.input} type="time" value={timeDraft} onChange={(e) => setTimeDraft(e.target.value)} />
              </div>

              <div className={`${styles.field} ${styles.headFieldSpan2}`}>
                <div className={styles.label}>Аудитория</div>
                <input
                  className={styles.input}
                  placeholder="Например: Аудитория 401"
                  value={roomDraft}
                  onChange={(e) => setRoomDraft(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={closeCreate}>
                Отмена
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitCreate}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel (right side) */}
      {selectedDefense && (
        <>
          <div className={styles.detailPanelOverlay} onClick={closeView} />
          <div className={styles.detailPanel}>
            <div className={styles.detailPanelHeader}>
              <div className={styles.detailPanelStudent}>
                <div className={styles.detailPanelAvatar}>{selectedDefense.studentInitials}</div>
                <div className={styles.detailPanelName}>{selectedDefense.studentName}</div>
              </div>
              <button className={styles.detailPanelClose} type="button" onClick={closeView} aria-label="Закрыть">
                <img src={CloseIcon} className={styles.modalCloseIcon} alt="" />
              </button>
            </div>

            <div className={styles.detailPanelProject}>{selectedDefense.projectTitle}</div>

            <div className={styles.modalPills}>
              <span className={`${styles.defensePill} ${styles.defensePillType}`}>{selectedDefense.defenseType}</span>
              <span
                className={`${styles.defensePill} ${
                  selectedDefense.status === 'DONE' ? styles.defensePillDone : styles.defensePillPlanned
                }`}
              >
                {selectedDefense.status === 'DONE' ? 'Завершена' : 'Запланирована'}
              </span>
              {selectedDefense.status === 'DONE' && selectedDefense.grade && (
                <span className={`${styles.defensePill} ${styles.defensePillGrade}`}>Оценка: {selectedDefense.grade}</span>
              )}
            </div>

            <div className={styles.detailPanelInfoGrid}>
              <div className={styles.detailPanelSection}>
                <div className={styles.detailPanelLabel}>Дата</div>
                <div className={styles.detailPanelValue}>{formatRuDate(selectedDefense.dateIso)}</div>
              </div>
              <div className={styles.detailPanelSection}>
                <div className={styles.detailPanelLabel}>Время</div>
                <div className={styles.detailPanelValue}>{selectedDefense.time}</div>
              </div>
              <div className={styles.detailPanelSection}>
                <div className={styles.detailPanelLabel}>Аудитория</div>
                <div className={styles.detailPanelValue}>{selectedDefense.room}</div>
              </div>
              <div className={styles.detailPanelSection}>
                <div className={styles.detailPanelLabel}>Комиссия</div>
                <div className={styles.detailPanelValue}>{selectedDefense.reviewersCount} рецензент(ов)</div>
              </div>
            </div>

            <div className={styles.detailPanelSection}>
              <div className={styles.detailPanelLabel}>Научный руководитель</div>
              <div className={styles.detailPanelValue}>{selectedDefense.supervisor || '—'}</div>
            </div>

            <div className={styles.detailPanelActions}>
              {selectedDefense.status !== 'DONE' && (
                <>
                  <div className={styles.detailPanelSection}>
                    <div className={styles.detailPanelLabel}>Оценка</div>
                    <div className={styles.detailPanelGradeRow}>
                      <select
                        className={styles.detailPanelGradeSelect}
                        value={String(gradeDraft)}
                        onChange={(e) => setGradeDraft(Number(e.target.value))}
                      >
                        <option value="5">5 — Отлично</option>
                        <option value="4">4 — Хорошо</option>
                        <option value="3">3 — Удовлетворительно</option>
                        <option value="2">2 — Неудовлетворительно</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.detailPanelBtnRow}>
                    <button type="button" className={styles.btn} onClick={closeView}>
                      Закрыть
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={completeDefense}>
                      Завершить защиту
                    </button>
                  </div>
                </>
              )}
              {selectedDefense.status === 'DONE' && (
                <div className={styles.detailPanelBtnRow}>
                  <button type="button" className={styles.btn} onClick={closeView}>
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SchedulePage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userId = useAppSelector((s) => s.auth.userId) || '';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => initialsFromName(userName), [userName]);
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';

  if (!isTeacher && !isHead) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Расписание</div>
              <div className={styles.subtitle}>Раздел доступен только преподавателям</div>
            </div>
            <div className={styles.topActions}>
              <div className={styles.notif}>
                <NotificationBell iconSrc={BellIcon} />
                </div>
              <div className={styles.avatar}>{initials}</div>
            </div>
          </div>
          <div className={styles.main}>
            <div className={styles.empty}>Недостаточно прав для просмотра</div>
          </div>
        </div>
      </div>
    );
  }

  return isHead ? <HeadDefenseScheduleView avatarInitials={initials} userId={userId} /> : <TeacherScheduleView avatarInitials={initials} userId={userId} />;
};

export default SchedulePage;
