import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  MessageSquare, 
  ShoppingBag, 
  Globe, 
  CreditCard, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Clock,
  ExternalLink 
} from 'lucide-react';
import { useApp, ClientTab } from '../../context/AppContext';
import { ClientNotification } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

export const ClientNotificationCenter: React.FC<Props> = ({ isOpen, onClose, customerId }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setClientTab } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'support' | 'orders'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications for this specific customer
  const clientNotifs = notifications.filter((n) => n.customerId === customerId);
  const unreadCount = clientNotifs.filter((n) => !n.read).length;

  const filteredNotifs = clientNotifs.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'support') {
      const text = `${n.title} ${n.message}`.toLowerCase();
      return text.includes('ticket') || text.includes('support') || text.includes('reply') || text.includes('message');
    }
    if (activeFilter === 'orders') {
      const text = `${n.title} ${n.message}`.toLowerCase();
      return text.includes('order') || text.includes('milestone') || text.includes('deployment') || text.includes('website');
    }
    return true;
  });

  const handleNotificationClick = (notif: ClientNotification) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes('ticket') || text.includes('support') || text.includes('reply')) {
      setClientTab('support');
      onClose();
    } else if (text.includes('order') || text.includes('milestone')) {
      setClientTab('orders');
      onClose();
    } else if (text.includes('payment') || text.includes('invoice')) {
      setClientTab('payments');
      onClose();
    } else if (text.includes('website') || text.includes('domain') || text.includes('backup')) {
      setClientTab('website');
      onClose();
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getNotifIcon = (notif: ClientNotification) => {
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes('ticket') || text.includes('reply') || text.includes('support')) {
      return <MessageSquare className="w-4 h-4 text-sky-400" />;
    }
    if (text.includes('order') || text.includes('milestone')) {
      return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
    }
    if (text.includes('payment') || text.includes('invoice')) {
      return <CreditCard className="w-4 h-4 text-purple-400" />;
    }
    if (text.includes('website') || text.includes('domain') || text.includes('backup')) {
      return <Globe className="w-4 h-4 text-indigo-400" />;
    }
    if (notif.type === 'urgent' || notif.type === 'warning') {
      return <AlertCircle className="w-4 h-4 text-amber-400" />;
    }
    return <Info className="w-4 h-4 text-slate-400" />;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Popover Card */}
      <div
        ref={popoverRef}
        className="fixed sm:absolute right-3 sm:right-6 top-16 sm:top-14 w-[calc(100vw-24px)] sm:w-96 max-h-[85vh] bg-slate-900/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Notifications</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                type="button"
                onClick={() => markAllNotificationsRead(customerId)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-950/50 flex items-center gap-1 transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto bg-slate-950/20 text-[11px]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All ({clientNotifs.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              activeFilter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('support')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'support'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Support
          </button>
          <button
            onClick={() => setActiveFilter('orders')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              activeFilter === 'orders'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Orders & Site
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[380px]">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-300">
                {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto">
                You will be notified whenever our team updates your website build or responds to support requests.
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 group relative ${
                    !notif.read ? 'bg-indigo-950/25 hover:bg-indigo-950/40' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left Icon */}
                  <div className="w-8 h-8 rounded-xl bg-slate-800/90 flex items-center justify-center shrink-0 border border-slate-700/60 mt-0.5">
                    {getNotifIcon(notif)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs leading-snug font-bold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimestamp(notif.date)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>

                      {!notif.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationRead(notif.id);
                          }}
                          className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Synced with WebRunzo Cloud & Supabase</span>
          <button
            onClick={() => {
              setClientTab('support');
              onClose();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            Help Center →
          </button>
        </div>
      </div>
    </>
  );
};
