import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import sidebarStyles from '../pages/Projects/ProjectsPage.module.scss';
import ProjectsIcon from '../assets/icons/mjbmqg4r-q680ssd.svg';
import ActivityIcon from '../assets/icons/mjbmqg4r-bnrz516.svg';
import EventsIcon from '../assets/icons/mjbmqg4r-l0lyc18.svg';
import RatingIcon from '../assets/icons/mjbmqg4r-zb9tzm2.svg';
import ReportsIcon from '../assets/icons/mjbmqg4r-8zf461h.svg';
import AccountIcon from '../assets/icons/mjbmqg4r-0wpfxf5.svg';
import CalendarIcon from '../assets/icons/mjbmqg4r-fgt12s1.svg';
import ScheduleIcon from '../assets/icons/mjbmnzii-lc4urbp.svg';
import FileIcon from '../assets/icons/ui-file.svg';
import PeopleIcon from '../assets/icons/mjbmqg4r-g71l6vp.svg';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

type NavItem = {
  key: string;
  label: string;
  icon: string;
  path?: string;
  badgeCount?: number;
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

const navForRole = (role: string): { portalSubtitle: string; items: NavItem[] } => {
  if (role === 'Заведующий кафедрой') {
    return {
      portalSubtitle: 'Управление кафедрой',
      items: [
        { key: 'teachers', label: 'Преподаватели', icon: PeopleIcon, path: '/teachers' },
        { key: 'top-projects', label: 'Топ проекты', icon: ProjectsIcon, path: '/projects' },
        { key: 'analytics', label: 'Аналитика', icon: ActivityIcon, path: '/activity' },
        { key: 'defense', label: 'Расписание защит', icon: ScheduleIcon, path: '/schedule' },
        { key: 'reports', label: 'Отчеты', icon: ReportsIcon, path: '/reports' },
        { key: 'profile', label: 'Личный кабинет', icon: AccountIcon, path: '/profile' },
      ],
    };
  }

  if (role === 'Преподаватель') {
    return {
      portalSubtitle: 'Преподавательский портал',
      items: [
        { key: 'projects', label: 'Курируемые проекты', icon: ProjectsIcon, path: '/projects' },
        { key: 'requests', label: 'Заявки студентов', icon: FileIcon, path: '/applications' },
        { key: 'events', label: 'Календарь мероприятий', icon: CalendarIcon, path: '/events' },
        { key: 'schedule', label: 'Расписание', icon: ScheduleIcon, path: '/schedule' },
        { key: 'reports', label: 'Отчеты', icon: ReportsIcon, path: '/reports' },
        { key: 'activity', label: 'Активность', icon: ActivityIcon, path: '/activity' },
        { key: 'profile', label: 'Личный кабинет', icon: AccountIcon, path: '/profile' },
      ],
    };
  }

  return {
    portalSubtitle: 'Студенческий портал',
    items: [
      { key: 'projects', label: 'Мои проекты', icon: ProjectsIcon, path: '/projects' },
      { key: 'activity', label: 'Активность', icon: ActivityIcon, path: '/activity' },
      { key: 'events', label: 'Мероприятия', icon: EventsIcon, path: '/events' },
      { key: 'rating', label: 'Мой рейтинг', icon: RatingIcon, path: '/rating' },
      { key: 'profile', label: 'Личный кабинет', icon: AccountIcon, path: '/profile' },
    ],
  };
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const userName = useAppSelector((s) => s.auth.userName) || 'Иван Иванов';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';

  const { portalSubtitle, items } = useMemo(() => navForRole(userRole), [userRole]);
  const initials = useMemo(() => initialsFromName(userName), [userName]);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isMobile && drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, drawerOpen]);

  // Close drawer on route change
  useEffect(() => {
    if (isMobile) setDrawerOpen(false);
  }, [location.pathname, isMobile]);

  const handleNav = (path?: string) => {
    if (path) {
      navigate(path);
    } else {
      window.alert('Раздел в разработке');
    }
  };

  const sidebarClassName = isMobile
    ? `${sidebarStyles.sidebar} ${drawerOpen ? sidebarStyles.sidebarOpen : sidebarStyles.sidebarClosed}`
    : sidebarStyles.sidebar;

  return (
    <>
      {isMobile && (
        <button
          className={sidebarStyles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label="Открыть меню"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {isMobile && drawerOpen && (
        <div className={sidebarStyles.backdrop} onClick={() => setDrawerOpen(false)} />
      )}

      <div className={sidebarClassName}>
        <div className={sidebarStyles.container2}>
          <div className={sidebarStyles.icon}>
            <div className={sidebarStyles.autoWrapper}>
              <div className={sidebarStyles.vector} />
              <div className={sidebarStyles.vector2} />
            </div>
            <div className={sidebarStyles.autoWrapper2}>
              <div className={sidebarStyles.vector3} />
              <div className={sidebarStyles.vector4} />
            </div>
          </div>
          <div className={sidebarStyles.container}>
            <p className={sidebarStyles.a2}>ЕЦОПУ</p>
            <div className={sidebarStyles.paragraph}>
              <p className={sidebarStyles.a3}>{portalSubtitle}</p>
            </div>
          </div>
          {isMobile && (
            <button
              className={sidebarStyles.drawerClose}
              onClick={() => setDrawerOpen(false)}
              aria-label="Закрыть меню"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className={sidebarStyles.navigation}>
          {items.map((it) => {
            const isActive = Boolean(it.path) && location.pathname === it.path;
            return (
              <div
                key={it.key}
                className={isActive ? sidebarStyles.button : sidebarStyles.button2}
                onClick={() => handleNav(it.path)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNav(it.path);
                  }
                }}
              >
                <img src={it.icon} className={sidebarStyles.icon2} />
                <div className={sidebarStyles.text2} style={{ flex: 1 }}>
                  <p className={isActive ? sidebarStyles.a4 : sidebarStyles.a5}>{it.label}</p>
                </div>
                {typeof it.badgeCount === 'number' && (
                  <span
                    style={{
                      marginRight: 12,
                      minWidth: 22,
                      height: 22,
                      padding: '0 6px',
                      borderRadius: 9999,
                      background: '#fb2c36',
                      color: '#fff',
                      fontSize: 12,
                      lineHeight: '22px',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {it.badgeCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <div className={sidebarStyles.container4}>
            <div className={sidebarStyles.primitiveSpan}>
              <div className={sidebarStyles.text8}>
                <p className={sidebarStyles.a6}>{initials}</p>
              </div>
            </div>
            <div className={sidebarStyles.container3}>
              <p className={sidebarStyles.a7}>{userName}</p>
              <p className={sidebarStyles.a8}>{userRole}</p>
            </div>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/auth');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 8,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выход
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
