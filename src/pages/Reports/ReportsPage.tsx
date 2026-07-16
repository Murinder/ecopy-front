import { useEffect, useMemo, useState } from 'react';
import styles from './ReportsPage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import AddIcon from '../../assets/icons/mjbmqg4r-6km8pgq.svg';
import CalendarIcon from '../../assets/icons/mjbmqg4r-fgt12s1.svg';
import CloseIcon from '../../assets/icons/ui-close.svg';
import EyeIcon from '../../assets/icons/ui-eye.svg';
import DownloadIcon from '../../assets/icons/ui-download.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import TagIcon from '../../assets/icons/ui-tag.svg';
import SearchIcon from '../../assets/icons/ui-search.svg';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../app/hooks';
import { useGetMyReportsQuery, useGenerateReportMutation } from '../../services/reportApi';
import { useGetUserProjectsQuery } from '../../services/projectApi';
import type { ReportDto } from '../../services/reportApi';

type ReportStatus = 'DONE' | 'DRAFT';

type ReportItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: ReportStatus;
  project?: string;
  date: string;
  from?: string;
  to?: string;
  notes?: string;
  metrics?: { tasksDone: number; progress: number; hours: number };
  students?: string[];
  eduMetrics?: { students: number; avgGrade: number; successRate: number };
};

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

const mapReportDtoToItem = (dto: ReportDto): ReportItem => {
  const params = dto.parameters || {};
  const genDate = dto.generatedAt ? new Date(dto.generatedAt) : new Date();
  const dd = String(genDate.getDate()).padStart(2, '0');
  const mm = String(genDate.getMonth() + 1).padStart(2, '0');
  const yyyy = String(genDate.getFullYear());
  return {
    id: dto.id,
    type: (params.type as string) || dto.reportType || '',
    title: (params.title as string) || dto.reportType || 'Отчет',
    description: (params.description as string) || dto.errorMessage || '',
    status: dto.status === 'COMPLETED' ? 'DONE' : 'DRAFT',
    project: (params.project as string) || undefined,
    date: `${dd}.${mm}.${yyyy}`,
    from: (params.from as string) || undefined,
    to: (params.to as string) || undefined,
    notes: (params.notes as string) || undefined,
  };
};

const ReportsPage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || 'Петров А.В.';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const userId = useAppSelector((s) => s.auth.userId);
  const isTeacher = userRole === 'Преподаватель' || userRole === 'Заведующий кафедрой';
  const initials = useMemo(() => initialsFromName(userName), [userName]);

  const { data: reportsData, isLoading: reportsLoading, isError: reportsError } = useGetMyReportsQuery();
  const { data: projectsResp } = useGetUserProjectsQuery(userId ?? '', { skip: !userId });
  const [generateReportApi] = useGenerateReportMutation();

  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [createType, setCreateType] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createFrom, setCreateFrom] = useState('');
  const [createTo, setCreateTo] = useState('');
  const [createProject, setCreateProject] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [createErrors, setCreateErrors] = useState<{ type?: string; title?: string; period?: string }>({});

  const apiReports = useMemo(
    () => (reportsData?.data || []).map(mapReportDtoToItem),
    [reportsData],
  );

  const [localReports, setLocalReports] = useState<ReportItem[]>([]);
  const reports = apiReports.length > 0 ? apiReports : localReports;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const hay = `${r.title} ${r.description} ${r.type} ${r.project || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, reports]);

  const stats = useMemo(() => {
    const total = reports.length;
    const done = reports.filter((r) => r.status === 'DONE').length;
    const draft = reports.filter((r) => r.status === 'DRAFT').length;
    const now = new Date();
    const mmNow = String(now.getMonth() + 1).padStart(2, '0');
    const yyyyNow = String(now.getFullYear());
    const month = reports.filter((r) => r.date.endsWith(`.${mmNow}.${yyyyNow}`)).length;
    return { total, done, draft, month };
  }, [reports]);

  const selected = useMemo(() => (selectedId ? reports.find((r) => r.id === selectedId) : undefined), [reports, selectedId]);

  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreateType('');
    setCreateTitle('');
    setCreateFrom('');
    setCreateTo('');
    setCreateProject('');
    setCreateNotes('');
    setCreateErrors({});
  };

  const openCreate = () => setIsCreateOpen(true);

  const submitCreate = async () => {
    const nextErrors: { type?: string; title?: string; period?: string } = {};
    if (!createType) nextErrors.type = 'Выберите тип отчета';
    if (!createTitle.trim()) nextErrors.title = 'Введите название отчета';
    if ((createFrom && !createTo) || (!createFrom && createTo)) nextErrors.period = 'Укажите даты С и По';
    setCreateErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await generateReportApi({
        reportType: createType,
        parameters: {
          title: createTitle.trim(),
          type: createType,
          from: createFrom || undefined,
          to: createTo || undefined,
          project: createProject || undefined,
          notes: createNotes || undefined,
        },
        format: 'XLSX',
      }).unwrap();
      closeCreate();
    } catch {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = String(now.getFullYear());
      const date = `${dd}.${mm}.${yyyy}`;

      const created: ReportItem = {
        id: `local-${Date.now()}`,
        type: createType,
        title: createTitle.trim(),
        description: 'Отчет будет сгенерирован автоматически на основе выбранного периода и данных.',
        status: 'DRAFT',
        project: createProject || undefined,
        date,
        from: createFrom || undefined,
        to: createTo || undefined,
        notes: createNotes || undefined,
        metrics: { tasksDone: 0, progress: 0, hours: 0 },
      };
      setLocalReports((prev) => [created, ...prev]);
      closeCreate();
    }
  };

  const downloadReport = (report: ReportItem, asPdf: boolean) => {
    const title = report.title.replace(/[\\r\\n]+/g, ' ').trim();
    const payload = [
      report.title,
      `Тип: ${report.type}`,
      `Статус: ${report.status === 'DONE' ? 'Завершен' : 'Черновик'}`,
      `Дата: ${report.date}`,
      report.project ? `Проект: ${report.project}` : '',
      report.from && report.to ? `Период: ${report.from} — ${report.to}` : '',
      '',
      report.description,
      '',
      report.notes ? `Заметки: ${report.notes}` : '',
    ]
      .filter(Boolean)
      .join('\\n');
    const blob = new Blob([payload], { type: asPdf ? 'application/pdf' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asPdf ? `${title}.pdf` : `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!isCreateOpen && !selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCreate();
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCreateOpen, selectedId]);

  if (!isTeacher) {
    return (
      <div className={styles.page}>
        <Sidebar />

        <div className={styles.content}>
          <div className={styles.topbar}>
            <div className={styles.titleWrap}>
              <div className={styles.title}>Отчеты</div>
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

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Отчеты</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
              <img src={SearchIcon} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Поиск отчетов..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className={styles.createBtn} onClick={openCreate}>
              <img src={AddIcon} className={styles.createIcon} />
              Создать отчет
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Всего отчетов</div>
                <div className={styles.statValue}>{stats.total}</div>
              </div>
              <div className={styles.statIconWrap}>
                <img src={FileIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Завершенных</div>
                <div className={styles.statValue}>{stats.done}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapGreen}`}>
                <img src={DownloadIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>Черновиков</div>
                <div className={styles.statValue}>{stats.draft}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapYellow}`}>
                <img src={TagIcon} className={styles.statIcon} />
              </div>
            </div>
            <div className={styles.statCard}>
              <div>
                <div className={styles.statLabel}>За этот месяц</div>
                <div className={styles.statValue}>{stats.month}</div>
              </div>
              <div className={`${styles.statIconWrap} ${styles.statIconWrapPurple}`}>
                <img src={CalendarIcon} className={styles.statIcon} />
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Мои отчеты</div>
              <div className={styles.panelSub}>Найдено отчетов: {filtered.length}</div>
            </div>
            <div className={styles.list}>
              {reportsLoading && <p className={styles.loading}>Загрузка...</p>}
              {reportsError && <p className={styles.error}>Ошибка загрузки данных</p>}
              {!reportsLoading && !reportsError && filtered.length === 0 && (
                <p className={styles.empty}>Нет данных</p>
              )}
              {filtered.map((r) => (
                <div key={r.id} className={styles.row}>
                  <div className={styles.fileIconWrap}>
                    <img src={FileIcon} className={styles.fileIcon} />
                  </div>
                  <div>
                    <div className={styles.rowTitle}>
                      <div className={styles.rowTitleText}>{r.title}</div>
                      <span className={`${styles.status} ${r.status === 'DONE' ? styles.statusDone : styles.statusDraft}`}>
                        {r.status === 'DONE' ? 'Завершен' : 'Черновик'}
                      </span>
                    </div>
                    <div className={styles.rowDesc}>{r.description}</div>
                    <div className={styles.chips}>
                      <span className={styles.chip}>{r.type}</span>
                      {typeof r.eduMetrics?.students === 'number' && (
                        <span className={`${styles.chip} ${styles.chipMuted}`}>{r.eduMetrics.students} студента</span>
                      )}
                      {r.project && <span className={`${styles.chip} ${styles.chipMuted}`}>{r.project}</span>}
                      <span className={`${styles.chip} ${styles.chipMuted}`}>{r.date}</span>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.action} onClick={() => setSelectedId(r.id)}>
                      <img src={EyeIcon} className={styles.actionIcon} />
                      <span className={styles.actionText}>Просмотр</span>
                    </button>
                    <button className={styles.action} onClick={() => downloadReport(r, false)}>
                      <img src={DownloadIcon} className={styles.actionIcon} />
                      <span className={styles.actionText}>Скачать</span>
                    </button>
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
            <button className={styles.closeBtn} onClick={closeCreate} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.closeIcon} />
            </button>
            <div className={styles.modalTitle}>Создать новый отчет</div>
            <div className={styles.modalSub}>Заполните информацию для генерации отчета</div>
            <div className={styles.form}>
              <div>
                <div className={styles.fieldLabel}>Тип отчета</div>
                <select className={styles.select} value={createType} onChange={(e) => setCreateType(e.target.value)}>
                  <option value="">Выберите тип отчета</option>
                  <option value="Проектный отчет">Проектный отчет</option>
                  <option value="Активность">Активность</option>
                  <option value="Практика">Практика</option>
                  <option value="Научный отчет">Научный отчет</option>
                  <option value="Академический">Академический</option>
                </select>
                {createErrors.type && <div className={styles.error}>{createErrors.type}</div>}
              </div>
              <div>
                <div className={styles.fieldLabel}>Название отчета</div>
                <input
                  className={styles.input}
                  placeholder="Введите название отчета"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                />
                {createErrors.title && <div className={styles.error}>{createErrors.title}</div>}
              </div>
              <div>
                <div className={styles.fieldLabel}>Период</div>
                <div className={styles.twoCols}>
                  <div>
                    <div className={styles.fieldLabel}>С</div>
                    <input className={styles.input} type="date" value={createFrom} onChange={(e) => setCreateFrom(e.target.value)} />
                  </div>
                  <div>
                    <div className={styles.fieldLabel}>По</div>
                    <input className={styles.input} type="date" value={createTo} onChange={(e) => setCreateTo(e.target.value)} />
                  </div>
                </div>
                {createErrors.period && <div className={styles.error}>{createErrors.period}</div>}
              </div>
              <div>
                <div className={styles.fieldLabel}>Группа/Проект (опционально)</div>
                <select className={styles.select} value={createProject} onChange={(e) => setCreateProject(e.target.value)}>
                  <option value="">Выберите группу или проект</option>
                  {(projectsResp?.data || []).map((p) => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className={styles.fieldLabel}>Дополнительные заметки</div>
                <textarea
                  className={styles.textarea}
                  placeholder="Добавьте важные детали для отчета"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={closeCreate}>
                Отмена
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitCreate}>
                <img src={FileIcon} className={styles.btnPrimaryIcon} />
                Сгенерировать отчет
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelectedId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedId(null)} aria-label="Закрыть">
              <img src={CloseIcon} className={styles.closeIcon} />
            </button>
            <div className={styles.modalTopRow}>
              <div>
                <div className={styles.modalTitle}>{selected.title}</div>
                <div className={styles.pillRow}>
                  <span className={`${styles.pill} ${selected.status === 'DONE' ? styles.pillDone : ''}`}>
                    {selected.status === 'DONE' ? 'Завершен' : 'Черновик'}
                  </span>
                  <span className={styles.pill}>{selected.type}</span>
                  <span className={styles.pill}>{selected.date}</span>
                </div>
              </div>
              <button className={styles.downloadBtn} onClick={() => downloadReport(selected, true)}>
                <img src={DownloadIcon} className={styles.btnPrimaryIcon} />
                Скачать PDF
              </button>
            </div>

            {selected.project && (
              <>
                <div className={styles.sectionLabel}>Группа/Проект</div>
                <div className={styles.detailsBox}>{selected.project}</div>
              </>
            )}

            {selected.students?.length ? (
              <>
                <div className={styles.sectionLabel}>Студенты</div>
                <div className={styles.studentsRow}>
                  {selected.students.map((s) => (
                    <span key={s} className={styles.studentChip}>
                      {s}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            <div className={styles.sectionLabel}>Краткое содержание</div>
            <div className={styles.detailsBox}>{selected.description}</div>

            <div className={styles.sectionLabel}>Основные показатели</div>
            {selected.eduMetrics ? (
              <div className={styles.kpiGrid}>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Студентов</div>
                  <div className={styles.kpiValue}>{selected.eduMetrics.students}</div>
                </div>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Средний балл</div>
                  <div className={styles.kpiValue}>{selected.eduMetrics.avgGrade}</div>
                </div>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Успеваемость</div>
                  <div className={styles.kpiValue}>{selected.eduMetrics.successRate}%</div>
                </div>
              </div>
            ) : (
              <div className={styles.kpiGrid}>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Завершено задач</div>
                  <div className={styles.kpiValue}>{selected.metrics?.tasksDone ?? 0}</div>
                </div>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Прогресс</div>
                  <div className={styles.kpiValue}>{selected.metrics?.progress ?? 0}%</div>
                </div>
                <div className={styles.kpi}>
                  <div className={styles.kpiLabel}>Часов работы</div>
                  <div className={styles.kpiValue}>{selected.metrics?.hours ?? 0}</div>
                </div>
              </div>
            )}

            <div className={styles.sectionLabel}>Детали</div>
            <div className={styles.detailsBox}>
              Это детальный просмотр отчета преподавателя. Здесь отображается полная информация о курсе, проекте или мероприятии.
              <ul className={styles.detailsList}>
                <li>Положительная динамика успеваемости</li>
                <li>Высокая активность студентов</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
