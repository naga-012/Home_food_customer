import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Clock, Tag, ShoppingBag, Award, X } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag size={15} className="text-orange-600" />;
      case 'DISCOUNT':
        return <Tag size={15} className="text-amber-600" />;
      case 'COOK_APPROVAL':
        return <Award size={15} className="text-emerald-600" />;
      default:
        return <Bell size={15} className="text-blue-600" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-orange-600" />
          <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[11px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[12px] text-orange-700 hover:text-orange-800 font-medium flex items-center gap-1 hover:underline"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell size={28} className="mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Order updates & deals will appear here</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                n.is_read ? 'bg-white hover:bg-slate-50' : 'bg-orange-50/40 hover:bg-orange-50/70'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
                  <Clock size={11} />
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
