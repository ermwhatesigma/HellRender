import React from 'react';
import { FloatingNotification } from '../types/game';

interface NotificationToastProps {
  notifications: FloatingNotification[];
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notifications }) => {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2">
      {notifications.map(n => (
        <div
          key={n.id}
          className="px-4 py-2 bg-neutral-950/90 border-2 border-yellow-500/80 rounded-lg shadow-lg text-yellow-400 font-mono font-bold text-sm sm:text-base flex items-center gap-2 animate-bounce uppercase tracking-wider backdrop-blur-sm"
        >
          {n.icon && <span className="text-lg">{n.icon}</span>}
          <span>{n.text}</span>
        </div>
      ))}
    </div>
  );
};
