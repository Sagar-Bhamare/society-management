

import React, { useState } from 'react';
import { PATROLS } from '../../constants';
import type { Patrol, PatrolStatus } from '../../types';
import { PlusCircle, Play, StopCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';

const SecurityPatrols: React.FC = () => {
  const [patrols, setPatrols] = useState<Patrol[]>(PATROLS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatrol, setNewPatrol] = useState({ routeName: '', guardName: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPatrol(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatrol = () => {
    if (!newPatrol.routeName.trim() || !newPatrol.guardName.trim()) {
      toast.error('Route Name and Guard Name are required.');
      return;
    }

    const patrolToAdd: Patrol = {
      id: `pat-${Date.now()}`,
      routeName: newPatrol.routeName.trim(),
      guardName: newPatrol.guardName.trim(),
      startTime: null,
      endTime: null,
      status: 'Scheduled',
    };
    
    setPatrols([patrolToAdd, ...patrols]);
    setIsModalOpen(false);
    setNewPatrol({ routeName: '', guardName: '' });
    toast.success('New patrol scheduled successfully!');
  };

  const handleStartPatrol = (id: string) => {
    setPatrols(patrols.map(p => 
      p.id === id ? { ...p, status: 'In Progress', startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p
    ));
    toast.success('Patrol started!');
  };

  const handleEndPatrol = (id: string) => {
    setPatrols(patrols.map(p => 
      p.id === id ? { ...p, status: 'Completed', endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p
    ));
    toast.success('Patrol completed!');
  };
  
  const getStatusType = (status: PatrolStatus) => {
    switch(status) {
      case 'Scheduled': return 'info';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Patrol Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          <PlusCircle size={20} />
          Schedule New Patrol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patrols.map(patrol => (
          <div key={patrol.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-text-primary dark:text-slate-200 pr-2">{patrol.routeName}</h3>
                <StatusBadge text={patrol.status} type={getStatusType(patrol.status)} />
              </div>
              <p className="text-sm text-text-secondary dark:text-slate-400 mb-1">Guard: {patrol.guardName}</p>
              <p className="text-xs text-text-secondary dark:text-slate-400">Start: {patrol.startTime || 'N/A'}</p>
              <p className="text-xs text-text-secondary dark:text-slate-400">End: {patrol.endTime || 'N/A'}</p>
            </div>
            <div className="flex justify-end items-center mt-4">
              {patrol.status === 'Scheduled' && (
                <button onClick={() => handleStartPatrol(patrol.id)} className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-emerald-600 transition">
                  <Play size={16} /> Start Patrol
                </button>
              )}
              {patrol.status === 'In Progress' && (
                <button onClick={() => handleEndPatrol(patrol.id)} className="flex items-center gap-2 bg-amber-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-amber-600 transition">
                  <StopCircle size={16} /> End Patrol
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal title="Schedule New Patrol" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddPatrol(); }}>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Route Name</label>
            <input type="text" name="routeName" placeholder="e.g., Perimeter Check" value={newPatrol.routeName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Guard Name</label>
            <input type="text" name="guardName" placeholder="e.g., Suresh Kumar" value={newPatrol.guardName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Schedule Patrol</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SecurityPatrols;