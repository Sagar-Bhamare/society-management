
import React from 'react';
import KPICard from '../../components/KPICard';
import { Users, ShieldCheck, Siren, Car, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VISITORS, PATROLS, INCIDENTS, VEHICLES } from '../../constants';
import StatusBadge from '../../components/StatusBadge';
import type { Incident, IncidentSeverity, IncidentStatus } from '../../types';

const SecurityDashboard: React.FC = () => {
    const visitorsInside = VISITORS.filter(v => v.status === 'Inside').length;
    const patrolsInProgress = PATROLS.filter(p => p.status === 'In Progress').length;
    const openIncidents = INCIDENTS.filter(i => i.status !== 'Resolved').length;
    const vehiclesInside = VEHICLES.filter(v => v.status === 'Inside').length;
    
    const recentIncidents = INCIDENTS.slice(0, 3);
    const activePatrols = PATROLS.filter(p => p.status === 'In Progress');

    const getSeverityType = (severity: IncidentSeverity) => {
        switch (severity) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'info';
        }
    };

    const getStatusType = (status: IncidentStatus) => {
        switch (status) {
            case 'Reported': return 'error';
            case 'Under Investigation': return 'warning';
            case 'Resolved': return 'success';
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Security Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Visitors Inside" value={visitorsInside} icon={Users} color="#3b82f6" />
                <KPICard title="Patrols In Progress" value={patrolsInProgress} icon={ShieldCheck} color="#10b981" />
                <KPICard title="Open Incidents" value={openIncidents} icon={Siren} color="#ef4444" />
                <KPICard title="Vehicles Inside" value={vehiclesInside} icon={Car} color="#f59e0b" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/security/visitor-log" className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 transform hover:-translate-y-1">
                            <ShieldCheck className="mx-auto h-8 w-8 mb-2" />
                            <span className="font-semibold text-sm">Visitor Log</span>
                        </Link>
                         <Link to="/security/patrols" className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 transform hover:-translate-y-1">
                            <Clock className="mx-auto h-8 w-8 mb-2" />
                            <span className="font-semibold text-sm">Patrols</span>
                        </Link>
                         <Link to="/security/incidents" className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 transform hover:-translate-y-1">
                            <Siren className="mx-auto h-8 w-8 mb-2" />
                            <span className="font-semibold text-sm">Incidents</span>
                        </Link>
                         <Link to="/security/vehicles" className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 transform hover:-translate-y-1">
                            <Car className="mx-auto h-8 w-8 mb-2" />
                            <span className="font-semibold text-sm">Vehicles</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                    <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Active Patrols</h2>
                     {activePatrols.length > 0 ? (
                        <div className="space-y-3">
                        {activePatrols.map(patrol => (
                             <div key={patrol.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                <p className="font-semibold text-sm text-text-primary dark:text-slate-200">{patrol.routeName}</p>
                                <p className="text-xs text-text-secondary dark:text-slate-400">By {patrol.guardName} - Started at {patrol.startTime}</p>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-text-secondary dark:text-slate-400 text-center py-4">No patrols currently in progress.</p>}
                </div>
            </div>

             <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
                <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Recent Incidents</h2>
                {recentIncidents.length > 0 ? (
                    <div className="space-y-4">
                    {recentIncidents.map(incident => (
                        <div key={incident.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 gap-2">
                            <div>
                                <p className="font-semibold text-sm text-text-primary dark:text-slate-200">{incident.title}</p>
                                <p className="text-xs text-text-secondary dark:text-slate-400">Reported by {incident.reportedBy} on {incident.date} at {incident.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge text={incident.severity} type={getSeverityType(incident.severity)} />
                                <StatusBadge text={incident.status} type={getStatusType(incident.status)} />
                            </div>
                        </div>
                    ))}
                    </div>
                ) : <p className="text-sm text-text-secondary dark:text-slate-400 text-center py-4">No incidents reported.</p>}
            </div>

        </div>
    );
};

export default SecurityDashboard;
