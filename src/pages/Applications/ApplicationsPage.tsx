import { useEffect, useMemo, useState } from 'react';
import styles from './ApplicationsPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import MailIcon from '../../assets/icons/ui-mail.svg';
import PhoneIcon from '../../assets/icons/ui-phone.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import BoltIcon from '../../assets/icons/ui-bolt.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import { useAppSelector } from '../../app/hooks';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type RequestPriority = 'HIGH' | 'MEDIUM' | 'LOW';
type RequestKind = 'PROJECT' | 'CONSULT' | 'VKR';

type StudentInfo = {
  name: string;
  email: string;
  phone: string;
  group: string;
  course: string;
  initials: string;
};

type RequestItem = {
  id: string;
  title: string;
  description: string;
  submittedAt: string;
  status: RequestStatus;
  priority: RequestPriority;
  kind: RequestKind;
  student: StudentInfo;
  category: string;
  duration: string;
  teamSize: string;
  teacherReply?: string;
};

type TabKey = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

const priorityLabel = (p: RequestPriority) => (p === 'HIGH' ? 'Высокий' : p === 'MEDIUM' ? 'Средний' : 'Низкий');
const kindLabel = (k: RequestKind) => (k === 'PROJECT' ? 'Проект' : k === 'CONSULT' ? 'Консультация' : 'ВКР');
const statusLabel = (s: RequestStatus) => (s === 'PENDING' ? 'На рассмотрении' : s === 'APPROVED' ? 'Одобрено' : 'Отклонено');

const ApplicationsPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const initials = useMemo(() => userName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'ИИ', [userName]);
  const isTeacher = userRole === 'Преподаватель' || userRole === 'Заведующий кафедрой';

  const [tab, setTab] = useState<TabKey>('PENDING');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const [items, setItems] = useState<RequestItem[]>(() => [
    {
      id: 'req-1',
      title: 'Научное руководство дипломным проектом',
      description:
        "Прошу стать научным руководителем моего дипломного проекта 'Разработка интеллектуальной системы рекомендаций для образовательной платформы'. Проект предполагает применение методов машинного обучения и анализа данных.",
      submittedAt: '12.11.2025',
      status: 'PENDING',
      priority: 'HIGH',
      kind: 'PROJECT',
      student: {
        initials: 'ИИ',
        name: 'Иван Иванов',
        email: 'ivan.ivanov@university.edu',
        phone: '+7 (999) 123-45-67',
        group: 'ПИ-21-1',
        course: '3 курс',
      },
      category: 'Дипломный проект',
      duration: '6 месяцев',
      teamSize: '1 человек',
    },
    {
      id: 'req-2',
      title: 'Консультация по курсовому проекту',
      description:
        'Необходима консультация по архитектуре веб-приложения для курсового проекта. Хотелось бы обсудить выбор технологического стека и подходы к проектированию.',
      submittedAt: '13.11.2025',
      status: 'APPROVED',
      priority: 'MEDIUM',
      kind: 'CONSULT',
      student: {
        initials: 'МП',
        name: 'Мария Петрова',
        email: 'maria.petrova@university.edu',
        phone: '+7 (999) 555-12-34',
        group: 'ПИ-21-2',
        course: '3 курс',
      },
      category: 'Курсовой проект',
      duration: '2 недели',
      teamSize: '1 человек',
      teacherReply: 'Давайте созвонимся в четверг, подготовьте список вопросов и текущую схему.',
    },
    {
      id: 'req-3',
      title: 'Руководство ВКР',
      description:
        "Прошу стать руководителем выпускной квалификационной работы на тему 'Разработка системы автоматизации тестирования веб-приложений'. Имею опыт работы в QA и хочу углубить знания в этой области.",
      submittedAt: '10.11.2025',
      status: 'REJECTED',
      priority: 'HIGH',
      kind: 'VKR',
      student: {
        initials: 'АС',
        name: 'Алексей Сидоров',
        email: 'alexey.sidorov@university.edu',
        phone: '+7 (999) 777-77-77',
        group: 'ПИ-20-1',
        course: '4 курс',
      },
      category: 'ВКР',
      duration: '4 месяца',
      teamSize: '1 человек',
      teacherReply: 'Сейчас нет возможности взять ещё одну ВКР. Попробуйте обратиться к другому преподавателю.',
    },
    {
      id: 'req-4',
      title: 'Научное руководство дипломным проектом',
      description:
        "Прошу рассмотреть возможность руководства дипломным проектом по теме 'Рекомендательная система для университетского портала'. Есть предварительный прототип и датасет.",
      submittedAt: '09.11.2025',
      status: 'PENDING',
      priority: 'MEDIUM',
      kind: 'PROJECT',
      student: {
        initials: 'ЕА',
        name: 'Екатерина Андреева',
        email: 'ekaterina.andreeva@university.edu',
        phone: '+7 (999) 888-88-88',
        group: 'ПИ-21-3',
        course: '3 курс',
      },
      category: 'Дипломный проект',
      duration: '6 месяцев',
      teamSize: '2 человека',
    },
    {
      id: 'req-5',
      title: 'Консультация по исследовательскому проекту',
      description:
        'Нужна консультация по плану эксперимента и метрикам для исследования качества генеративных моделей в обучении.',
      submittedAt: '08.11.2025',
      status: 'PENDING',
      priority: 'LOW',
      kind: 'CONSULT',
      student: {
        initials: 'НК',
        name: 'Никита Кузнецов',
        email: 'nikita.kuznetsov@university.edu',
        phone: '+7 (999) 222-22-22',
        group: 'ПИ-21-1',
        course: '3 курс',
      },
      category: 'Исследование',
      duration: '1 неделя',
      teamSize: '1 человек',
    },
  ]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, total: items.length };
    items.forEach((r) => {
      if (r.status === 'PENDING') c.pending += 1;
      else if (r.status === 'APPROVED') c.approved += 1;
      else c.rejected += 1;
    });
    return c;
  }, [items]);

  const list = useMemo(() => {
    if (tab === 'ALL') return items;
    if (tab === 'PENDING') return items.filter((r) => r.status === 'PENDING');
    if (tab === 'APPROVED') return items.filter((r) => r.status === 'APPROVED');
    return items.filter((r) => r.status === 'REJECTED');
  }, [items, tab]);

  const selected = useMemo(() => items.find((r) => r.id === selectedId) || null, [items, selectedId]);

  const closeModal = () => {
    setSelectedId(null);
    setReplyDraft('');
  };

  const openModal = (id: string) => {
    setSelectedId(id);
    const it = items.find((r) => r.id === id);
    setReplyDraft(it?.teacherReply || '');
  };

  const updateStatus = (id: string, status: RequestStatus, reply?: string) => {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, teacherReply: typeof reply === 'string' ? reply : r.teacherReply } : r))
    );
  };

  const approve = (id: string) => updateStatus(id, 'APPROVED', replyDraft.trim() || undefined);
  const reject = (id: string) => updateStatus(id, 'REJECTED', replyDraft.trim() || undefined);
  const clarify = () => {
    window.alert('Запрос уточнений отправлен (демо)');
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  if (!isTeacher) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Заявки студентов</div>
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

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Заявки студентов</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
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
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>На рассмотрении</div>
                <div className={styles.statValue}>{counts.pending}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapYellow}`}>
                <img src={BoltIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Одобрено</div>
                <div className={styles.statValue}>{counts.approved}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapGreen}`}>
                <img src={AwardIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Отклонено</div>
                <div className={styles.statValue}>{counts.rejected}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapRed}`}>
                <img src={CloseIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Всего заявок</div>
                <div className={styles.statValue}>{counts.total}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapBlue}`}>
                <img src={FileIcon} className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={tab === 'PENDING' ? styles.tabActive : styles.tab}
              onClick={() => setTab('PENDING')}
            >
              На рассмотрении ({counts.pending})
            </button>
            <button
              type="button"
              className={tab === 'APPROVED' ? styles.tabActive : styles.tab}
              onClick={() => setTab('APPROVED')}
            >
              Одобренные ({counts.approved})
            </button>
            <button
              type="button"
              className={tab === 'REJECTED' ? styles.tabActive : styles.tab}
              onClick={() => setTab('REJECTED')}
            >
              Отклоненные ({counts.rejected})
            </button>
            <button
              type="button"
              className={tab === 'ALL' ? styles.tabActive : styles.tab}
              onClick={() => setTab('ALL')}
            >
              Все ({counts.total})
            </button>
          </div>

          <div className={styles.list}>
            {list.map((r) => (
              <div key={r.id} className={styles.row} onClick={() => openModal(r.id)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal(r.id)}>
                <div className={styles.avatarBig}>{r.student.initials}</div>

                <div className={styles.rowMain}>
                  <div className={styles.rowHeader}>
                    <div className={styles.rowTitle}>{r.title}</div>
                    <div className={styles.pills}>
                      <span className={`${styles.pill} ${r.priority === 'HIGH' ? styles.pillHigh : r.priority === 'MEDIUM' ? styles.pillMedium : styles.pillLow}`}>
                        {priorityLabel(r.priority)}
                      </span>
                      <span className={`${styles.pill} ${r.kind === 'PROJECT' ? styles.pillBlue : r.kind === 'CONSULT' ? styles.pillGreen : styles.pillPurple}`}>
                        {kindLabel(r.kind)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowMeta}>
                    {r.student.name} • {r.student.group} • {r.student.course}
                  </div>
                  <div className={styles.rowDesc}>{r.description}</div>
                  <div className={styles.rowFooter}>
                    <div className={styles.submitted}>
                      <span className={styles.submittedLabel}>Подано:</span> {r.submittedAt}
                    </div>
                    <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => updateStatus(r.id, 'APPROVED')}
                        disabled={r.status === 'APPROVED'}
                      >
                        ✓ Одобрить
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={() => updateStatus(r.id, 'REJECTED')}
                        disabled={r.status === 'REJECTED'}
                      >
                        ✕ Отклонить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeModal} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalPills}>
              <span className={`${styles.pill} ${selected.kind === 'PROJECT' ? styles.pillBlue : selected.kind === 'CONSULT' ? styles.pillGreen : styles.pillPurple}`}>
                {kindLabel(selected.kind)}
              </span>
              <span className={`${styles.pill} ${selected.status === 'PENDING' ? styles.pillStatusPending : selected.status === 'APPROVED' ? styles.pillStatusApproved : styles.pillStatusRejected}`}>
                {statusLabel(selected.status)}
              </span>
              <span className={`${styles.pill} ${selected.priority === 'HIGH' ? styles.pillHigh : selected.priority === 'MEDIUM' ? styles.pillMedium : styles.pillLow}`}>
                {priorityLabel(selected.priority)}
              </span>
            </div>

            <div className={styles.modalTitle}>{selected.title}</div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>Информация о студенте</div>
              <div className={styles.studentRow}>
                <div className={styles.studentAvatar}>{selected.student.initials}</div>
                <div className={styles.studentInfo}>
                  <div className={styles.studentName}>{selected.student.name}</div>
                  <div className={styles.studentLine}>
                    <img src={MailIcon} className={styles.studentIcon} />
                    {selected.student.email}
                  </div>
                  <div className={styles.studentLine}>
                    <img src={PhoneIcon} className={styles.studentIcon} />
                    {selected.student.phone}
                  </div>
                  <div className={styles.studentSmall}>
                    {selected.student.group} • {selected.student.course}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionTitle}>Описание заявки</div>
            <div className={styles.modalDesc}>{selected.description}</div>

            <div className={styles.sectionTitle}>Детали проекта</div>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Категория</div>
                <div className={styles.detailValue}>{selected.category}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Длительность</div>
                <div className={styles.detailValue}>{selected.duration}</div>
              </div>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Размер команды</div>
                <div className={styles.detailValue}>{selected.teamSize}</div>
              </div>
            </div>

            <div className={styles.sectionTitle}>Ответ студенту</div>
            <textarea
              className={styles.reply}
              placeholder="Добавьте комментарий или рекомендации..."
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalApprove}
                onClick={() => {
                  approve(selected.id);
                  closeModal();
                }}
              >
                ✓ Одобрить заявку
              </button>
              <button
                type="button"
                className={styles.modalReject}
                onClick={() => {
                  reject(selected.id);
                  closeModal();
                }}
              >
                ✕ Отклонить
              </button>
              <button type="button" className={styles.modalClarify} onClick={clarify}>
                <img src={ChatIcon} className={styles.modalClarifyIcon} />
                Запросить уточнения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;

