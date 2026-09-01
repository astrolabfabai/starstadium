import React from 'react';
import { Bell, Flame } from 'lucide-react';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';

interface NotificationBellButtonProps {
  className?: string;
  showLabel?: boolean;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  className = '',
  showLabel = false
}) => {
  const { unreadCount, isNotificationCenterOpen, setIsNotificationCenterOpen, isSoundEnabled } =
    useScoringNotifications();

  return (
    <button
      id="btn-scoring-notification-bell"
      onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
      className={`relative p-2 rounded-xl transition-all border flex items-center gap-2 group ${
        unreadCount > 0
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25 shadow-lg shadow-amber-500/10'
          : 'bg-[#18181b] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
      } ${className}`}
      title={`Scoring Drive Alerts (${unreadCount} unread)`}
      aria-label="Open Scoring Drive Alerts"
    >
      <div className="relative">
        <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-[#09090b] animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {showLabel && (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
          <span>Scoring Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {unreadCount} NEW
            </span>
          )}
        </div>
      )}
    </button>
  );
};
