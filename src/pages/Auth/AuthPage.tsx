import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.scss';
import LogoIcon from '../../assets/icons/mjbmnzii-nqwtabo.svg';
import CoursesIcon from '../../assets/icons/mjbmnzii-qcfmg4x.svg';
import CertificatesIcon from '../../assets/icons/mjbmnzii-hptfss7.svg';
import CommunityIcon from '../../assets/icons/mjbmnzii-ba5ispw.svg';
import ScheduleIcon from '../../assets/icons/mjbmnzii-lc4urbp.svg';
import { useLoginMutation, useRegisterMutation } from '../../services/coreApi';
import { useAppDispatch } from '../../app/hooks';
import { setToken, setUserId, setUserName, setUserRole, setRememberMe } from '../../features/auth/authSlice';

const AuthPage = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  type DemoUserKey = 'student' | 'teacher' | 'head';

  const demoUsers: Record<
    DemoUserKey,
    { label: string; email: string; password: string; userId: string; name: string; role: string }
  > = {
    student: {
      label: 'Студент',
      email: 'student@university.edu',
      password: 'student123',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Иван Иванов',
      role: 'Студент',
    },
    teacher: {
      label: 'Преподаватель',
      email: 'teacher@university.edu',
      password: 'teacher123',
      userId: '00000000-0000-0000-0000-000000000002',
      name: 'Петр Петров',
      role: 'Преподаватель',
    },
    head: {
      label: 'Заведующий кафедрой',
      email: 'head@university.edu',
      password: 'head12345',
      userId: '00000000-0000-0000-0000-000000000003',
      name: 'Сергей Сергеев',
      role: 'Заведующий кафедрой',
    },
  };

  const resolveDemoUser = (emailValue: string) => {
    const normalized = emailValue.trim().toLowerCase();
    return Object.values(demoUsers).find((u) => u.email.toLowerCase() === normalized);
  };

  const loginAsDemoUser = (key: DemoUserKey) => {
    const u = demoUsers[key];
    setTab('login');
    setEmail(u.email);
    setPassword(u.password);
    setErrorText(undefined);
    dispatch(setToken(undefined));
    dispatch(setUserId(u.userId));
    dispatch(setUserName(u.name));
    dispatch(setUserRole(u.role));
    dispatch(setRememberMe(remember));
    navigate('/projects');
  };

  const onSubmit = async () => {
    setErrorText(undefined);
    try {
      if (tab === 'login') {
        const res = await login({ email, password }).unwrap();
        const demo = resolveDemoUser(email);
        dispatch(setToken(res.data));
        dispatch(setUserId(demo?.userId ?? '00000000-0000-0000-0000-000000000001'));
        if (demo) {
          dispatch(setUserName(demo.name));
          dispatch(setUserRole(demo.role));
        }
        dispatch(setRememberMe(remember));
        navigate('/projects');
      } else {
        const res = await register({ email, password, firstName, lastName }).unwrap();
        dispatch(setUserId(res.data.id));
        dispatch(setUserName(`${firstName} ${lastName}`.trim() || undefined));
        dispatch(setUserRole('Студент'));
        navigate('/projects');
      }
    } catch {
      setErrorText('API недоступно. Данные сохранены локально для демо.');
      const demo = resolveDemoUser(email);
      dispatch(setUserId(demo?.userId ?? '00000000-0000-0000-0000-000000000001'));
      if (demo) {
        dispatch(setUserName(demo.name));
        dispatch(setUserRole(demo.role));
      }
      navigate('/projects');
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
              className={styles.primitiveButton}
              onClick={() => setTab('login')}
            >
              <p className={styles.a3}>Вход</p>
            </button>
            <button className={styles.a4} onClick={() => setTab('register')}>
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
                    <a className={styles.a6}>Забыли пароль?</a>
                  </div>
                </div>
                <div className={styles.testUsers}>
                  <p className={styles.testUsersTitle}>Тестовые пользователи</p>
                  <div className={styles.testUsersGrid}>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => loginAsDemoUser('student')}
                    >
                      {demoUsers.student.label}
                    </button>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => loginAsDemoUser('teacher')}
                    >
                      {demoUsers.teacher.label}
                    </button>
                    <button
                      type="button"
                      className={styles.testUserBtn}
                      onClick={() => loginAsDemoUser('head')}
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
              </>
            )}
            <div className={styles.button} onClick={onSubmit}>
              <p className={styles.a7}>
                {tab === 'login' ? (loginLoading ? 'Входим...' : 'Войти') : registerLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
              </p>
            </div>
            <div className={styles.app5}>
              <div className={styles.container3} />
              <div className={styles.text}>
                <p className={styles.a8}>или</p>
              </div>
            </div>
            <div className={styles.button2}>
              <p className={styles.aSso}>Войти через SSO</p>
            </div>
            {errorText && (
              <div style={{ marginTop: 16, color: '#d00' }}>{errorText}</div>
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
