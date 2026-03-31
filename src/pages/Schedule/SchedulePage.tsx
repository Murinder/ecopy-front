import { useEffect, useMemo, useState } from 'react';
import styles from './SchedulePage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import AddIcon from '../../assets/icons/mjbmqg4r-6km8pgq.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import CalendarIcon from '../../assets/icons/ui-calendar.svg';
import LocationIcon from '../../assets/icons/ui-location.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import { useAppSelector } from '../../app/hooks';

type WeekdayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
type LessonType = 'Лекция' | 'Семинар' | 'Практика';

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

const typePillClass = (t: LessonType) =>
  t === 'Лекция' ? styles.pillBlue : t === 'Семинар' ? styles.pillGreen : styles.pillPurple;

const cellClass = (t: LessonType) =>
  t === 'Лекция' ? styles.cellBlue : t === 'Семинар' ? styles.cellGreen : styles.cellPurple;

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

const TeacherScheduleView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [dayDraft, setDayDraft] = useState<WeekdayKey>('MON');
  const [slotDraft, setSlotDraft] = useState<string>(timeSlots[1].key);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [typeDraft, setTypeDraft] = useState<LessonType>('Лекция');
  const [groupDraft, setGroupDraft] = useState('');
  const [roomDraft, setRoomDraft] = useState('');

  const [lessons, setLessons] = useState<Lesson[]>(() => [
    {
      id: 'l-1',
      day: 'MON',
      slotKey: '10:00-11:30',
      subject: 'Алгоритмы и структуры данных',
      type: 'Лекция',
      group: 'ПИ-22-1',
      room: 'Аудитория 201',
    },
    {
      id: 'l-2',
      day: 'MON',
      slotKey: '12:00-13:30',
      subject: 'Алгоритмы и структуры данных',
      type: 'Семинар',
      group: 'ПИ-22-1',
      room: 'Аудитория 303',
    },
    {
      id: 'l-3',
      day: 'WED',
      slotKey: '10:00-11:30',
      subject: 'Программная инженерия',
      type: 'Лекция',
      group: 'ПИ-21-2',
      room: 'Аудитория 201',
    },
    {
      id: 'l-4',
      day: 'WED',
      slotKey: '12:00-13:30',
      subject: 'Программная инженерия',
      type: 'Семинар',
      group: 'ПИ-21-1',
      room: 'Аудитория 305',
    },
    {
      id: 'l-5',
      day: 'THU',
      slotKey: '14:00-15:30',
      subject: 'Веб-разработка',
      type: 'Лекция',
      group: 'ПИ-21-1',
      room: 'Аудитория 201',
    },
    {
      id: 'l-6',
      day: 'FRI',
      slotKey: '10:00-11:30',
      subject: 'Алгоритмы и структуры данных',
      type: 'Семинар',
      group: 'ПИ-22-2',
      room: 'Аудитория 305',
    },
    {
      id: 'l-7',
      day: 'FRI',
      slotKey: '14:00-15:30',
      subject: 'Веб-разработка',
      type: 'Практика',
      group: 'ПИ-21-2',
      room: 'Компьютерный класс 14',
    },
  ]);

  const byCell = useMemo(() => {
    const m = new Map<string, Lesson>();
    for (const l of lessons) m.set(`${l.day}|${l.slotKey}`, l);
    return m;
  }, [lessons]);

  const stats = useMemo(() => {
    const lectures = lessons.filter((l) => l.type === 'Лекция').length;
    const seminars = lessons.filter((l) => l.type === 'Семинар').length;
    const practice = lessons.filter((l) => l.type === 'Практика').length;
    const groups = new Set(lessons.map((l) => l.group)).size;
    const hours = lessons.length * 2;
    return { hours, lectures, seminars, practice, groups };
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

  const openAdd = () => setIsAddOpen(true);
  const closeAdd = () => setIsAddOpen(false);

  const resetDraft = () => {
    setDayDraft('MON');
    setSlotDraft(timeSlots[1].key);
    setSubjectDraft('');
    setTypeDraft('Лекция');
    setGroupDraft('');
    setRoomDraft('');
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

  const submitAdd = () => {
    const subject = subjectDraft.trim();
    const group = groupDraft.trim();
    const room = roomDraft.trim();
    if (!subject || !group || !room) {
      window.alert('Заполните все поля');
      return;
    }

    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.day === dayDraft && l.slotKey === slotDraft);
      const next: Lesson = {
        id: idx >= 0 ? prev[idx].id : `l-${Date.now()}`,
        day: dayDraft,
        slotKey: slotDraft,
        subject,
        type: typeDraft,
        group,
        room,
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [...prev, next];
    });

    closeAdd();
    resetDraft();
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
              <img src={BellIcon} className={styles.notifIcon} />
              <div className={styles.notifBadge}>3</div>
            </div>
            <div className={styles.avatar}>{avatarInitials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.secondaryActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => window.alert('Редактирование расписания (демо)')}>
              Редактировать расписание
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
              <div className={styles.statLabel}>Групп</div>
              <div className={styles.statValue}>{stats.groups}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Расписание занятий</div>
              <div className={styles.cardSubtitle}>Недельное расписание</div>
            </div>

            <div className={styles.table}>
              <div className={styles.thead}>
                <div className={`${styles.th} ${styles.thSticky}`} />
                {weekdayOptions.map((d) => (
                  <div key={d.key} className={styles.th}>
                    {d.label}
                  </div>
                ))}
              </div>

              {timeSlots.map((s) => (
                <div key={s.key} className={styles.tr}>
                  <div className={styles.timeCell}>{s.label}</div>
                  {weekdayOptions.map((d) => {
                    const lesson = byCell.get(`${d.key}|${s.key}`);
                    if (!lesson) return <div key={`${d.key}-${s.key}`} className={styles.td} />;
                    return (
                      <div key={`${d.key}-${s.key}`} className={styles.td}>
                        <div className={`${styles.lessonCard} ${cellClass(lesson.type)}`}>
                          <div className={`${styles.pill} ${typePillClass(lesson.type)}`}>{lesson.type}</div>
                          <div className={styles.lessonTitle}>{lesson.subject}</div>
                          <div className={styles.lessonMeta}>
                            {lesson.group} • {lesson.room}
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

            <div className={styles.modalTitle}>Добавить новое занятие</div>
            <div className={styles.modalSubtitle}>Заполните информацию о занятии</div>

            <div className={styles.form}>
              <div className={styles.field}>
                <div className={styles.label}>День недели</div>
                <select className={styles.select} value={dayDraft} onChange={(e) => setDayDraft(e.target.value as WeekdayKey)}>
                  {weekdayOptions.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
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
                <div className={styles.label}>Предмет</div>
                <input
                  className={styles.input}
                  placeholder="Введите название предмета"
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
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Группа</div>
                <input
                  className={styles.input}
                  placeholder="Введите номер группы"
                  value={groupDraft}
                  onChange={(e) => setGroupDraft(e.target.value)}
                />
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

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={closeAdd}>
                Отмена
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitAdd}>
                Добавить занятие
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeadDefenseScheduleView = ({ avatarInitials }: { avatarInitials: string }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null);

  const initialSelectedDate = useMemo(() => new Date(2025, 10, 20), []);
  const [selectedDateIso, setSelectedDateIso] = useState(() => dateIsoFromDate(initialSelectedDate));

  const initialMonth = useMemo(() => ({ year: 2025, month0: 10 }), []);
  const [{ year, month0 }, setMonth] = useState(() => initialMonth);

  const students = useMemo(
    () => [
      {
        id: 'st-1',
        name: 'Иван Иванов',
        projectTitle: 'Интеллектуальная система рекомендаций',
        supervisor: 'Петров А.В.',
        reviewersCount: 2,
      },
      {
        id: 'st-2',
        name: 'Мария Петрова',
        projectTitle: 'Платформа автоматизации тестирования',
        supervisor: 'Иванова М.С.',
        reviewersCount: 2,
      },
      {
        id: 'st-3',
        name: 'Алексей Сидоров',
        projectTitle: 'Веб-платформа для управления проектами',
        supervisor: 'Сидоров И.П.',
        reviewersCount: 2,
      },
      {
        id: 'st-4',
        name: 'Дмитрий Козлов',
        projectTitle: 'Система распознавания текста',
        supervisor: 'Смирнова В.И.',
        reviewersCount: 2,
      },
    ],
    []
  );

  const [defenses, setDefenses] = useState<DefenseItem[]>(() => [
    {
      id: 'd-1',
      studentName: 'Иван Иванов',
      studentInitials: 'ИИ',
      defenseType: 'ВКР',
      status: 'PLANNED',
      projectTitle: 'Интеллектуальная система рекомендаций',
      dateIso: '2025-11-20',
      time: '10:00',
      room: 'Аудитория 401',
      supervisor: 'Петров А.В.',
      reviewersCount: 2,
    },
    {
      id: 'd-2',
      studentName: 'Мария Петрова',
      studentInitials: 'МП',
      defenseType: 'ВКР',
      status: 'PLANNED',
      projectTitle: 'Платформа автоматизации тестирования',
      dateIso: '2025-11-20',
      time: '11:30',
      room: 'Аудитория 401',
      supervisor: 'Иванова М.С.',
      reviewersCount: 2,
    },
    {
      id: 'd-3',
      studentName: 'Алексей Сидоров',
      studentInitials: 'АС',
      defenseType: 'ВКР',
      status: 'PLANNED',
      projectTitle: 'Веб-платформа для управления проектами',
      dateIso: '2025-11-20',
      time: '14:00',
      room: 'Аудитория 305',
      supervisor: 'Сидоров И.П.',
      reviewersCount: 2,
    },
    {
      id: 'd-4',
      studentName: 'Дмитрий Козлов',
      studentInitials: 'ДК',
      defenseType: 'ВКР',
      status: 'DONE',
      projectTitle: 'Система распознавания текста',
      dateIso: '2025-11-15',
      time: '12:00',
      room: 'Аудитория 401',
      supervisor: 'Смирнова В.И.',
      reviewersCount: 2,
      grade: 5,
    },
  ]);

  const planned = useMemo(() => defenses.filter((d) => d.status === 'PLANNED'), [defenses]);
  const done = useMemo(() => defenses.filter((d) => d.status === 'DONE'), [defenses]);

  const stats = useMemo(() => {
    const total = defenses.length;
    const plannedCount = planned.length;
    const doneCount = done.length;
    const avgGrade = done.length ? done.reduce((s, d) => s + (d.grade ?? 0), 0) / done.length : 0;
    return { total, plannedCount, doneCount, avgGrade: avgGrade ? Number(avgGrade.toFixed(1)) : 0 };
  }, [defenses, planned, done]);

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
    const firstWeekday = first.getDay();
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

  const monthLabel = useMemo(() => new Date(year, month0, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }), [year, month0]);

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

  const [studentDraft, setStudentDraft] = useState(students[0].id);
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

  const submitCreate = () => {
    const dateIso = dateDraft.trim();
    const time = timeDraft.trim();
    const room = roomDraft.trim();
    const st = students.find((s) => s.id === studentDraft);
    if (!st || !dateIso || !time || !room) {
      window.alert('Заполните все поля');
      return;
    }

    setDefenses((prev) => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        studentName: st.name,
        studentInitials: initialsFromName(st.name),
        defenseType: typeDraft,
        status: 'PLANNED',
        projectTitle: st.projectTitle,
        dateIso,
        time,
        room,
        supervisor: st.supervisor,
        reviewersCount: st.reviewersCount,
      },
    ]);
    setSelectedDateIso(dateIso);
    closeCreate();
    setRoomDraft('');
  };

  const completeDefense = () => {
    if (!selectedDefenseId) return;
    const grade = Number(gradeDraft);
    if (!Number.isFinite(grade) || grade < 2 || grade > 5) {
      window.alert('Укажите оценку от 2 до 5');
      return;
    }
    setDefenses((prev) =>
      prev.map((d) => (d.id === selectedDefenseId ? { ...d, status: 'DONE', grade } : d))
    );
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
              <img src={BellIcon} className={styles.notifIcon} />
              <div className={styles.notifBadge}>4</div>
            </div>
            <div className={styles.avatar}>{avatarInitials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.headStats}>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Всего защит</div>
                <div className={styles.headStatValue}>{stats.total}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconBlue}`}>
                <img src={CalendarIcon} className={styles.headStatIcon} />
              </div>
            </div>
            <div className={styles.headStatCard}>
              <div>
                <div className={styles.headStatLabel}>Запланировано</div>
                <div className={styles.headStatValue}>{stats.plannedCount}</div>
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
                <div className={styles.headStatLabel}>Средняя оценка</div>
                <div className={styles.headStatValue}>{stats.avgGrade || '-'}</div>
              </div>
              <div className={`${styles.headStatIconWrap} ${styles.headStatIconPurple}`}>
                <img src={AwardIcon} className={styles.headStatIcon} />
              </div>
            </div>
          </div>

          <div className={styles.headGrid}>
            <div className={styles.card}>
              <div className={styles.calendarHeader}>
                <div>
                  <div className={styles.cardTitle}>Календарь защит</div>
                </div>
                <button type="button" className={styles.headAddBtn} onClick={openCreate}>
                  <img src={AddIcon} className={styles.headAddIcon} />
                  Добавить
                </button>
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
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
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
                              <img src={CalendarIcon} className={styles.defenseMetaIcon} />
                              {formatRuDate(d.dateIso)}
                            </div>
                            <div className={styles.defenseMetaItem}>
                              <ClockIconSvg className={styles.defenseMetaSvgIcon} />
                              {d.time}
                            </div>
                            <div className={styles.defenseMetaItem}>
                              <img src={LocationIcon} className={styles.defenseMetaIcon} />
                              {d.room}
                            </div>
                          </div>

                          <div className={styles.defenseBottomRow}>
                            <div className={styles.defenseSupervisor}>Руководитель: {d.supervisor}</div>
                            <div className={styles.defenseReviewers}>
                              <img src={PeopleIcon} className={styles.defenseMetaIcon} />
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
        </div>
      </div>

      {isCreateOpen && (
        <div className={styles.modalOverlay} onClick={closeCreate}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeCreate} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} />
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

      {selectedDefense && (
        <div className={styles.modalOverlay} onClick={closeView}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeView} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalTitle}>{selectedDefense.studentName}</div>
            <div className={styles.modalSubtitle}>{selectedDefense.projectTitle}</div>

            <div className={styles.modalPills}>
              <span className={`${styles.defensePill} ${styles.defensePillType}`}>{selectedDefense.defenseType}</span>
              <span
                className={`${styles.defensePill} ${
                  selectedDefense.status === 'DONE' ? styles.defensePillDone : styles.defensePillPlanned
                }`}
              >
                {selectedDefense.status === 'DONE' ? 'Завершено' : 'Запланировано'}
              </span>
              {selectedDefense.status === 'DONE' && (
                <span className={`${styles.defensePill} ${styles.defensePillGrade}`}>Оценка: {selectedDefense.grade ?? '-'}</span>
              )}
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Дата</div>
                <div className={styles.detailValue}>{formatRuDate(selectedDefense.dateIso)}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Время</div>
                <div className={styles.detailValue}>{selectedDefense.time}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Аудитория</div>
                <div className={styles.detailValue}>{selectedDefense.room}</div>
              </div>
              <div className={styles.detailBox}>
                <div className={styles.detailLabel}>Руководитель</div>
                <div className={styles.detailValue}>{selectedDefense.supervisor}</div>
              </div>
              <div className={`${styles.detailBox} ${styles.detailSpan2}`}>
                <div className={styles.detailLabel}>Рецензенты</div>
                <div className={styles.detailValue}>{selectedDefense.reviewersCount} рецензент(ов)</div>
              </div>
            </div>

            {selectedDefense.status !== 'DONE' && (
              <div className={styles.viewActions}>
                <div className={styles.field}>
                  <div className={styles.label}>Оценка</div>
                  <select className={styles.select} value={String(gradeDraft)} onChange={(e) => setGradeDraft(Number(e.target.value))}>
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.btn} onClick={closeView}>
                    Закрыть
                  </button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={completeDefense}>
                    Завершить
                  </button>
                </div>
              </div>
            )}

            {selectedDefense.status === 'DONE' && (
              <div className={styles.modalActions}>
                <button type="button" className={styles.btn} onClick={closeView}>
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SchedulePage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
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
                <img src={BellIcon} className={styles.notifIcon} />
                <div className={styles.notifBadge}>3</div>
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

  return isHead ? <HeadDefenseScheduleView avatarInitials={initials} /> : <TeacherScheduleView avatarInitials={initials} />;
};

export default SchedulePage;
