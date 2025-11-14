
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Bell, ChevronDown, User, Settings, Menu, Sun, Moon, Check } from 'lucide-react';
import LazyImage from './Image';
import { NOTIFICATIONS } from '../constants';
import type { Notification } from '../types';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const userNotifications = NOTIFICATIONS.filter(n => n.role === 'All' || n.role === user.role);
      setNotifications(userNotifications);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 4);

  const getNotificationPath = () => {
    if (!user) return "/";
    switch(user.role) {
      case 'Admin':
      case 'Secretary':
      case 'Treasurer':
        return '/admin/notifications';
      case 'Security':
        return '/security/notifications';
      case 'Resident':
        return '/resident/notifications';
      default:
        return '/';
    }
  }

  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin';
    if (location.pathname.startsWith('/resident')) return '/resident';
    if (location.pathname.startsWith('/security')) return '/security';
    return '/';
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-700/80">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
            {/* Hamburger menu for mobile */}
            <button className="md:hidden text-text-secondary dark:text-slate-400" onClick={onToggleSidebar}>
                <Menu size={24} />
            </button>
            
            {/* Welcome message for desktop & tablet */}
            <div className="hidden md:block text-lg font-semibold text-text-primary dark:text-slate-200">
                Welcome back, {user?.name}!
            </div>

            <div className="flex items-center space-x-3">
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-secondary rounded-full border-2 border-white dark:border-slate-900"></span>}
                    </button>
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in z-40">
                            <div className="p-3 border-b dark:border-slate-700">
                                <h3 className="font-semibold text-text-primary dark:text-slate-200">Notifications</h3>
                                <p className="text-xs text-text-secondary dark:text-slate-400">{unreadCount} unread notifications</p>
                            </div>
                            <div className="py-1 max-h-80 overflow-y-auto">
                                {unreadNotifications.length > 0 ? (
                                    unreadNotifications.map(n => (
                                        <div key={n.id} className="flex items-start px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-sm text-text-primary dark:text-slate-200">{n.title}</p>
                                                <p className="text-sm text-text-secondary dark:text-slate-400">{n.message}</p>
                                                <p className="text-xs text-text-secondary dark:text-slate-500 mt-1">{n.date}</p>
                                            </div>
                                            <button onClick={() => handleMarkAsRead(n.id)} className="ml-2 mt-1 p-1 rounded-full text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400" title="Mark as read">
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-text-secondary dark:text-slate-400 py-4">No unread notifications</p>
                                )}
                            </div>
                             <Link to={getNotificationPath()} onClick={() => setIsNotificationOpen(false)} className="block text-center bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 text-sm font-medium text-primary border-t dark:border-slate-700 rounded-b-lg">
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>

                <button 
                  onClick={toggleTheme} 
                  className="text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

                <div className="relative" ref={profileRef}>
                   <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <LazyImage src={user?.avatar || ''} alt="User Avatar" className="w-8 h-8 rounded-full" />
                        <div className="hidden md:flex flex-col items-start">
                            <p className="text-sm font-medium text-text-primary dark:text-slate-200">{user?.name}</p>
                        </div>
                        <ChevronDown size={16} className={`text-text-secondary dark:text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProfileOpen && (
                         <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in">
                            <div className="px-4 py-2 border-b dark:border-slate-700">
                                <p className="font-bold text-sm text-text-primary dark:text-slate-200">{user?.name}</p>
                                <p className="text-xs text-text-secondary dark:text-slate-400">{user?.role}</p>
                            </div>
                            <Link to={`${getBasePath()}/profile`} onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"><User size={14} className="mr-2"/> Profile</Link>
                            <Link to={`${getBasePath()}/settings`} onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"><Settings size={14} className="mr-2"/> Settings</Link>
                            <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title="Logout">
                                <LogOut size={14} className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;