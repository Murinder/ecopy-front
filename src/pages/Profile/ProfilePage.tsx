import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
import NotificationBell from '../../components/NotificationPanel';
import EditIcon from '../../assets/icons/ui-edit.svg';
import SaveIcon from '../../assets/icons/ui-save.svg';
import MailIcon from '../../assets/icons/ui-mail.svg';
import PhoneIcon from '../../assets/icons/ui-phone.svg';
import PinIcon from '../../assets/icons/ui-pin.svg';
import CalendarIcon from '../../assets/icons/ui-calendar.svg';
import GitHubIcon from '../../assets/icons/ui-github.svg';
import LinkIcon from '../../assets/icons/ui-link.svg';
import AwardIcon from '../../assets/icons/ui-award.svg';
import PeopleIcon from '../../assets/icons/mjbmqg4r-g71l6vp.svg';
import FileIcon from '../../assets/icons/ui-file.svg';
import Sidebar from '../../components/Sidebar';
import { useAppSelector } from '../../app/hooks';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUserLinksQuery,
  useCreateUserLinkMutation,
  useUpdateUserLinkMutation,
  useDeleteUserLinkMutation,
  useGetUserSkillsQuery,
  useCreateUserSkillMutation,
  useDeleteUserSkillMutation,
  useGetUserLanguagesQuery,
  useCreateUserLanguageMutation,
  useDeleteUserLanguageMutation,
  useGetFacultyQuery,
  useGetDepartmentQuery,
  useGetHeadProfileDetailsQuery,
} from '../../services/coreApi';
import { useGetRatingBreakdownQuery } from '../../services/ratingApi';
import {
  useGetUserDocumentsQuery,
  useUploadUserDocumentMutation,
  useDeleteUserDocumentMutation,
} from '../../services/coreApi';
import type { UserDocumentDto } from '../../services/coreApi';

const initialsFromName = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'ИИ';

type Profile = {
  fullName: string;
  track: string;
  course: string;
  group: string;
  role: string;
  studentId: string;
  form: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  github: string;
  linkedin: string;
  portfolio: string;
  faculty: string;
  department: string;
  direction: string;
  admissionYear: string;
  emergencyName: string;
  emergencyPhone: string;
  skills: string[];
  languages: string[];
  interests: string[];
};

type TeacherEducationItem = {
  id: string;
  degree: string;
  university: string;
  program: string;
  year: string;
};

type TeacherAwardItem = {
  id: string;
  title: string;
  year: string;
};

type TeacherProfile = {
  fullName: string;
  position: string;
  degree: string;
  role: string;
  teacherId: string;
  experience: string;
  about: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  faculty: string;
  department: string;
  education: TeacherEducationItem[];
  disciplines: string[];
  interests: string[];
  stats: { publications: number; conferences: number; patents: number };
  awards: TeacherAwardItem[];
  website: string;
  linkedin: string;
};

type HeadProfile = {
  fullName: string;
  role: string;
  degree: string;
  title: string;
  headSince: string;
  headId: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  dissertationTitle: string;
  dissertationYear: string;
  education: TeacherEducationItem[];
  interests: string[];
  awards: TeacherAwardItem[];
  experience: { total: string; teaching: string; head: string; from: string };
  publications: { total: number; monographs: number; articles: number; conferences: number };
  leadership: { phd: number; masters: number; bachelors: number };
  admin: { teachers: number; students: number; yearsLeading: number };
};

const formatBirthDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU');
};

const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'Начальный',
  2: 'Базовый',
  3: 'Средний',
  4: 'Продвинутый',
  5: 'Эксперт',
};

const LANG_PROFICIENCY_LABELS: Record<string, string> = {
  BEGINNER: 'Начальный',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
  FLUENT: 'Свободный',
  NATIVE: 'Родной',
};

const StudentProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [pendingSkillLevels, setPendingSkillLevels] = useState<Record<string, number>>({});
  const [newLangName, setNewLangName] = useState('');
  const [newLangProficiency, setNewLangProficiency] = useState('INTERMEDIATE');
  const [showLangForm, setShowLangForm] = useState(false);
  const [pendingLangProficiencies, setPendingLangProficiencies] = useState<Record<string, string>>({});
  const [showDocuments, setShowDocuments] = useState(false);
  const { data: profileData, isLoading, isError, refetch: refetchProfile } = useGetProfileQuery(userId, { skip: !userId });
  const { data: linksData } = useGetUserLinksQuery(userId, { skip: !userId });
  const { data: skillsData } = useGetUserSkillsQuery(userId, { skip: !userId });
  const { data: languagesData } = useGetUserLanguagesQuery(userId, { skip: !userId });

  const facultyId = profileData?.data?.facultyId;
  const departmentId = profileData?.data?.departmentId;
  const { data: facultyData } = useGetFacultyQuery(facultyId ?? '', { skip: !facultyId });
  const { data: departmentData } = useGetDepartmentQuery(departmentId ?? '', { skip: !departmentId });
  const { data: ratingResp } = useGetRatingBreakdownQuery(userId, { skip: !userId });
  const ratingBreakdown = ratingResp?.data;

  const [updateProfileApi] = useUpdateProfileMutation();
  const [createUserLink] = useCreateUserLinkMutation();
  const [updateUserLink] = useUpdateUserLinkMutation();
  const [deleteUserLink] = useDeleteUserLinkMutation();
  const [createUserSkill] = useCreateUserSkillMutation();
  const [deleteUserSkill] = useDeleteUserSkillMutation();
  const [createUserLanguage] = useCreateUserLanguageMutation();
  const [deleteUserLanguage] = useDeleteUserLanguageMutation();

  const initial = useMemo<Profile>(() => {
    const d = profileData?.data;
    const github = linksData?.find(l => l.linkType === 'GITHUB')?.url ?? '';
    const linkedin = linksData?.find(l => l.linkType === 'LINKEDIN')?.url ?? '';
    const portfolio = linksData?.find(l => l.linkType === 'PORTFOLIO')?.url ?? '';
    const skills = skillsData?.map(s => s.skillName) ?? [];
    const languages = languagesData?.map(l => l.language) ?? [];
    const resolvedFaculty = facultyData?.name ?? '';
    const resolvedDepartment = departmentData?.name ?? '';
    if (d) {
      return {
        fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || userName || '',
        track: d.studyProgram || '',
        course: d.currentSemester ? `${Math.ceil(d.currentSemester / 2)} курс` : '',
        group: d.groupName ? `Группа ${d.groupName}` : '',
        role: 'Студент',
        studentId: d.id || '',
        form: d.studyForm || 'Очная',
        about: d.bio || '',
        email: d.email || '',
        phone: d.phoneNumber || '',
        address: d.address || '',
        birthDate: d.birthDate || '',
        github,
        linkedin,
        portfolio,
        faculty: resolvedFaculty,
        department: resolvedDepartment,
        direction: d.studyProgram || '',
        admissionYear: d.enrollmentYear ? String(d.enrollmentYear) : '',
        emergencyName: d.emergencyContactName || '',
        emergencyPhone: d.emergencyContactPhone || '',
        skills,
        languages,
        interests: d.interests ? d.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
    }
    return {
      fullName: userName || '',
      track: '', course: '', group: '', role: 'Студент', studentId: '', form: 'Очная',
      about: '', email: '', phone: '', address: '', birthDate: '',
      github, linkedin, portfolio, faculty: resolvedFaculty, department: resolvedDepartment,
      direction: '', admissionYear: '', emergencyName: '', emergencyPhone: '',
      skills, languages, interests: [],
    };
  }, [profileData, linksData, skillsData, languagesData, userName, facultyData, departmentData]);

  const [profile, setProfile] = useState<Profile>(initial);
  const [draft, setDraft] = useState<Profile>(initial);

  useEffect(() => {
    setProfile(initial);
    setDraft(initial);
  }, [initial]);

  const initials = useMemo(() => initialsFromName(profile.fullName), [profile.fullName]);

  const startEdit = () => {
    setDraft(profile);
    setError(null);
    setIsEditing(true);
  };

  const save = async () => {
    const errors: string[] = [];
    if (!draft.email.trim()) errors.push('Email обязателен');
    if (!draft.phone.trim()) errors.push('Телефон обязателен');
    if (!draft.fullName.trim()) errors.push('ФИО обязательно');
    if (errors.length) {
      setError(errors.join(' • '));
      return;
    }
    try {
      const nameParts = draft.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      await updateProfileApi({
        userId,
        data: {
          firstName,
          lastName,
          email: draft.email,
          phoneNumber: draft.phone,
          address: draft.address,
          bio: draft.about,
          birthDate: draft.birthDate || undefined,
          emergencyContactName: draft.emergencyName || undefined,
          emergencyContactPhone: draft.emergencyPhone || undefined,
          interests: draft.interests.length ? draft.interests.join(',') : undefined,
          studyForm: draft.form || undefined,
        },
      }).unwrap();

      const linkOps: Promise<unknown>[] = [];
      for (const [field, linkType] of [
        ['github', 'GITHUB'],
        ['linkedin', 'LINKEDIN'],
        ['portfolio', 'PORTFOLIO'],
      ] as const) {
        const oldUrl = profile[field];
        const newUrl = draft[field].trim();
        if (newUrl === oldUrl) continue;
        if (newUrl && !oldUrl) {
          linkOps.push(createUserLink({ userId, linkType, url: newUrl }).unwrap());
        } else if (newUrl && oldUrl) {
          linkOps.push(updateUserLink({ userId, linkType, url: newUrl }).unwrap());
        } else if (!newUrl && oldUrl) {
          linkOps.push(deleteUserLink({ userId, linkType }).unwrap());
        }
      }

      const addedSkills = draft.skills.filter(s => !profile.skills.includes(s));
      const removedSkills = profile.skills.filter(s => !draft.skills.includes(s));
      const skillOps = [
        ...addedSkills.map(s => createUserSkill({ userId, skillName: s, level: pendingSkillLevels[s] || 1, verified: false }).unwrap()),
        ...removedSkills.map(s => deleteUserSkill({ userId, skillName: s }).unwrap()),
      ];

      const addedLangs = draft.languages.filter(l => !profile.languages.includes(l));
      const removedLangs = profile.languages.filter(l => !draft.languages.includes(l));
      const langOps = [
        ...addedLangs.map(l => createUserLanguage({ userId, language: l, proficiency: (pendingLangProficiencies[l] || 'INTERMEDIATE') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE' }).unwrap()),
        ...removedLangs.map(l => deleteUserLanguage({ userId, language: l }).unwrap()),
      ];

      await Promise.all([...linkOps, ...skillOps, ...langOps]);

      await refetchProfile();
      setIsEditing(false);
      setError(null);
    } catch {
      setError('Ошибка при сохранении профиля');
    }
  };

  const addSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed || draft.skills.includes(trimmed)) return;
    setDraft((p) => ({ ...p, skills: [...p.skills, trimmed] }));
    setPendingSkillLevels((prev) => ({ ...prev, [trimmed]: newSkillLevel }));
    setNewSkillName('');
    setNewSkillLevel(1);
    setShowSkillForm(false);
  };

  const removeSkill = (name: string) => {
    setDraft((p) => ({ ...p, skills: p.skills.filter(s => s !== name) }));
    setPendingSkillLevels((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const addLanguage = () => {
    const trimmed = newLangName.trim();
    if (!trimmed || draft.languages.includes(trimmed)) return;
    setDraft((p) => ({ ...p, languages: [...p.languages, trimmed] }));
    setPendingLangProficiencies((prev) => ({ ...prev, [trimmed]: newLangProficiency }));
    setNewLangName('');
    setNewLangProficiency('INTERMEDIATE');
    setShowLangForm(false);
  };

  const removeLanguage = (name: string) => {
    setDraft((p) => ({ ...p, languages: p.languages.filter(l => l !== name) }));
    setPendingLangProficiencies((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>Загрузка профиля...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isError && !profile.fullName) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.main} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>Ошибка загрузки профиля. Попробуйте позже.</div>
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
            <div className={styles.title}>Личный кабинет</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatarSmall}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.avatarBig}>{initials}</div>
            <div>
              <div className={styles.name}>{profile.fullName}</div>
              <div className={styles.metaLine}>
                {profile.track} • {profile.course} • {profile.group}
              </div>
              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{profile.role}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>ID: {profile.studentId}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>{profile.form}</span>
              </div>
              <div className={styles.about}>{profile.about}</div>
            </div>
            <div>
              {isEditing ? (
                <button className={styles.saveBtn} onClick={save}>
                  <img src={SaveIcon} className={styles.btnIcon} />
                  Сохранить
                </button>
              ) : (
                <button className={styles.editBtn} onClick={startEdit}>
                  <img src={EditIcon} className={styles.btnIcon} />
                  Редактировать
                </button>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Контактная информация</div>
              <div className={styles.kv}>
                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>
                    <img src={MailIcon} className={styles.kvIcon} />
                    Email
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>{profile.email}</div>
                  )}
                </div>

                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>
                    <img src={PhoneIcon} className={styles.kvIcon} />
                    Телефон
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>{profile.phone}</div>
                  )}
                </div>

                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>
                    <img src={PinIcon} className={styles.kvIcon} />
                    Адрес
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.address} onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>{profile.address}</div>
                  )}
                </div>

                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>
                    <img src={CalendarIcon} className={styles.kvIcon} />
                    Дата рождения
                  </div>
                  {isEditing ? (
                    <input className={styles.input} type="date" value={draft.birthDate} onChange={(e) => setDraft((p) => ({ ...p, birthDate: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>
                      {formatBirthDate(profile.birthDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Ссылки</div>
              <div className={styles.kv}>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>
                    <img src={GitHubIcon} className={styles.kvIcon} />
                    GitHub
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.github} onChange={(e) => setDraft((p) => ({ ...p, github: e.target.value }))} />
                  ) : profile.github ? (
                    <a className={styles.linkValue} href={profile.github} target="_blank" rel="noreferrer">
                      {profile.github}
                    </a>
                  ) : (
                    <div className={styles.kvValue}>—</div>
                  )}
                </div>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>
                    <img src={LinkIcon} className={styles.kvIcon} />
                    LinkedIn
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.linkedin} onChange={(e) => setDraft((p) => ({ ...p, linkedin: e.target.value }))} />
                  ) : profile.linkedin ? (
                    <a className={styles.linkValue} href={profile.linkedin} target="_blank" rel="noreferrer">
                      {profile.linkedin}
                    </a>
                  ) : (
                    <div className={styles.kvValue}>—</div>
                  )}
                </div>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>
                    <img src={LinkIcon} className={styles.kvIcon} />
                    Портфолио
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.portfolio} onChange={(e) => setDraft((p) => ({ ...p, portfolio: e.target.value }))} />
                  ) : profile.portfolio ? (
                    <a className={styles.linkValue} href={profile.portfolio} target="_blank" rel="noreferrer">
                      {profile.portfolio}
                    </a>
                  ) : (
                    <div className={styles.kvValue}>—</div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Академическая информация</div>
              <div className={styles.kv}>
                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>Факультет</div>
                  <div className={styles.kvValue}>{profile.faculty}</div>
                </div>
                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>Кафедра</div>
                  <div className={styles.kvValue}>{profile.department}</div>
                </div>
                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>Направление</div>
                  <div className={styles.kvValue}>{profile.direction}</div>
                </div>
                <div className={styles.kvItem}>
                  <div className={styles.kvLabel}>Год поступления</div>
                  <div className={styles.kvValue}>{profile.admissionYear}</div>
                </div>
              </div>

              <div className={styles.cardTitle} style={{ marginTop: 14 }}>Успеваемость</div>
              <div className={styles.progressRow}>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#3a76f0' }}>{ratingBreakdown?.totalScore != null ? ratingBreakdown.totalScore : '—'}</div>
                  <div className={styles.miniLabel}>Общий балл</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#16a34a' }}>{ratingBreakdown?.academicScore != null ? ratingBreakdown.academicScore : '—'}</div>
                  <div className={styles.miniLabel}>Академический</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#8b5cf6' }}>{profile.course || '—'}</div>
                  <div className={styles.miniLabel}>Семестр</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#f97316' }}>{ratingBreakdown?.monthGrowth != null ? `+${ratingBreakdown.monthGrowth}` : '—'}</div>
                  <div className={styles.miniLabel}>Рост за месяц</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Экстренный контакт</div>
              <div className={styles.kv}>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>Контактное лицо</div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.emergencyName} onChange={(e) => setDraft((p) => ({ ...p, emergencyName: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>{profile.emergencyName}</div>
                  )}
                </div>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>Телефон</div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.emergencyPhone} onChange={(e) => setDraft((p) => ({ ...p, emergencyPhone: e.target.value }))} />
                  ) : (
                    <div className={styles.kvValue}>{profile.emergencyPhone}</div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <>
                  <div className={styles.cardTitle} style={{ marginTop: 14 }}>Быстрые действия</div>
                  <div className={styles.actionsList}>
                    <button className={styles.actionBtn} onClick={async () => {
                      try {
                        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                        const authStr = localStorage.getItem('auth');
                        const token = authStr ? JSON.parse(authStr)?.token?.accessToken : null;
                        const res = await fetch(`${base}/api/v1/calendar/export.ics`, {
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });
                        if (!res.ok) throw new Error('Ошибка загрузки');
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'schedule.ics';
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch {
                        alert('Не удалось скачать расписание');
                      }
                    }}>
                      <img src={CalendarIcon} className={styles.actionIcon} />
                      Скачать расписание (.ics)
                    </button>
                    <button className={styles.actionBtn} onClick={() => navigate('/events')}>
                      <img src={CalendarIcon} className={styles.actionIcon} />
                      Мероприятия
                    </button>
                    <button className={styles.actionBtn} onClick={() => setShowDocuments((v) => !v)}>
                      <img src={FileIcon} className={styles.actionIcon} />
                      Мои документы
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardTitle}>Навыки и языки</div>
              <div className={styles.kv} style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <div className={styles.kvLabel}>Технические навыки</div>
                  <div className={styles.chips}>
                    {isEditing ? (
                      <>
                        {draft.skills.map((s) => (
                          <span key={s} className={styles.chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {s}
                            {pendingSkillLevels[s] && (
                              <span style={{ fontSize: 11, opacity: 0.6 }}>{SKILL_LEVEL_LABELS[pendingSkillLevels[s]]}</span>
                            )}
                            <span onClick={() => removeSkill(s)} role="button" tabIndex={0} style={{ marginLeft: 2, cursor: 'pointer', opacity: 0.6 }}>×</span>
                          </span>
                        ))}
                        {showSkillForm ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <input
                              value={newSkillName}
                              onChange={(e) => setNewSkillName(e.target.value)}
                              placeholder="Навык"
                              style={{ width: 120, height: 28, borderRadius: 8, border: '1px solid #e5e5e5', padding: '0 8px', fontSize: 13 }}
                              onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                            />
                            <select
                              value={newSkillLevel}
                              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                              style={{ height: 28, borderRadius: 8, border: '1px solid #e5e5e5', padding: '0 4px', fontSize: 13 }}
                            >
                              {[1, 2, 3, 4, 5].map((lv) => (
                                <option key={lv} value={lv}>{SKILL_LEVEL_LABELS[lv]}</option>
                              ))}
                            </select>
                            <button onClick={addSkill} disabled={!newSkillName.trim()} style={{ height: 28, borderRadius: 8, border: 'none', background: '#3a76f0', color: '#fff', padding: '0 10px', fontSize: 13, cursor: 'pointer' }}>OK</button>
                            <button onClick={() => { setShowSkillForm(false); setNewSkillName(''); setNewSkillLevel(1); }} style={{ height: 28, borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', padding: '0 10px', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          </span>
                        ) : (
                          <span className={`${styles.chip} ${styles.addChip}`} onClick={() => setShowSkillForm(true)} role="button" tabIndex={0}>+ Добавить</span>
                        )}
                      </>
                    ) : (
                      <>
                        {(skillsData ?? []).map((s) => (
                          <span key={s.skillName} className={styles.chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {s.skillName}
                            <span style={{ fontSize: 11, opacity: 0.6 }}>{SKILL_LEVEL_LABELS[s.level] || `Lv${s.level}`}</span>
                            {s.verified && <span style={{ color: '#16a34a', fontSize: 12 }} title="Подтверждено">✓</span>}
                          </span>
                        ))}
                        {(skillsData ?? []).length === 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>—</span>}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.kvLabel}>Языки</div>
                  <div className={styles.chips}>
                    {isEditing ? (
                      <>
                        {draft.languages.map((l) => (
                          <span key={l} className={styles.chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {l}
                            {pendingLangProficiencies[l] && (
                              <span style={{ fontSize: 11, opacity: 0.6 }}>{LANG_PROFICIENCY_LABELS[pendingLangProficiencies[l]]}</span>
                            )}
                            <span onClick={() => removeLanguage(l)} role="button" tabIndex={0} style={{ marginLeft: 2, cursor: 'pointer', opacity: 0.6 }}>×</span>
                          </span>
                        ))}
                        {showLangForm ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <input
                              value={newLangName}
                              onChange={(e) => setNewLangName(e.target.value)}
                              placeholder="Язык"
                              style={{ width: 120, height: 28, borderRadius: 8, border: '1px solid #e5e5e5', padding: '0 8px', fontSize: 13 }}
                              onKeyDown={(e) => { if (e.key === 'Enter') addLanguage(); }}
                            />
                            <select
                              value={newLangProficiency}
                              onChange={(e) => setNewLangProficiency(e.target.value)}
                              style={{ height: 28, borderRadius: 8, border: '1px solid #e5e5e5', padding: '0 4px', fontSize: 13 }}
                            >
                              {Object.entries(LANG_PROFICIENCY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                            <button onClick={addLanguage} disabled={!newLangName.trim()} style={{ height: 28, borderRadius: 8, border: 'none', background: '#3a76f0', color: '#fff', padding: '0 10px', fontSize: 13, cursor: 'pointer' }}>OK</button>
                            <button onClick={() => { setShowLangForm(false); setNewLangName(''); setNewLangProficiency('INTERMEDIATE'); }} style={{ height: 28, borderRadius: 8, border: '1px solid #e5e5e5', background: '#fff', padding: '0 10px', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          </span>
                        ) : (
                          <span className={`${styles.chip} ${styles.addChip}`} onClick={() => setShowLangForm(true)} role="button" tabIndex={0}>+ Добавить</span>
                        )}
                      </>
                    ) : (
                      <>
                        {(languagesData ?? []).map((l) => (
                          <span key={l.language} className={styles.chip}>
                            {l.language}
                            <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 4 }}>
                              {LANG_PROFICIENCY_LABELS[l.proficiency] || l.proficiency}
                            </span>
                          </span>
                        ))}
                        {(languagesData ?? []).length === 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>—</span>}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.kvLabel}>Интересы</div>
                  <div className={styles.chips}>
                    {(isEditing ? draft.interests : profile.interests).map((i) => (
                      <span key={i} className={styles.chip}>
                        {i}
                        {isEditing && (
                          <span onClick={() => setDraft((p) => ({ ...p, interests: p.interests.filter(x => x !== i) }))} role="button" tabIndex={0} style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }}>×</span>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <span className={`${styles.chip} ${styles.addChip}`} onClick={() => { const v = window.prompt('Введите интерес'); if (v) setDraft((p) => ({ ...p, interests: [...p.interests, v.trim()] })); }} role="button" tabIndex={0}>+ Добавить</span>
                    )}
                    {!isEditing && profile.interests.length === 0 && <span style={{ color: '#94a3b8', fontSize: 14 }}>—</span>}
                  </div>
                </div>
              </div>
            </div>

            {showDocuments && (
              <DocumentsSection userId={userId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentsSection = ({ userId }: { userId: string }) => {
  const { data: docsResp } = useGetUserDocumentsQuery(userId);
  const documents = docsResp?.data ?? [];
  const [uploadUserDocument] = useUploadUserDocumentMutation();
  const [deleteUserDocument] = useDeleteUserDocumentMutation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('description', file.name);
      await uploadUserDocument(formData).unwrap();
    } catch {
      setUploadError('Ошибка при загрузке файла');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteUserDocument(docId).unwrap();
    } catch { /* handled */ }
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const handleDownload = async (doc: UserDocumentDto) => {
    try {
      const authStr = localStorage.getItem('auth');
      const token = authStr ? JSON.parse(authStr)?.token?.accessToken : null;
      const res = await fetch(`${baseUrl}/api/v1/user-documents/download/${doc.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || 'document';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setUploadError('Не удалось скачать документ');
    }
  };

  return (
    <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className={styles.cardTitle}>Мои документы</div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            background: '#3a76f0',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            border: 'none',
          }}
        >
          {uploading ? 'Загрузка...' : '+ Загрузить'}
        </button>
        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
      </div>
      {uploadError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{uploadError}</p>}
      {documents.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Нет загруженных документов</p>
      )}
      {documents.map((doc: UserDocumentDto) => (
        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={FileIcon} style={{ width: 16, height: 16, opacity: 0.5 }} />
            <button
              onClick={() => handleDownload(doc)}
              style={{ color: '#3a76f0', fontSize: 14, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {doc.fileName || 'Документ'}
            </button>
            {doc.uploadedAt && (
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}
          >
            Удалить
          </button>
        </div>
      ))}
    </div>
  );
};

const HeadProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profileData } = useGetProfileQuery(userId, { skip: !userId });
  const { data: headData } = useGetHeadProfileDetailsQuery(userId, { skip: !userId });
  // Trigger API calls for skills/links/languages (data available for future UI sections)
  useGetUserLinksQuery(userId, { skip: !userId });
  useGetUserSkillsQuery(userId, { skip: !userId });
  useGetUserLanguagesQuery(userId, { skip: !userId });
  const [updateProfileApi] = useUpdateProfileMutation();

  const p = profileData?.data;
  const h = headData?.data;
  const apiName = p ? [p.firstName, p.lastName].filter(Boolean).join(' ') : '';

  const parseEducation = (json?: string): TeacherEducationItem[] => {
    if (!json) return [];
    try {
      return (JSON.parse(json) as { degree: string; university: string; program: string; year: string }[]).map((e, i) => ({
        id: `edu-${i}`,
        degree: e.degree,
        university: e.university,
        program: e.program,
        year: e.year,
      }));
    } catch { return []; }
  };

  const currentYear = new Date().getFullYear();
  const headSinceYear = p?.headSince ? new Date(p.headSince).getFullYear() : undefined;
  const teachingYears = h?.teachingStartYear ? currentYear - h.teachingStartYear : 0;

  const initial = useMemo<HeadProfile>(
    () => ({
      fullName: apiName || userName?.trim() || '',
      role: 'Заведующий кафедрой',
      degree: p?.degree || '',
      title: p?.academicTitle || '',
      headSince: headSinceYear ? String(headSinceYear) : '',
      headId: p?.teacherId || '',
      email: p?.email || '',
      phone: p?.phoneNumber || '',
      faculty: p?.facultyName || '',
      department: p?.departmentName || '',
      dissertationTitle: p?.dissertationTitle || '',
      dissertationYear: p?.dissertationYear ? String(p.dissertationYear) : '',
      education: parseEducation(p?.educationHistory),
      interests: p?.interests ? p.interests.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      awards: (h?.awards || []).map((a) => ({ id: a.id, title: a.title, year: a.year })),
      experience: {
        total: teachingYears ? `${teachingYears} лет` : '—',
        teaching: teachingYears ? `${teachingYears} лет` : '—',
        head: headSinceYear ? `с ${headSinceYear}` : '—',
        from: p?.headSince ? new Date(p.headSince).toLocaleDateString('ru-RU') : '—',
      },
      publications: {
        total: h?.publications ?? 0,
        monographs: h?.monographs ?? 0,
        articles: h?.articles ?? 0,
        conferences: h?.conferences ?? 0,
      },
      leadership: {
        phd: h?.supervisedPhd ?? 0,
        masters: h?.supervisedMasters ?? 0,
        bachelors: h?.supervisedBachelors ?? 0,
      },
      admin: {
        teachers: h?.departmentTeacherCount ?? 0,
        students: h?.departmentStudentCount ?? 0,
        yearsLeading: headSinceYear ? currentYear - headSinceYear : 0,
      },
    }),
    [userName, apiName, profileData, headData]
  );

  const [profile, setProfile] = useState<HeadProfile>(initial);
  const [draft, setDraft] = useState<HeadProfile>(initial);

  useEffect(() => {
    setProfile(initial);
    setDraft(initial);
  }, [initial]);

  const initials = useMemo(() => initialsFromName(profile.fullName), [profile.fullName]);

  const startEdit = () => {
    setDraft(profile);
    setError(null);
    setIsEditing(true);
  };

  const save = async () => {
    const errors: string[] = [];
    if (!draft.fullName.trim()) errors.push('ФИО обязательно');
    if (!draft.email.trim()) errors.push('Email обязателен');
    if (!draft.phone.trim()) errors.push('Телефон обязателен');
    if (errors.length) {
      setError(errors.join(' • '));
      return;
    }
    try {
      const nameParts = draft.fullName.trim().split(/\s+/);
      await updateProfileApi({
        userId,
        data: {
          firstName: nameParts[0] || '',
          lastName: nameParts[1] || '',
          email: draft.email,
          phoneNumber: draft.phone,
          degree: draft.degree || undefined,
          academicTitle: draft.title || undefined,
          dissertationTitle: draft.dissertationTitle || undefined,
          dissertationYear: draft.dissertationYear ? Number(draft.dissertationYear) : undefined,
          interests: draft.interests.length ? draft.interests.join(',') : undefined,
        },
      }).unwrap();
      setProfile(draft);
      setIsEditing(false);
      setError(null);
    } catch {
      setError('Ошибка при сохранении профиля');
    }
  };


  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Личный кабинет</div>
            <div className={styles.subtitle}>{profile.department}</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatarSmall}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.avatarBig}>{initials}</div>
            <div>
              <div className={styles.name}>{profile.fullName}</div>
              <div className={styles.teacherMetaLine}>
                {profile.role} • {profile.degree}
              </div>
              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{profile.role}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>{profile.title}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>ID: {profile.headId}</span>
              </div>
              <div className={styles.headHighlights}>
                <div className={styles.headHighlightRow}>
                  <img src={PinIcon} className={styles.headHighlightIcon} />
                  Заведующий кафедрой
                </div>
                {profile.awards[0] && (
                  <div className={styles.headHighlightRow}>
                    <img src={AwardIcon} className={styles.headHighlightIcon} />
                    {profile.awards[0].title}
                  </div>
                )}
                {profile.awards[1] && (
                  <div className={styles.headHighlightRow}>
                    <img src={AwardIcon} className={styles.headHighlightIcon} />
                    {profile.awards[1].title}
                  </div>
                )}
              </div>
            </div>
            <div>
              {isEditing ? (
                <button className={styles.saveBtn} onClick={save} type="button">
                  <img src={SaveIcon} className={styles.btnIcon} />
                  Сохранить
                </button>
              ) : (
                <button className={styles.editBtn} onClick={startEdit} type="button">
                  <img src={EditIcon} className={styles.btnIcon} />
                  Редактировать
                </button>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>

          <div className={styles.teacherGrid}>
            <div className={styles.teacherCol}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Контактная информация</div>
                <div className={styles.kv} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={MailIcon} className={styles.kvIcon} />
                      Email
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.email}</div>
                    )}
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={PhoneIcon} className={styles.kvIcon} />
                      Телефон
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.phone}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Академическая информация</div>
                <div className={styles.kv}>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Факультет</div>
                    <div className={styles.kvValue}>{profile.faculty}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Кафедра</div>
                    <div className={styles.kvValue}>{profile.department}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Ученая степень</div>
                    <div className={styles.kvValue}>{profile.degree}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Ученое звание</div>
                    <div className={styles.kvValue}>{profile.title}</div>
                  </div>
                  <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.kvLabel}>Диссертация</div>
                    <div className={styles.kvValue}>{profile.dissertationTitle}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Год защиты</div>
                    <div className={styles.kvValue}>{profile.dissertationYear}</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Образование</div>
                <div className={styles.teacherEduList}>
                  {profile.education.map((e) => (
                    <div key={e.id} className={styles.teacherEduRow}>
                      <div className={styles.teacherEduIconWrap}>
                        <img src={AwardIcon} className={styles.teacherEduIcon} />
                      </div>
                      <div className={styles.teacherEduText}>
                        <div className={styles.teacherEduTitle}>{e.degree}</div>
                        <div className={styles.teacherEduSub}>{e.university}</div>
                        <div className={styles.teacherEduSub}>{e.program}</div>
                      </div>
                      <div className={styles.teacherEduYear}>{e.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Научные интересы</div>
                <div className={styles.chips}>
                  {profile.interests.map((i) => (
                    <span key={i} className={styles.chip}>
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Награды и достижения</div>
                <div className={styles.teacherAwards}>
                  {profile.awards.map((a) => (
                    <div key={a.id} className={styles.teacherAwardRow}>
                      <div className={styles.teacherAwardIconWrap}>
                        <img src={AwardIcon} className={styles.teacherAwardIcon} />
                      </div>
                      <div className={styles.teacherAwardText}>
                        <div className={styles.teacherAwardTitle}>{a.title}</div>
                        <div className={styles.teacherAwardYear}>{a.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.teacherCol}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Опыт работы</div>
                <div className={styles.headRows}>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Общий стаж:</div>
                    <div className={styles.headRowValue}>{profile.experience.total}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Преподавание:</div>
                    <div className={styles.headRowValue}>{profile.experience.teaching}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Заведующий:</div>
                    <div className={styles.headRowValue}>{profile.experience.head}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>С:</div>
                    <div className={styles.headRowValue}>{profile.experience.from}</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Публикации</div>
                <div className={styles.headMetricCard}>
                  <div className={styles.headMetricValue}>{profile.publications.total}</div>
                  <div className={styles.headMetricLabel}>Всего публикаций</div>
                </div>
                <div className={styles.headRows} style={{ marginTop: 12 }}>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Монографии:</div>
                    <div className={styles.headRowValue}>{profile.publications.monographs}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Статьи:</div>
                    <div className={styles.headRowValue}>{profile.publications.articles}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Конференции:</div>
                    <div className={styles.headRowValue}>{profile.publications.conferences}</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Научное руководство</div>
                <div className={styles.headTriGrid}>
                  <div className={`${styles.headTri} ${styles.headTriPurple}`}>
                    <div className={styles.headTriValue}>{profile.leadership.phd}</div>
                    <div className={styles.headTriLabel}>Аспиранты</div>
                  </div>
                  <div className={`${styles.headTri} ${styles.headTriBlue}`}>
                    <div className={styles.headTriValue}>{profile.leadership.masters}</div>
                    <div className={styles.headTriLabel}>Магистры</div>
                  </div>
                  <div className={`${styles.headTri} ${styles.headTriGreen}`}>
                    <div className={styles.headTriValue}>{profile.leadership.bachelors}</div>
                    <div className={styles.headTriLabel}>Бакалавры</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Административная работа</div>
                <div className={styles.headRows}>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>
                      <img src={PeopleIcon} className={styles.headRowIcon} />
                      Преподаватели:
                    </div>
                    <div className={styles.headRowValue}>{profile.admin.teachers}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>
                      <img src={PeopleIcon} className={styles.headRowIcon} />
                      Студенты:
                    </div>
                    <div className={styles.headRowValue}>{profile.admin.students}</div>
                  </div>
                  <div className={styles.headRow}>
                    <div className={styles.headRowLabel}>Лет руководства:</div>
                    <div className={styles.headRowValue}>{profile.admin.yearsLeading}</div>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Быстрые действия</div>
                  <div className={styles.actionsList}>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/activity')}>
                      <img src={AwardIcon} className={styles.actionIcon} />
                      Аналитика кафедры
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/teachers')}>
                      <img src={PeopleIcon} className={styles.actionIcon} />
                      Управление кафедрой
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/reports')}>
                      <img src={FileIcon} className={styles.actionIcon} />
                      Отчеты кафедры
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profileData } = useGetProfileQuery(userId, { skip: !userId });
  const [updateProfileApi] = useUpdateProfileMutation();

  const apiName = profileData?.data
    ? [profileData.data.firstName, profileData.data.lastName].filter(Boolean).join(' ')
    : '';

  const pd = profileData?.data;

  const initial = useMemo<TeacherProfile>(
    () => ({
      fullName: apiName || userName || '',
      position: pd?.position || '',
      degree: pd?.degree || '',
      role: 'Преподаватель',
      teacherId: pd?.teacherId || '',
      experience: pd?.experience || '',
      about: pd?.bio || '',
      email: pd?.email || '',
      phone: pd?.phoneNumber || '',
      office: pd?.office || '',
      officeHours: pd?.officeHours || '',
      faculty: pd?.facultyName || '',
      department: pd?.departmentName || '',
      // TODO: education, disciplines, interests, stats, awards need backend support
      education: [
        {
          id: 'e1',
          degree: 'Кандидат технических наук',
          university: 'Московский государственный университет',
          program: 'Системы автоматизации проектирования',
          year: '2012',
        },
        {
          id: 'e2',
          degree: 'Магистр',
          university: 'Московский государственный университет',
          program: 'Программная инженерия',
          year: '2008',
        },
      ],
      disciplines: ['Алгоритмы и структуры данных', 'Веб-разработка', 'Программная инженерия', 'Проектирование информационных систем'],
      interests: pd?.interests ? pd.interests.split(',').map((s: string) => s.trim()) : ['Искусственный интеллект', 'Машинное обучение', 'Веб-технологии', 'Облачные вычисления'],
      stats: { publications: 24, conferences: 15, patents: 3 },
      awards: [
        { id: 'a1', title: 'Лучший преподаватель года', year: '2023' },
        { id: 'a2', title: 'Грант РФФИ', year: '2022' },
        { id: 'a3', title: 'Благодарность ректора', year: '2021' },
      ],
      website: pd?.website || '',
      linkedin: pd?.linkedin || '',
    }),
    [userName, apiName, pd]
  );

  const [profile, setProfile] = useState<TeacherProfile>(initial);
  const [draft, setDraft] = useState<TeacherProfile>(initial);

  useEffect(() => {
    setProfile(initial);
    setDraft(initial);
  }, [initial]);

  const initials = useMemo(() => initialsFromName(profile.fullName), [profile.fullName]);

  const startEdit = () => {
    setDraft(profile);
    setError(null);
    setIsEditing(true);
  };

  const save = async () => {
    const errors: string[] = [];
    if (!draft.fullName.trim()) errors.push('ФИО обязательно');
    if (!draft.email.trim()) errors.push('Email обязателен');
    if (!draft.phone.trim()) errors.push('Телефон обязателен');
    if (errors.length) {
      setError(errors.join(' • '));
      return;
    }
    try {
      const nameParts = draft.fullName.trim().split(/\s+/);
      await updateProfileApi({
        userId,
        data: {
          firstName: nameParts[0] || '',
          lastName: nameParts[1] || '',
          email: draft.email,
          phoneNumber: draft.phone,
        },
      }).unwrap();
      setProfile(draft);
      setIsEditing(false);
      setError(null);
    } catch {
      setError('Ошибка при сохранении профиля');
    }
  };

  const addDiscipline = () => {
    const name = window.prompt('Введите дисциплину');
    if (!name) return;
    setDraft((p) => ({ ...p, disciplines: [...p.disciplines, name.trim()].filter(Boolean) }));
  };

  const addInterest = () => {
    const name = window.prompt('Введите интерес');
    if (!name) return;
    setDraft((p) => ({ ...p, interests: [...p.interests, name.trim()].filter(Boolean) }));
  };


  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.titleWrap}>
            <div className={styles.title}>Личный кабинет</div>
            <div className={styles.subtitle}>Добро пожаловать в вашу образовательную среду</div>
          </div>
          <div className={styles.topActions}>
            <div className={styles.notif}>
              <NotificationBell iconSrc={BellIcon} />
            </div>
            <div className={styles.avatarSmall}>{initials}</div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.avatarBig}>{initials}</div>
            <div>
              <div className={styles.name}>{profile.fullName}</div>
              <div className={styles.teacherMetaLine}>
                {profile.position} • {profile.degree}
              </div>
              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{profile.role}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>ID: {profile.teacherId}</span>
                <span className={`${styles.badge} ${styles.badgeOutline}`}>Стаж: {profile.experience}</span>
              </div>
              <div className={styles.about}>{profile.about}</div>
            </div>
            <div>
              {isEditing ? (
                <button className={styles.saveBtn} onClick={save} type="button">
                  <img src={SaveIcon} className={styles.btnIcon} />
                  Сохранить
                </button>
              ) : (
                <button className={styles.editBtn} onClick={startEdit} type="button">
                  <img src={EditIcon} className={styles.btnIcon} />
                  Редактировать
                </button>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>

          <div className={styles.teacherGrid}>
            <div className={styles.teacherCol}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Контактная информация</div>
                <div className={styles.kv} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={MailIcon} className={styles.kvIcon} />
                      Email
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.email}</div>
                    )}
                  </div>

                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={PhoneIcon} className={styles.kvIcon} />
                      Телефон
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.phone}</div>
                    )}
                  </div>

                  <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.kvLabel}>Кабинет</div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.office} onChange={(e) => setDraft((p) => ({ ...p, office: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.office}</div>
                    )}
                  </div>

                  <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.kvLabel}>Часы консультаций</div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.officeHours} onChange={(e) => setDraft((p) => ({ ...p, officeHours: e.target.value }))} />
                    ) : (
                      <div className={styles.kvValue}>{profile.officeHours}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Академическая информация</div>
                <div className={styles.kv}>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Должность</div>
                    <div className={styles.kvValue}>{profile.position}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Ученая степень</div>
                    <div className={styles.kvValue}>{profile.degree}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Факультет</div>
                    <div className={styles.kvValue}>{profile.faculty}</div>
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>Кафедра</div>
                    <div className={styles.kvValue}>{profile.department}</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Образование</div>
                <div className={styles.teacherEduList}>
                  {profile.education.map((e) => (
                    <div key={e.id} className={styles.teacherEduRow}>
                      <div className={styles.teacherEduIconWrap}>
                        <img src={AwardIcon} className={styles.teacherEduIcon} />
                      </div>
                      <div className={styles.teacherEduText}>
                        <div className={styles.teacherEduTitle}>{e.degree}</div>
                        <div className={styles.teacherEduSub}>{e.university}</div>
                        <div className={styles.teacherEduSub}>{e.program}</div>
                      </div>
                      <div className={styles.teacherEduYear}>{e.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Преподаваемые дисциплины</div>
                <div className={styles.teacherDisciplineGrid}>
                  {(isEditing ? draft.disciplines : profile.disciplines).map((d) => (
                    <div key={d} className={styles.teacherDisciplineTile}>
                      <img src={CalendarIcon} className={styles.teacherDisciplineIcon} />
                      <div className={styles.teacherDisciplineTitle}>{d}</div>
                    </div>
                  ))}
                  {isEditing && (
                    <button type="button" className={`${styles.teacherDisciplineTile} ${styles.teacherDisciplineAdd}`} onClick={addDiscipline}>
                      + Добавить
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Научные интересы</div>
                <div className={styles.chips}>
                  {(isEditing ? draft.interests : profile.interests).map((i) => (
                    <span key={i} className={styles.chip}>
                      {i}
                    </span>
                  ))}
                  {isEditing && (
                    <span className={`${styles.chip} ${styles.addChip}`} onClick={addInterest} role="button" tabIndex={0}>
                      + Добавить
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.teacherCol}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Научная деятельность</div>
                <div className={styles.teacherStatsCol}>
                  <div className={`${styles.teacherStatTile} ${styles.teacherStatBlue}`}>
                    <div className={styles.teacherStatValue}>{profile.stats.publications}</div>
                    <div className={styles.teacherStatLabel}>Публикаций</div>
                  </div>
                  <div className={`${styles.teacherStatTile} ${styles.teacherStatGreen}`}>
                    <div className={styles.teacherStatValue}>{profile.stats.conferences}</div>
                    <div className={styles.teacherStatLabel}>Конференций</div>
                  </div>
                  <div className={`${styles.teacherStatTile} ${styles.teacherStatPurple}`}>
                    <div className={styles.teacherStatValue}>{profile.stats.patents}</div>
                    <div className={styles.teacherStatLabel}>Патентов</div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Награды и достижения</div>
                <div className={styles.teacherAwards}>
                  {profile.awards.map((a) => (
                    <div key={a.id} className={styles.teacherAwardRow}>
                      <div className={styles.teacherAwardIconWrap}>
                        <img src={AwardIcon} className={styles.teacherAwardIcon} />
                      </div>
                      <div className={styles.teacherAwardText}>
                        <div className={styles.teacherAwardTitle}>{a.title}</div>
                        <div className={styles.teacherAwardYear}>{a.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Ссылки</div>
                <div className={styles.kv} style={{ gridTemplateColumns: '1fr' }}>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={LinkIcon} className={styles.kvIcon} />
                      Веб-сайт
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.website} onChange={(e) => setDraft((p) => ({ ...p, website: e.target.value }))} />
                    ) : (
                      <a className={styles.linkValue} href={profile.website} target="_blank" rel="noreferrer">
                        {profile.website}
                      </a>
                    )}
                  </div>
                  <div className={styles.kvItem}>
                    <div className={styles.kvLabel}>
                      <img src={LinkIcon} className={styles.kvIcon} />
                      LinkedIn
                    </div>
                    {isEditing ? (
                      <input className={styles.input} value={draft.linkedin} onChange={(e) => setDraft((p) => ({ ...p, linkedin: e.target.value }))} />
                    ) : (
                      <a className={styles.linkValue} href={profile.linkedin} target="_blank" rel="noreferrer">
                        {profile.linkedin}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Быстрые действия</div>
                  <div className={styles.actionsList}>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/schedule')}>
                      <img src={CalendarIcon} className={styles.actionIcon} />
                      Мое расписание
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/applications')}>
                      <img src={PeopleIcon} className={styles.actionIcon} />
                      Заявки студентов
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => navigate('/reports')}>
                      <img src={FileIcon} className={styles.actionIcon} />
                      Мои отчеты
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const userName = useAppSelector((s) => s.auth.userName) || '';
  const userId = useAppSelector((s) => s.auth.userId) || '';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';
  const isTeacher = userRole === 'Преподаватель';
  const isHead = userRole === 'Заведующий кафедрой';

  return isHead
    ? <HeadProfileView userName={userName} userId={userId} />
    : isTeacher
    ? <TeacherProfileView userName={userName} userId={userId} />
    : <StudentProfileView userName={userName} userId={userId} />;
};

export default ProfilePage;
