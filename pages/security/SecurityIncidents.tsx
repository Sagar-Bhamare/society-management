

import React, { useState } from 'react';
import { INCIDENTS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import type { Incident, IncidentSeverity, IncidentStatus } from '../../types';
import { PlusCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';

const SecurityIncidents: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    severity: 'Low' as IncidentSeverity,
    description: '',
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('Reported');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIncident(prev => ({ ...prev, [name]: value }));
  };

  const handleReportIncident = () => {
    if (!newIncident.title.trim() || !newIncident.description.trim()) {
      toast.error('Title and Description are required.');
      return;
    }
    const incidentToAdd: Incident = {
      id: `inc-${Date.now()}`,
      title: newIncident.title.trim(),
      reportedBy: user?.name || 'Security',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      severity: newIncident.severity,
      status: 'Reported',
      description: newIncident.description.trim(),
    };
    setIncidents([incidentToAdd, ...incidents]);
    setIsModalOpen(false);
    setNewIncident({ title: '', severity: 'Low', description: '' });
    toast.success('Incident reported successfully!');
  };
  
  const handleOpenStatusModal = (incident: Incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setIncidents(incidents.map(i => 
      i.id === selectedIncident.id ? { ...i, status: newStatus } : i
    ));
    
    toast.success(`Status for "${selectedIncident.title}" updated to ${newStatus}.`);
    setIsStatusModalOpen(false);
    setSelectedIncident(null);
  };


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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Incident Reports</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          <PlusCircle size={20} />
          Report New Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-text-primary dark:text-slate-200 pr-2">{incident.title}</h3>
                <StatusBadge text={incident.severity} type={getSeverityType(incident.severity)} />
              </div>
              <p className="text-sm text-text-secondary dark:text-slate-400 mb-1">By: {incident.reportedBy}</p>
              <p className="text-xs text-text-secondary dark:text-slate-400 mb-4">{incident.date} at {incident.time}</p>
              <p className="text-sm text-text-primary dark:text-slate-300 mb-4">{incident.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <StatusBadge text={incident.status} type={getStatusType(incident.status)} />
              <button onClick={() => handleOpenStatusModal(incident)} className="text-sm font-medium text-primary hover:underline">Update Status</button>
            </div>
          </div>
        ))}
      </div>

       <Modal title="Report New Incident" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleReportIncident(); }}>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Title</label>
            <input type="text" name="title" value={newIncident.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Severity</label>
            <select name="severity" value={newIncident.severity} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Description</label>
            <textarea name="description" rows={4} value={newIncident.description} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Report Incident</button>
          </div>
        </form>
      </Modal>

       <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Update Incident Status">
        {selectedIncident && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <p className="font-semibold text-text-primary dark:text-slate-200">{selectedIncident.title}</p>
              <p className="text-sm text-text-secondary dark:text-slate-400">Reported by: {selectedIncident.reportedBy}</p>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-secondary dark:text-slate-400">New Status</label>
              <select 
                id="status" 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value as IncidentStatus)} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <option value="Reported">Reported</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsStatusModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
              <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Update Status</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SecurityIncidents;