import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useAppSelector } from '../app/hooks';

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
        { key: 'requests', label: 'Заявки студентов', icon: FileIcon, path: '/applications', badgeCount: 5 },
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
      { key: 'reports', label: 'Отчеты', icon: ReportsIcon, path: '/reports' },
      { key: 'profile', label: 'Личный кабинет', icon: AccountIcon, path: '/profile' },
    ],
  };
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useAppSelector((s) => s.auth.userName) || 'Иван Иванов';
  const userRole = useAppSelector((s) => s.auth.userRole) || 'Студент';

  const { portalSubtitle, items } = useMemo(() => navForRole(userRole), [userRole]);
  const initials = useMemo(() => initialsFromName(userName), [userName]);

  const openPlaceholder = () => {
    window.alert('Раздел в разработке');
  };

  return (
    <div className={sidebarStyles.sidebar}>
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
      </div>

      <div className={sidebarStyles.navigation}>
        {items.map((it) => {
          const isActive = Boolean(it.path) && location.pathname === it.path;
          return (
            <div
              key={it.key}
              className={isActive ? sidebarStyles.button : sidebarStyles.button2}
              onClick={() => (it.path ? navigate(it.path) : openPlaceholder())}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (it.path) navigate(it.path);
                  else openPlaceholder();
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

      <div className={sidebarStyles.container4} style={{ marginTop: 'auto' }}>
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
    </div>
  );
};

export default Sidebar;
