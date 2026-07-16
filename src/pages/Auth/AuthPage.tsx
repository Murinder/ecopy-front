import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.scss';
import LogoIcon from '../../assets/icons/mjbmnzii-nqwtabo.svg';
import CoursesIcon from '../../assets/icons/mjbmnzii-qcfmg4x.svg';
import CertificatesIcon from '../../assets/icons/mjbmnzii-hptfss7.svg';
import CommunityIcon from '../../assets/icons/mjbmnzii-ba5ispw.svg';
import ScheduleIcon from '../../assets/icons/mjbmnzii-lc4urbp.svg';
import { useLoginMutation, useRegisterMutation, useLazyGetProfileQuery, useForgotPasswordMutation } from '../../services/coreApi';
import { useAppDispatch } from '../../app/hooks';
import { setToken, setUserId, setUserName, setUserRole, setRememberMe } from '../../features/auth/authSlice';

const backendRoleToUiRole: Record<string, string> = {
  STUDENT: 'Студент',
  LECTURER: 'Преподаватель',
  DEPARTMENT_HEAD: 'Заведующий кафедрой',
  PARTNER: 'Партнер',
  ADMIN: 'Администратор',
};

const decodeJwt = (token: string): { userId: string; role: string; email: string } => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { userId: payload.sub || '', role: payload.role || '', email: payload.email || '' };
  } catch {
    return { userId: '', role: '', email: '' };
  }
};

const AuthPage = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [regRole, setRegRole] = useState<'STUDENT' | 'LECTURER'>('STUDENT');
  const [groupName, setGroupName] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [fetchProfile] = useLazyGetProfileQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onForgotSubmit = async () => {
    if (!forgotEmail.trim()) return;
    setForgotStatus('sending');
    try {
      await forgotPassword({ email: forgotEmail.trim() }).unwrap();
      setForgotStatus('sent');
    } catch {
      setForgotStatus('error');
    }
  };

  type DemoUserKey = 'student' | 'teacher' | 'head';

  const demoUsers: Record<
    DemoUserKey,
    { label: string; email: string; password: string }
  > = {
    student: { label: 'Студент', email: 'student@university.edu', password: 'student123' },
    teacher: { label: 'Преподаватель', email: 'teacher@university.edu', password: 'teacher123' },
    head: { label: 'Заведующий кафедрой', email: 'head@university.edu', password: 'head12345' },
  };

  const applyLoginToken = (tokenData: { accessToken: string; refreshToken: string; expiresIn: number; tokenType: string }) => {
    dispatch(setToken(tokenData));
    const jwt = decodeJwt(tokenData.accessToken);
    dispatch(setUserId(jwt.userId));
    dispatch(setUserRole(backendRoleToUiRole[jwt.role] || jwt.role || 'Студент'));
  };

  const fillDemoUser = (key: DemoUserKey) => {
    const u = demoUsers[key];
    setTab('login');
    setEmail(u.email);
    setPassword(u.password);
    setErrorText(undefined);
  };

  const onSubmit = async () => {
    setErrorText(undefined);
    try {
      if (tab === 'login') {
        const res = await login({ email, password }).unwrap();
        applyLoginToken(res.data);
        const jwt = decodeJwt(res.data.accessToken);
        try {
          const profile = await fetchProfile(jwt.userId).unwrap();
          const fullName = [profile.data.firstName, profile.data.lastName].filter(Boolean).join(' ');
          dispatch(setUserName(fullName || jwt.email.split('@')[0]));
        } catch {
          dispatch(setUserName(jwt.email.split('@')[0]));
        }
        dispatch(setRememberMe(remember));
        navigate('/projects');
      } else {
        const regRes = await register({ email, password, firstName, lastName, phoneNumber: phoneNumber || undefined, role: regRole, groupName: regRole === 'STUDENT' && groupName ? groupName : undefined }).unwrap();
        dispatch(setUserId(regRes.data.id));
        dispatch(setUserName(`${firstName} ${lastName}`.trim() || email));
        dispatch(setUserRole(backendRoleToUiRole[regRes.data.role || ''] || 'Студент'));
        // Auto-login after registration to get a token
        try {
          const loginRes = await login({ email, password }).unwrap();
          applyLoginToken(loginRes.data);
          navigate('/projects');
        } catch {
          setErrorText('Регистрация прошла успешно. Войдите с вашими данными.');
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { message?: string } };
      const msg = apiErr?.data?.message;
      if (msg) {
        setErrorText(msg);
      } else if (tab === 'login') {
        setErrorText(apiErr?.status === 401 || apiErr?.status === 403
          ? 'Неверный email или пароль'
          : 'Ошибка при подключении к серверу. Проверьте доступность API.');
      } else {
        setErrorText('Ошибка при регистрации. Попробуйте позже.');
      }
    }
  };

  return (
    <div className={styles.container18}>
      <div className={styles.card}>
        <div className={styles.app}>
          <div className={styles.container}>
            <img src={LogoIcon} className={styles.icon} />
          </div>
          <div className={styles.container2}>
            <p className={styles.a}>ЕЦОПУ</p>
            <div className={styles.paragraph}>
              <p className={styles.a2}>Единая цифровая образовательная платформа университета</p>
            </div>
          </div>
        </div>
        <div className={styles.primitiveDiv}>
          <div className={styles.tabList}>
            <button
              className={tab === 'login' ? styles.tabActive : styles.tabInactive}
              onClick={() => setTab('login')}
            >
              Вход
            </button>
            <button
              className={tab === 'register' ? styles.tabActive : styles.tabInactive}
              onClick={() => setTab('register')}
            >
              Регистрация
            </button>
          </div>
          <div className={styles.tabPanel}>
            {tab === 'login' ? (
              <>
                <div className={styles.app2}>
                  <p className={styles.email}>Email</p>
                  <div className={styles.input}>
                    <input
                      className={styles.studentUniversityEdu}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Пароль</p>
                  <div className={styles.input}>
                    <input
                      type="password"
                      className={styles.studentUniversityEdu}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className={styles.app4}>
                  <div className={styles.label}>
                    <label className={styles.a5}>
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />{' '}
                      Запомнить меня
                    </label>
                  </div>
                  <div className={styles.link}>
                    <a className={styles.a6} style={{ cursor: 'pointer' }} onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotStatus('idle'); }}>Забыли пароль?</a>
                  </div>
                </div>
                <div className={styles.testUsers}>
                  <p className={styles.testUsersTitle}>Тестовые пользователи</p>
                  <div className={styles.testUsersGrid}>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => fillDemoUser('student')}
                    >
                      {demoUsers.student.label}
                    </button>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => fillDemoUser('teacher')}
                    >
                      {demoUsers.teacher.label}
                    </button>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => fillDemoUser('head')}
                    >
                      {demoUsers.head.label}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.app2}>
                  <p className={styles.email}>Email</p>
                  <div className={styles.input}>
                    <input
                      className={styles.studentUniversityEdu}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Пароль</p>
                  <div className={styles.input}>
                    <input
                      type="password"
                      className={styles.studentUniversityEdu}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="минимум 8 символов"
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Имя</p>
                  <div className={styles.input}>
                    <input
                      className={styles.studentUniversityEdu}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Фамилия</p>
                  <div className={styles.input}>
                    <input
                      className={styles.studentUniversityEdu}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Телефон</p>
                  <div className={styles.input}>
                    <input
                      className={styles.studentUniversityEdu}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                </div>
                <div className={styles.app3}>
                  <p className={styles.email}>Роль</p>
                  <div className={styles.input}>
                    <select
                      className={styles.studentUniversityEdu}
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as 'STUDENT' | 'LECTURER')}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="STUDENT">Студент</option>
                      <option value="LECTURER">Преподаватель</option>
                    </select>
                  </div>
                </div>
                {regRole === 'STUDENT' && (
                  <div className={styles.app3}>
                    <p className={styles.email}>Группа</p>
                    <div className={styles.input}>
                      <input
                        className={styles.studentUniversityEdu}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="ПИ-21-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            <button type="button" className={styles.button} onClick={onSubmit}>
              <p className={styles.a7}>
                {tab === 'login' ? (loginLoading ? 'Входим...' : 'Войти') : registerLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
              </p>
            </button>
            <div className={styles.app5}>
              <div className={styles.container3} />
              <div className={styles.text}>
                <p className={styles.a8}>или</p>
              </div>
            </div>
            <button type="button" className={styles.button2} disabled>
              <p className={styles.aSso}>Войти через SSO</p>
            </button>
            {errorText && (
              <div className={styles.errorMessage}>{errorText}</div>
            )}

            {forgotOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setForgotOpen(false)}>
                <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', width: 380, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#0e1d45' }}>Восстановление пароля</h3>
                  <p style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b' }}>Введите email, и мы отправим ссылку для сброса пароля</p>
                  {forgotStatus === 'sent' ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#16a34a', marginBottom: 16 }}>Письмо отправлено на {forgotEmail}</p>
                      <button type="button" className={styles.button} onClick={() => setForgotOpen(false)} style={{ width: '100%' }}>
                        <p className={styles.a7}>Закрыть</p>
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        className={styles.studentUniversityEdu}
                        style={{ width: '100%', marginBottom: 16, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Email"
                      />
                      {forgotStatus === 'error' && (
                        <p style={{ color: '#d00', fontSize: 13, margin: '0 0 12px' }}>Не удалось отправить. Проверьте email.</p>
                      )}
                      <button type="button" className={styles.button} onClick={onForgotSubmit} style={{ width: '100%' }}>
                        <p className={styles.a7}>{forgotStatus === 'sending' ? 'Отправка...' : 'Отправить ссылку'}</p>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.container17}>
        <div className={styles.container4}>
          <div className={styles.heading1}>
            <p className={styles.a9}>Добро пожаловать в будущее образования</p>
          </div>
          <div className={styles.paragraph2}>
            <p className={styles.a10}>
              Единая платформа для обучения, взаимодействия и развития студентов и преподавателей
            </p>
          </div>
        </div>
        <div className={styles.container14}>
          <div className={styles.autoWrapper}>
            <div className={styles.container7}>
              <div className={styles.container5}>
                <img src={CoursesIcon} className={styles.icon2} />
              </div>
              <div className={styles.container6}>
                <p className={styles.a11}>Онлайн-курсы</p>
                <div className={styles.paragraph3}>
                  <p className={styles.a12}>Доступ к тысячам курсов и материалов в любое время</p>
                </div>
              </div>
            </div>
            <div className={styles.container9}>
              <div className={styles.container5}>
                <img src={CertificatesIcon} className={styles.icon2} />
              </div>
              <div className={styles.container8}>
                <p className={styles.a11}>Сертификаты</p>
                <div className={styles.paragraph4}>
                  <p className={styles.a13}>Получайте признанные сертификаты после прохождения курсов</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.autoWrapper2}>
            <div className={styles.container11}>
              <div className={styles.container5}>
                <img src={CommunityIcon} className={styles.icon2} />
              </div>
              <div className={styles.container10}>
                <p className={styles.a11}>Сообщество</p>
                <div className={styles.paragraph5}>
                  <p className={styles.a14}>Общение с преподавателями и студентами</p>
                </div>
              </div>
            </div>
            <div className={styles.container13}>
              <div className={styles.container5}>
                <img src={ScheduleIcon} className={styles.icon2} />
              </div>
              <div className={styles.container12}>
                <p className={styles.a11}>Гибкий график</p>
                <div className={styles.paragraph6}>
                  <p className={styles.a15}>Учитесь в удобное для вас время и темпе</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container16}>
          <div className={styles.container15}>
            <p className={styles.a1000}>1,000+</p>
            <p className={styles.a16}>Активных студентов</p>
          </div>
          <div className={styles.container15}>
            <p className={styles.a1000}>50+</p>
            <p className={styles.a16}>Онлайн-курсов</p>
          </div>
          <div className={styles.container15}>
            <p className={styles.a1000}>98%</p>
            <p className={styles.a16}>Удовлетворенность</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
