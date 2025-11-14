
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NOTIFICATIONS } from '../constants';
import type { Notification } from '../types';
import { Bell, CheckCheck, Mail, MailOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  useEffect(() => {
    if (user) {
      const userNotifications = NOTIFICATIONS.filter(n => n.role === 'All' || n.role === user.role);
      // Sort by date descending
      userNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(userNotifications);
    }
  }, [user]);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Notifications</h1>
        <button 
          onClick={handleMarkAllAsRead} 
          disabled={!notifications.some(n => !n.read)}
          className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600">
          <CheckCheck size={20} />
          Mark all as read
        </button>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-2">
         <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm font-medium rounded-full ${filter === 'all' ? 'bg-primary text-white' : 'text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            All
         </button>
         <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 text-sm font-medium rounded-full ${filter === 'unread' ? 'bg-primary text-white' : 'text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            Unread
         </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                    <div key={notification.id} className={`flex items-start gap-4 p-4 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className={`mt-1 p-2 rounded-full ${notification.read ? 'bg-slate-100 dark:bg-slate-700' : 'bg-primary/20 text-primary'}`}>
                           {notification.read ? <MailOpen size={20} className="text-slate-500"/> : <Mail size={20} />}
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold text-text-primary dark:text-slate-200">{notification.title}</h3>
                            <p className="text-sm text-text-secondary dark:text-slate-400">{notification.message}</p>
                            <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">{notification.date}</p>
                        </div>
                        {!notification.read && (
                            <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs font-semibold text-primary hover:underline whitespace-nowrap mt-1">
                                Mark as read
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <Bell size={40} className="mx-auto text-slate-400" />
                    <p className="mt-2 text-text-secondary dark:text-slate-400">
                        {filter === 'unread' ? 'No unread notifications.' : 'You have no notifications.'}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
