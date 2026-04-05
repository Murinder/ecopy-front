import { useEffect, useMemo, useState } from 'react';
import styles from './ApplicationsPage.module.scss';
import Sidebar from '../../components/Sidebar';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import CloseIcon from '../../assets/icons/ui-close.svg';
import MailIcon from '../../assets/icons/ui-mail.svg';
import PhoneIcon from '../../assets/icons/ui-phone.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import BoltIcon from '../../assets/icons/ui-bolt.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import ChatIcon from '../../assets/icons/ui-chat.svg';
import { useAppSelector } from '../../app/hooks';
import {
  useGetLecturerApplicationsQuery,
  useGetAdminApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '../../services/coreApi';
import type { ApplicationViewDto, ApplicationStatusType } from '../../services/coreApi';

type TabKey = 'active' | 'in_progress' | 'completed' | 'all';

const KIND_LABELS: Record<string, string> = {
  PROJECT: 'Проект', CONSULT: 'Консультация', VKR: 'ВКР',
  RESOURCE_REQUEST: 'Запрос ресурсов', EQUIPMENT_REQUEST: 'Запрос техники',
  ROOM_REQUEST: 'Запрос кабинета', OTHER: 'Другое',
};
const kindLabel = (k: string, category?: string | null): string => {
  if (k === 'OTHER' && category) return category;
  return KIND_LABELS[k] ?? k;
};
const statusLabel = (s: string): string => {
  const map: Record<string, string> = {
    PENDING: 'На рассмотрении', APPROVED: 'Одобрено', REJECTED: 'Отклонено',
    REVISION: 'На доработке', ADMIN_REVIEW: 'Подтверждение зав. каф.',
    IN_PROGRESS: 'В процессе исполнения', COMPLETED: 'Исполнена', WITHDRAWN: 'Отозвано',
  };
  return map[s] ?? s;
};

const ACTIVE_STATUSES: ApplicationStatusType[] = ['PENDING', 'REVISION', 'ADMIN_REVIEW', 'IN_PROGRESS'];

const kindPillClass = (k: string) => {
  if (k === 'PROJECT') return styles.pillBlue;
  if (k === 'CONSULT') return styles.pillGreen;
  if (k === 'VKR') return styles.pillPurple;
  return styles.pillBlue;
};

const statusPillClass = (s: string) => {
  if (s === 'PENDING') return styles.pillStatusPending;
  if (s === 'APPROVED' || s === 'COMPLETED') return styles.pillStatusApproved;
  if (s === 'REJECTED') return styles.pillStatusRejected;
  if (s === 'REVISION') return styles.pillPurple;
  if (s === 'ADMIN_REVIEW') return styles.pillBlue;
  if (s === 'IN_PROGRESS') return styles.pillBlue;
  if (s === 'WITHDRAWN') return styles.pillLow;
  return styles.pillStatusPending;
};


const ApplicationsPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const userId = useAppSelector((s) => s.auth.userId);
  const initials = useMemo(() => userName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'ИИ', [userName]);
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';
  const hasAccess = isTeacher || isHead;

  // Fetch data based on role
  const { data: lecturerApps, isLoading: lecturerLoading, isError: lecturerError } = useGetLecturerApplicationsQuery(userId ?? '', { skip: !userId || !isTeacher });
  const { data: adminApps, isLoading: adminLoading, isError: adminError } = useGetAdminApplicationsQuery(undefined, { skip: !isHead });

  const [updateStatusMutation] = useUpdateApplicationStatusMutation();
  // addApplicationComment used via updateStatus with comment field

  const [tab, setTab] = useState<TabKey>('active');
  const [selectedApp, setSelectedApp] = useState<ApplicationViewDto | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [commentRequired, setCommentRequired] = useState(false);

  const appsLoading = isTeacher ? lecturerLoading : adminLoading;
  const appsError = isTeacher ? lecturerError : adminError;
  const rawApps: ApplicationViewDto[] = isTeacher
    ? (lecturerApps?.data ?? [])
    : (adminApps?.data ?? []);

  const items = rawApps;

  // Head gets separate counts for ADMIN_REVIEW vs IN_PROGRESS
  const newCount = isHead
    ? items.filter(r => r.status === 'ADMIN_REVIEW').length
    : items.filter(r => ACTIVE_STATUSES.includes(r.status)).length;
  const inProgressCount = items.filter(r => r.status === 'IN_PROGRESS').length;
  const completedCount = isHead
    ? items.filter(r => r.status !== 'ADMIN_REVIEW' && r.status !== 'IN_PROGRESS').length
    : items.length - newCount;

  const list = useMemo(() => {
    if (tab === 'all') return items;
    if (isHead) {
      if (tab === 'active') return items.filter(r => r.status === 'ADMIN_REVIEW');
      if (tab === 'in_progress') return items.filter(r => r.status === 'IN_PROGRESS');
      return items.filter(r => r.status !== 'ADMIN_REVIEW' && r.status !== 'IN_PROGRESS');
    }
    if (tab === 'active') return items.filter(r => ACTIVE_STATUSES.includes(r.status));
    return items.filter(r => !ACTIVE_STATUSES.includes(r.status));
  }, [items, tab, isHead]);

  const closeModal = () => {
    setSelectedApp(null);
    setReplyDraft('');
    setCommentRequired(false);
  };

  const openModal = (app: ApplicationViewDto) => {
    setSelectedApp(app);
    setReplyDraft('');
    setCommentRequired(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedApp) return;
    // Require comment for REVISION and REJECTED
    if ((status === 'REVISION' || status === 'REJECTED') && !replyDraft.trim()) {
      setCommentRequired(true);
      return;
    }
    try {
      await updateStatusMutation({
        applicationId: selectedApp.id,
        status,
        teacherReply: replyDraft.trim() || undefined,
      }).unwrap();
      closeModal();
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!selectedApp) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedApp]);

  if (!hasAccess) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Заявки</div>
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

  const pageTitle = isHead ? 'Заявки на ресурсы' : 'Заявки студентов';
  const pageSubtitle = isHead
    ? 'Заявки, ожидающие подтверждения или в процессе исполнения'
    : 'Управление заявками от студентов';

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>{pageTitle}</div>
            <div className={styles.subtitle}>{pageSubtitle}</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>{isHead ? 'Новые' : 'Активные'}</div>
                <div className={styles.statValue}>{newCount}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapYellow}`}>
                <img src={BoltIcon} className={styles.statIcon} />
              </div>
            </div>
            {isHead && (
              <div className={styles.statCard}>
                <div>
                  <div className={styles.statLabel}>В исполнении</div>
                  <div className={styles.statValue}>{inProgressCount}</div>
                </div>
                <div className={`${styles.statIconWrap} ${styles.statIconWrapBlue}`}>
                  <img src={BoltIcon} className={styles.statIcon} />
                </div>
              </div>
            )}
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Завершённые</div>
                <div className={styles.statValue}>{completedCount}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapGreen}`}>
                <img src={AwardIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Всего</div>
                <div className={styles.statValue}>{items.length}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapBlue}`}>
                <img src={FileIcon} className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={styles.tabs}>
            <button type="button" className={tab === 'active' ? styles.tabActive : styles.tab} onClick={() => setTab('active')}>
              {isHead ? 'Новые' : 'Активные'} ({newCount})
            </button>
            {isHead && (
              <button type="button" className={tab === 'in_progress' ? styles.tabActive : styles.tab} onClick={() => setTab('in_progress')}>
                В исполнении ({inProgressCount})
              </button>
            )}
            <button type="button" className={tab === 'completed' ? styles.tabActive : styles.tab} onClick={() => setTab('completed')}>
              Завершённые ({completedCount})
            </button>
            <button type="button" className={tab === 'all' ? styles.tabActive : styles.tab} onClick={() => setTab('all')}>
              Все ({items.length})
            </button>
          </div>

          {appsLoading && <p className={styles.loading}>Загрузка...</p>}
          {appsError && <p className={styles.error}>Ошибка загрузки данных</p>}
          <div className={styles.list}>
            {!appsLoading && !appsError && list.length === 0 && (
              <p className={styles.empty}>Нет заявок</p>
            )}
            {list.map((r) => (
              <div key={r.id} className={styles.row} onClick={() => openModal(r)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal(r)}>
                <div className={styles.avatarBig}>{r.student.initials}</div>

                <div className={styles.rowMain}>
                  <div className={styles.rowHeader}>
                    <div className={styles.rowTitle}>{r.title || `Заявка №${r.applicationNumber ?? '—'}`}</div>
                    <div className={styles.pills}>
                      <span className={`${styles.pill} ${kindPillClass(r.kind)}`}>
                        {kindLabel(r.kind, r.category)}
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
                    <span className={`${styles.pill} ${statusPillClass(r.status)}`} style={{ fontSize: 11 }}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={closeModal} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.modalCloseIcon} />
            </button>

            <div className={styles.modalPills}>
              <span className={`${styles.pill} ${kindPillClass(selectedApp.kind)}`}>
                {kindLabel(selectedApp.kind, selectedApp.category)}
              </span>
              <span className={`${styles.pill} ${statusPillClass(selectedApp.status)}`}>
                {statusLabel(selectedApp.status)}
              </span>
            </div>

            <div className={styles.modalTitle}>{selectedApp.title || `Заявка №${selectedApp.applicationNumber ?? '—'}`}</div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>Информация о студенте</div>
              <div className={styles.studentRow}>
                <div className={styles.studentAvatar}>{selectedApp.student.initials}</div>
                <div className={styles.studentInfo}>
                  <div className={styles.studentName}>{selectedApp.student.name}</div>
                  <div className={styles.studentLine}>
                    <img src={MailIcon} className={styles.studentIcon} />
                    {selectedApp.student.email}
                  </div>
                  <div className={styles.studentLine}>
                    <img src={PhoneIcon} className={styles.studentIcon} />
                    {selectedApp.student.phone || '—'}
                  </div>
                  <div className={styles.studentSmall}>
                    {selectedApp.student.group} • {selectedApp.student.course}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionTitle}>Описание заявки</div>
            <div className={styles.modalDesc}>{selectedApp.description || '—'}</div>

            {/* Project details only for PROJECT/CONSULT/VKR */}
            {['PROJECT', 'CONSULT', 'VKR'].includes(selectedApp.kind) && (selectedApp.category || selectedApp.duration || selectedApp.teamSize) && (
              <>
                <div className={styles.sectionTitle}>Детали проекта</div>
                <div className={styles.detailsGrid}>
                  {selectedApp.category && <div className={styles.detailCard}><div className={styles.detailLabel}>Категория</div><div className={styles.detailValue}>{selectedApp.category}</div></div>}
                  {selectedApp.duration && <div className={styles.detailCard}><div className={styles.detailLabel}>Длительность</div><div className={styles.detailValue}>{selectedApp.duration}</div></div>}
                  {selectedApp.teamSize && <div className={styles.detailCard}><div className={styles.detailLabel}>Размер команды</div><div className={styles.detailValue}>{selectedApp.teamSize}</div></div>}
                </div>
              </>
            )}

            {/* Comments section */}
            {(selectedApp.comments ?? []).length > 0 && (
              <>
                <div className={styles.sectionTitle}>Комментарии</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {(selectedApp.comments ?? []).map(c => (
                    <div key={c.id} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#0e1d45' }}>{c.authorName} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>({c.authorRole === 'STUDENT' ? 'Студент' : c.authorRole === 'LECTURER' ? 'Преподаватель' : 'Зав. кафедрой'})</span></span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.createdAt}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#475569' }}>{c.content}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Reply / comment field */}
            <div className={styles.sectionTitle}>{isHead ? 'Комментарий' : 'Ответ студенту'}</div>
            <textarea
              className={styles.reply}
              placeholder={isHead ? 'Комментарий при отклонении (обязательно)...' : 'Комментарий к заявке...'}
              value={replyDraft}
              onChange={(e) => { setReplyDraft(e.target.value); setCommentRequired(false); }}
            />
            {commentRequired && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4, marginBottom: 8 }}>Необходимо написать комментарий</div>}

            {/* Action buttons — teacher */}
            {isTeacher && ACTIVE_STATUSES.includes(selectedApp.status) && selectedApp.status !== 'ADMIN_REVIEW' && selectedApp.status !== 'IN_PROGRESS' && (
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalApprove} onClick={() => handleUpdateStatus('APPROVED')}>
                  ✓ Одобрить
                </button>
                <button type="button" className={styles.modalReject} onClick={() => handleUpdateStatus('REJECTED')}>
                  ✕ Отклонить
                </button>
                {selectedApp.status === 'PENDING' && (
                  <button type="button" className={styles.modalClarify} onClick={() => handleUpdateStatus('REVISION')}>
                    <img src={ChatIcon} className={styles.modalClarifyIcon} />
                    На доработке
                  </button>
                )}
              </div>
            )}

            {/* Action buttons — department head */}
            {isHead && (
              <div className={styles.modalActions}>
                {selectedApp.status === 'ADMIN_REVIEW' && (
                  <button type="button" className={styles.modalApprove} onClick={() => handleUpdateStatus('IN_PROGRESS')}>
                    ✓ Принять
                  </button>
                )}
                {selectedApp.status === 'IN_PROGRESS' && (
                  <button type="button" className={styles.modalApprove} onClick={() => handleUpdateStatus('COMPLETED')}>
                    ✓ Исполнено
                  </button>
                )}
                {(selectedApp.status === 'ADMIN_REVIEW' || selectedApp.status === 'IN_PROGRESS') && (
                  <button type="button" className={styles.modalReject} onClick={() => handleUpdateStatus('REJECTED')}>
                    ✕ Отклонить
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
