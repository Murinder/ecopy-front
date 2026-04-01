import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.scss';
import BellIcon from '../../assets/icons/mjbmqg4r-fcbhx7k.svg';
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
} from '../../services/coreApi';

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

const StudentProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profileData, isLoading, isError } = useGetProfileQuery(userId, { skip: !userId });
  const { data: linksData } = useGetUserLinksQuery(userId, { skip: !userId });
  const { data: skillsData } = useGetUserSkillsQuery(userId, { skip: !userId });
  const { data: languagesData } = useGetUserLanguagesQuery(userId, { skip: !userId });
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
    if (d) {
      return {
        fullName: [d.firstName, d.lastName].filter(Boolean).join(' ') || userName || '',
        track: d.studyProgram || '',
        course: d.currentSemester ? `${Math.ceil(d.currentSemester / 2)} курс` : '',
        group: d.groupName ? `Группа ${d.groupName}` : '',
        role: 'Студент',
        studentId: d.id || '',
        form: 'Очная',
        about: d.bio || '',
        email: d.email || '',
        phone: d.phoneNumber || '',
        address: d.address || '',
        birthDate: d.birthDate || '',
        github,
        linkedin,
        portfolio,
        faculty: '',
        department: '',
        direction: d.studyProgram || '',
        admissionYear: d.enrollmentYear ? String(d.enrollmentYear) : '',
        emergencyName: '',
        emergencyPhone: '',
        skills,
        languages,
        interests: [],
      };
    }
    return {
      fullName: userName || '',
      track: '', course: '', group: '', role: 'Студент', studentId: '', form: 'Очная',
      about: '', email: '', phone: '', address: '', birthDate: '',
      github, linkedin, portfolio, faculty: '', department: '',
      direction: '', admissionYear: '', emergencyName: '', emergencyPhone: '',
      skills, languages, interests: [],
    };
  }, [profileData, linksData, skillsData, languagesData, userName]);

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
      await updateProfileApi({
        userId,
        data: {
          firstName: nameParts[0] || '',
          lastName: nameParts[1] || '',
          email: draft.email,
          phoneNumber: draft.phone,
          address: draft.address,
          bio: draft.about,
          birthDate: draft.birthDate || undefined,
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
        ...addedSkills.map(s => createUserSkill({ userId, skillName: s, level: 1, verified: false }).unwrap()),
        ...removedSkills.map(s => deleteUserSkill({ userId, skillName: s }).unwrap()),
      ];

      const addedLangs = draft.languages.filter(l => !profile.languages.includes(l));
      const removedLangs = profile.languages.filter(l => !draft.languages.includes(l));
      const langOps = [
        ...addedLangs.map(l => createUserLanguage({ userId, language: l, proficiency: 'INTERMEDIATE' }).unwrap()),
        ...removedLangs.map(l => deleteUserLanguage({ userId, language: l }).unwrap()),
      ];

      await Promise.all([...linkOps, ...skillOps, ...langOps]);

      setProfile(draft);
      setIsEditing(false);
      setError(null);
    } catch {
      setError('Ошибка при сохранении профиля');
    }
  };

  const addSkill = () => {
    const name = window.prompt('Введите навык');
    if (!name) return;
    setDraft((p) => ({ ...p, skills: [...p.skills, name.trim()].filter(Boolean) }));
  };

  const removeSkill = (name: string) => {
    setDraft((p) => ({ ...p, skills: p.skills.filter(s => s !== name) }));
  };

  const addLanguage = () => {
    const name = window.prompt('Введите язык');
    if (!name) return;
    setDraft((p) => ({ ...p, languages: [...p.languages, name.trim()].filter(Boolean) }));
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
              <img src={BellIcon} className={styles.notifIcon} />
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
                      {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('ru-RU') : '—'}
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
                  ) : (
                    <a className={styles.linkValue} href={profile.github} target="_blank" rel="noreferrer">
                      {profile.github}
                    </a>
                  )}
                </div>
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
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
                <div className={styles.kvItem} style={{ gridColumn: '1 / -1' }}>
                  <div className={styles.kvLabel}>
                    <img src={LinkIcon} className={styles.kvIcon} />
                    Портфолио
                  </div>
                  {isEditing ? (
                    <input className={styles.input} value={draft.portfolio} onChange={(e) => setDraft((p) => ({ ...p, portfolio: e.target.value }))} />
                  ) : (
                    <a className={styles.linkValue} href={profile.portfolio} target="_blank" rel="noreferrer">
                      {profile.portfolio}
                    </a>
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
                  <div className={styles.miniValue} style={{ color: '#3a76f0' }}>—</div>
                  <div className={styles.miniLabel}>Средний балл</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#16a34a' }}>—</div>
                  <div className={styles.miniLabel}>Кредитов</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#8b5cf6' }}>{profile.course || '—'}</div>
                  <div className={styles.miniLabel}>Семестр</div>
                </div>
                <div className={styles.mini}>
                  <div className={styles.miniValue} style={{ color: '#f97316' }}>—</div>
                  <div className={styles.miniLabel}>Прогресс</div>
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

              <div className={styles.cardTitle} style={{ marginTop: 14 }}>Быстрые действия</div>
              <div className={styles.actionsList}>
                <button className={styles.actionBtn}>
                  <img src={CalendarIcon} className={styles.actionIcon} />
                  Расписание занятий
                </button>
                <button className={styles.actionBtn}>
                  <img src={CalendarIcon} className={styles.actionIcon} />
                  Календарь сессий
                </button>
                <button className={styles.actionBtn}>
                  <img src={MailIcon} className={styles.actionIcon} />
                  Справка студента
                </button>
              </div>
            </div>

            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.cardTitle}>Навыки и языки</div>
              <div className={styles.kv} style={{ gridTemplateColumns: '1fr' }}>
                <div>
                  <div className={styles.kvLabel}>Технические навыки</div>
                  <div className={styles.chips}>
                    {(isEditing ? draft.skills : profile.skills).map((s) => (
                      <span key={s} className={styles.chip}>
                        {s}
                        {isEditing && (
                          <span
                            onClick={() => removeSkill(s)}
                            role="button"
                            tabIndex={0}
                            style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <span className={`${styles.chip} ${styles.addChip}`} onClick={addSkill} role="button" tabIndex={0}>
                        + Добавить
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.kvLabel}>Языки</div>
                  <div className={styles.chips}>
                    {(isEditing ? draft.languages : profile.languages).map((l) => (
                      <span key={l} className={styles.chip}>
                        {l}
                        {isEditing && (
                          <span
                            onClick={() => setDraft((p) => ({ ...p, languages: p.languages.filter(x => x !== l) }))}
                            role="button"
                            tabIndex={0}
                            style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <span className={`${styles.chip} ${styles.addChip}`} onClick={addLanguage} role="button" tabIndex={0}>
                        + Добавить
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.kvLabel}>Интересы</div>
                  <div className={styles.chips}>
                    {(isEditing ? draft.interests : profile.interests).map((i) => (
                      <span key={i} className={styles.chip}>
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeadProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profileData } = useGetProfileQuery(userId, { skip: !userId });
  const [updateProfileApi] = useUpdateProfileMutation();

  const apiName = profileData?.data
    ? [profileData.data.firstName, profileData.data.lastName].filter(Boolean).join(' ')
    : '';

  const initial = useMemo<HeadProfile>(
    () => ({
      fullName: apiName || userName?.trim() || 'Смирнов Владимир Игоревич',
      role: 'Заведующий кафедрой',
      degree: 'Доктор технических наук',
      title: 'Профессор',
      headSince: '2015',
      headId: 'H-2015-234',
      email: profileData?.data?.email || 'v.smirnov@university.edu',
      phone: profileData?.data?.phoneNumber || '+7 (999) 111-22-33',
      faculty: 'Факультет информационных технологий',
      department: 'Кафедра программной инженерии',
      dissertationTitle: 'Методы оптимизации распределенных систем обработки данных',
      dissertationYear: '2008',
      education: [
        {
          id: 'hed-1',
          degree: 'Доктор технических наук',
          university: 'Московский государственный университет',
          program: 'Информатика и вычислительная техника',
          year: '2008',
        },
        {
          id: 'hed-2',
          degree: 'Кандидат технических наук',
          university: 'Московский государственный университет',
          program: 'Математическое моделирование',
          year: '1998',
        },
      ],
      interests: ['Распределенные системы', 'Облачные вычисления', 'Искусственный интеллект', 'Big Data', 'Программная инженерия'],
      awards: [
        { id: 'ha-1', title: 'Заслуженный работник высшей школы РФ', year: '2019' },
        { id: 'ha-2', title: 'Почетный работник образования', year: '2016' },
        { id: 'ha-3', title: 'Лауреат премии Правительства РФ в области образования', year: '2014' },
      ],
      experience: { total: '28 лет', teaching: '28 лет', head: 'с 2015', from: '01.09.2015' },
      publications: { total: 156, monographs: 4, articles: 98, conferences: 54 },
      leadership: { phd: 12, masters: 45, bachelors: 156 },
      admin: { teachers: 24, students: 342, yearsLeading: 10 },
    }),
    [userName, apiName, profileData]
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
        },
      }).unwrap();
      setProfile(draft);
      setIsEditing(false);
      setError(null);
    } catch {
      setError('Ошибка при сохранении профиля');
    }
  };

  const openDemo = (label: string) => window.alert(`${label} (демо)`);

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
              <img src={BellIcon} className={styles.notifIcon} />
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
                <div className={styles.headHighlightRow}>
                  <img src={AwardIcon} className={styles.headHighlightIcon} />
                  {profile.awards[0].title}
                </div>
                <div className={styles.headHighlightRow}>
                  <img src={AwardIcon} className={styles.headHighlightIcon} />
                  {profile.awards[1].title}
                </div>
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

              <div className={styles.card}>
                <div className={styles.cardTitle}>Быстрые действия</div>
                <div className={styles.actionsList}>
                  <button type="button" className={styles.actionBtn} onClick={() => openDemo('Список публикаций')}>
                    <img src={AwardIcon} className={styles.actionIcon} />
                    Список публикаций
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherProfileView = ({ userName, userId }: { userName: string; userId: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: profileData } = useGetProfileQuery(userId, { skip: !userId });
  const [updateProfileApi] = useUpdateProfileMutation();

  const apiName = profileData?.data
    ? [profileData.data.firstName, profileData.data.lastName].filter(Boolean).join(' ')
    : '';

  const initial = useMemo<TeacherProfile>(
    () => ({
      fullName: apiName || userName || 'Петров Александр Владимирович',
      position: 'Доцент',
      degree: 'Кандидат технических наук',
      role: 'Преподаватель',
      teacherId: 'T-2018-567',
      experience: '15 лет',
      about:
        'Преподаватель с 15-летним стажем. Специализируюсь на разработке программного обеспечения и веб-технологиях. Активно занимаюсь научной работой в области искусственного интеллекта и машинного обучения.',
      email: profileData?.data?.email || 'a.petrov@university.edu',
      phone: profileData?.data?.phoneNumber || '+7 (999) 888-77-66',
      office: 'Главный корпус, кабинет 401',
      officeHours: 'Вторник, Четверг 14:00-16:00',
      faculty: 'Факультет информационных технологий',
      department: 'Кафедра программной инженерии',
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
      interests: ['Искусственный интеллект', 'Машинное обучение', 'Веб-технологии', 'Облачные вычисления'],
      stats: { publications: 24, conferences: 15, patents: 3 },
      awards: [
        { id: 'a1', title: 'Лучший преподаватель года', year: '2023' },
        { id: 'a2', title: 'Грант РФФИ', year: '2022' },
        { id: 'a3', title: 'Благодарность ректора', year: '2021' },
      ],
      website: 'https://petrov.edu',
      linkedin: 'https://linkedin.com/in/petrov',
    }),
    [userName, apiName, profileData]
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

  const openDemo = (label: string) => window.alert(`${label} (демо)`);

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
              <img src={BellIcon} className={styles.notifIcon} />
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

              <div className={styles.card}>
                <div className={styles.cardTitle}>Быстрые действия</div>
                <div className={styles.actionsList}>
                  <button type="button" className={styles.actionBtn} onClick={() => openDemo('Мое расписание')}>
                    <img src={CalendarIcon} className={styles.actionIcon} />
                    Мое расписание
                  </button>
                  <button type="button" className={styles.actionBtn} onClick={() => openDemo('Список студентов')}>
                    <img src={PeopleIcon} className={styles.actionIcon} />
                    Список студентов
                  </button>
                  <button type="button" className={styles.actionBtn} onClick={() => openDemo('Научные публикации')}>
                    <img src={AwardIcon} className={styles.actionIcon} />
                    Научные публикации
                  </button>
                </div>
              </div>
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
