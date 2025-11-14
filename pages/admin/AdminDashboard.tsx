
import React, { useState } from 'react';
import KPICard from '../../components/KPICard';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Users, DollarSign, ShieldAlert, Building, FileText, UserPlus, Megaphone, FilePlus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { INVOICES, RESIDENTS, COMPLAINTS, PAYMENTS, NOTICES } from '../../constants';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import type { ComplaintPriority } from '../../types';

const monthlyCollectionData = [
  { name: 'Jan', collection: 40000 },
  { name: 'Feb', collection: 30000 },
  { name: 'Mar', collection: 50000 },
  { name: 'Apr', collection: 45000 },
  { name: 'May', collection: 60000 },
  { name: 'Jun', collection: 55000 },
];

const complaintStatusData = [
  { name: 'Open', value: COMPLAINTS.filter(c => c.status === 'Open').length },
  { name: 'In Progress', value: COMPLAINTS.filter(c => c.status === 'In Progress').length },
  { name: 'Resolved', value: COMPLAINTS.filter(c => c.status === 'Resolved').length },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];


const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('complaints');
  
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const gridStroke = theme === 'dark' ? '#334155' : '#e2e8f0';

  const totalResidents = RESIDENTS.length;
  const pendingPayments = INVOICES.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;
  const openComplaints = COMPLAINTS.filter(c => c.status === 'Open').length;
  const totalNotices = NOTICES.length;

  const kpis = {
    Admin: [
        { title: "Total Residents", value: totalResidents, icon: Users, color: "#6366f1" },
        { title: "Pending Payments", value: pendingPayments, icon: DollarSign, color: "#f59e0b" },
        { title: "Open Complaints", value: openComplaints, icon: ShieldAlert, color: "#ef4444" },
        { title: "Bookings Today", value: "12", icon: Building, color: "#10b981" }
    ],
    Secretary: [
        { title: "Total Residents", value: totalResidents, icon: Users, color: "#6366f1" },
        { title: "Open Complaints", value: openComplaints, icon: ShieldAlert, color: "#ef4444" },
        { title: "Total Notices", value: totalNotices, icon: FileText, color: "#3b82f6" },
        { title: "Bookings Today", value: "12", icon: Building, color: "#10b981" }
    ],
    Treasurer: [
        { title: "Pending Payments", value: pendingPayments, icon: DollarSign, color: "#f59e0b" },
        { title: "Collection (Jun)", value: `₹${monthlyCollectionData.find(m => m.name === 'Jun')?.collection.toLocaleString()}`, icon: DollarSign, color: "#10b981" },
        { title: "Overdue Invoices", value: INVOICES.filter(i => i.status === 'Overdue').length, icon: DollarSign, color: "#ef4444" },
        { title: "Total Residents", value: totalResidents, icon: Users, color: "#6366f1" }
    ],
    Security: [],
    Resident: []
  };

  const userKpis = kpis[user?.role || 'Admin'];
  
  const allQuickActions = [
    { label: 'Add New Resident', icon: UserPlus, path: '/admin/residents', roles: ['Admin', 'Secretary'] },
    { label: 'Post a Notice', icon: Megaphone, path: '/admin/notices', roles: ['Admin', 'Secretary'] },
    { label: 'Generate Invoice', icon: FilePlus, path: '/admin/finances', roles: ['Admin', 'Treasurer'] },
    { label: 'Manage Complaints', icon: ShieldAlert, path: '/admin/complaints', roles: ['Admin', 'Secretary'] },
  ];
  
  const availableActions = allQuickActions.filter(action => user?.role && action.roles.includes(user.role));
  
  const getPriorityType = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Admin Dashboard</h1>
        <p className="text-text-secondary dark:text-slate-400 mt-1">An overview of society activities and finances.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {userKpis.map(kpi => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
            {(user?.role === 'Admin' || user?.role === 'Treasurer') && (
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Monthly Collection (₹)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyCollectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: textColor }} tickLine={{ stroke: textColor }} />
                        <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: textColor }} tickLine={{ stroke: textColor }}/>
                        <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.1)'}} contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg }} />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Bar dataKey="collection" fill="#6366f1" barSize={30} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200">Recent Activity</h2>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <button onClick={() => setActiveTab('complaints')} className={`px-3 py-1 text-sm font-semibold rounded-full ${activeTab === 'complaints' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-600 dark:text-slate-300'}`}>Complaints</button>
                        <button onClick={() => setActiveTab('payments')} className={`px-3 py-1 text-sm font-semibold rounded-full ${activeTab === 'payments' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-600 dark:text-slate-300'}`}>Payments</button>
                    </div>
                </div>
                
                {activeTab === 'complaints' && (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {COMPLAINTS.slice(0, 4).map(complaint => (
                            <li key={complaint.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-text-primary dark:text-slate-200">{complaint.title}</p>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">{complaint.raisedBy} - {complaint.date}</p>
                                </div>
                                <StatusBadge text={complaint.priority} type={getPriorityType(complaint.priority)} />
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'payments' && (
                     <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {PAYMENTS.slice(0, 4).map(payment => (
                            <li key={payment.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-text-primary dark:text-slate-200">{payment.residentName}</p>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">{payment.invoiceNumber} - {payment.paymentDate}</p>
                                </div>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{payment.amount.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        {/* Side content */}
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                    {availableActions.map(action => (
                         <Link key={action.label} to={action.path} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary transition-colors group">
                           <div className="flex items-center gap-3">
                              <action.icon className="h-5 w-5 text-text-secondary dark:text-slate-400 group-hover:text-primary transition-colors" />
                              <span className="font-semibold text-sm text-text-primary dark:text-slate-200">{action.label}</span>
                           </div>
                           <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {(user?.role === 'Admin' || user?.role === 'Secretary') && (
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Complaint Status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                        <Pie data={complaintStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {complaintStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg }} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: "14px"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
