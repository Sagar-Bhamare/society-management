
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, CreditCard, ShieldAlert, Home, Building, FileText, Settings, ShieldCheck, Clock, Siren, Car, Bell, WalletCards, FileSignature, UserCheck, Network } from 'lucide-react';
import LazyImage from './Image';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const adminNavLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Secretary', 'Treasurer'] },
  { to: '/admin/residents', icon: Users, label: 'Residents', roles: ['Admin', 'Secretary'] },
  { to: '/admin/tenants', icon: UserCheck, label: 'Tenants', roles: ['Admin', 'Secretary'] },
  { to: '/admin/finances', icon: CreditCard, label: 'Finances', roles: ['Admin', 'Treasurer'] },
  { to: '/admin/expenses', icon: WalletCards, label: 'Expenses', roles: ['Admin', 'Treasurer'] },
  { to: '/admin/quotations', icon: FileSignature, label: 'Quotations', roles: ['Admin', 'Secretary', 'Treasurer'] },
  { to: '/admin/complaints', icon: ShieldAlert, label: 'Complaints', roles: ['Admin', 'Secretary'] },
  { to: '/admin/notices', icon: FileText, label: 'Notices', roles: ['Admin', 'Secretary'] },
  { to: '/admin/committee', icon: Network, label: 'Committee', roles: ['Admin', 'Secretary', 'Treasurer'] },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', roles: ['Admin', 'Secretary', 'Treasurer'] },
  { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['Admin', 'Secretary', 'Treasurer'] },
];

const residentNavLinks = [
  { to: '/resident/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resident/finances', icon: CreditCard, label: 'Pay Bills' },
  { to: '/resident/complaints', icon: ShieldAlert, label: 'My Complaints' },
  { to: '/resident/amenities', icon: Building, label: 'Book Amenity' },
  { to: '/resident/tenant-management', icon: UserCheck, label: 'My Tenant' },
  { to: '/resident/notices', icon: FileText, label: 'Notices' },
  { to: '/resident/committee', icon: Network, label: 'Committee' },
  { to: '/resident/notifications', icon: Bell, label: 'Notifications' },
  { to: '/resident/settings', icon: Settings, label: 'Settings' },
];

const securityNavLinks = [
    { to: '/security/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/security/visitor-log', icon: ShieldCheck, label: 'Visitor Log' },
    { to: '/security/patrols', icon: Clock, label: 'Patrols' },
    { to: '/security/incidents', icon: Siren, label: 'Incidents' },
    { to: '/security/vehicles', icon: Car, label: 'Vehicles' },
    { to: '/security/committee', icon: Network, label: 'Committee' },
    { to: '/security/notifications', icon: Bell, label: 'Notifications' },
    { to: '/security/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  let navLinks = [];
  if (user?.role === 'Admin' || user?.role === 'Secretary' || user?.role === 'Treasurer') {
    navLinks = adminNavLinks.filter(link => link.roles.includes(user.role));
  } else if (user?.role === 'Resident') {
    navLinks = residentNavLinks;
  } else if (user?.role === 'Security') {
    navLinks = securityNavLinks;
  }
  
  const handleLinkClick = () => {
    // md breakpoint is 768px
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const NavItem: React.FC<{ to: string, icon: React.ElementType, label: string }> = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to);
    return (
        <NavLink to={to} onClick={handleLinkClick} className={`flex items-center p-3 my-1 rounded-lg transition-colors relative ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-primary dark:hover:text-slate-200'}`}>
            <Icon size={20} />
            <span className={`ml-4 font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{label}</span>
        </NavLink>
    );
  };
  

  return (
    <aside className={`h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800 px-4 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
        <div className={`flex items-center overflow-hidden`}>
           <Home size={28} className="text-primary flex-shrink-0"/>
           <span className={`ml-2 text-xl font-bold text-primary whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>AuraLiva</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {navLinks.map(link => <NavItem key={link.to} {...link} />)}
      </nav>

       <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 mb-4' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="flex items-center">
            <LazyImage src={user?.avatar || ''} alt="User Avatar" className="w-10 h-10 rounded-full" />
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-text-primary dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-text-secondary dark:text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
