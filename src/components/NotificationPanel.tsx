import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../app/hooks';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkNotificationReadMutation } from '../services/coreApi';
import type { NotificationDto } from '../services/coreApi';

const Panel = ({ notifications, onMarkRead, onClose }: {
  notifications: NotificationDto[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 44, right: 0, width: 360, maxWidth: 'calc(100vw - 24px)', maxHeight: 440,
      background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.15)',
      zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 15, color: '#0e1d45' }}>
        Уведомления
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Нет уведомлений
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '12px 18px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                background: n.isRead ? '#fff' : '#f0f7ff',
              }}
              onClick={() => { if (!n.isRead) onMarkRead(n.id); }}
            >
              <div style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, color: '#0e1d45', marginBottom: 4 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {new Date(n.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NotificationBell = ({ iconSrc }: { iconSrc: string }) => {
  const userId = useAppSelector((s) => s.auth.userId);
  const [open, setOpen] = useState(false);

  const { data: countData } = useGetUnreadCountQuery(userId ?? '', { skip: !userId, pollingInterval: 30000 });
  const { data: notifData } = useGetNotificationsQuery(userId ?? '', { skip: !userId || !open });
  const [markRead] = useMarkNotificationReadMutation();

  const unreadCount = countData?.data ?? 0;
  const notifications = notifData?.data ?? [];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setOpen((v) => !v)}>
        <img src={iconSrc} style={{ width: 22, height: 22 }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff',
            fontSize: 11, fontWeight: 700, borderRadius: 10, minWidth: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      {open && (
        <Panel
          notifications={notifications}
          onMarkRead={(id) => markRead(id)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
