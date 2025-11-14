import React, { useState, useMemo } from 'react';
import { COMPLAINTS } from '../../constants';
import type { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { Filter, MessageSquare, Edit, Clock } from 'lucide-react';

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Open');
  const [comment, setComment] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | ComplaintPriority>('All');

  const getPriorityType = (priority: ComplaintPriority): 'error' | 'warning' | 'info' => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
    }
  };

  const handleOpenStatusModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setIsStatusModalOpen(true);
  };

  const handleOpenCommentModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setComment('');
    setIsCommentModalOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setComplaints(complaints.map(c => 
      c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
    ));
    
    toast.success(`Status for "${selectedComplaint.title}" updated to ${newStatus}.`);
    setIsStatusModalOpen(false);
    setSelectedComplaint(null);
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    toast.success(`Comment added to "${selectedComplaint?.title}". (Simulation)`);
    setIsCommentModalOpen(false);
    setSelectedComplaint(null);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => priorityFilter === 'All' || c.priority === priorityFilter);
  }, [complaints, priorityFilter]);

  const columns: Record<ComplaintStatus, Complaint[]> = {
    'Open': filteredComplaints.filter(c => c.status === 'Open'),
    'In Progress': filteredComplaints.filter(c => c.status === 'In Progress'),
    'Resolved': filteredComplaints.filter(c => c.status === 'Resolved'),
  };

  const columnStyles: Record<ComplaintStatus, string> = {
    'Open': 'border-t-red-500',
    'In Progress': 'border-t-amber-500',
    'Resolved': 'border-t-emerald-500',
  };

  const ComplaintCard: React.FC<{ complaint: Complaint }> = ({ complaint }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 space-y-3 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-text-primary dark:text-slate-200">{complaint.title}</h4>
        <StatusBadge text={complaint.priority} type={getPriorityType(complaint.priority)} />
      </div>
      <p className="text-sm text-text-secondary dark:text-slate-400">{complaint.description}</p>
      <div className="text-xs text-text-secondary dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
        <p className="font-medium">{complaint.raisedBy}</p>
        <p className="flex items-center gap-1"><Clock size={12} /> {complaint.date}</p>
      </div>
       <div className="flex justify-end items-center gap-2">
            <button onClick={() => handleOpenCommentModal(complaint)} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white" title="Add Comment">
                <MessageSquare size={16} />
            </button>
            <button onClick={() => handleOpenStatusModal(complaint)} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-white" title="Change Status">
                <Edit size={16} />
            </button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Complaints Board</h1>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select 
            value={priorityFilter} 
            onChange={e => setPriorityFilter(e.target.value as 'All' | ComplaintPriority)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
        {(Object.keys(columns) as ComplaintStatus[]).map(status => (
            <div key={status} className={`bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border-t-4 ${columnStyles[status]} flex flex-col`}>
                <div className="p-4">
                    <h2 className="font-semibold text-lg text-text-primary dark:text-slate-200">{status} <span className="text-sm font-normal text-slate-500">({columns[status].length})</span></h2>
                </div>
                <div className="space-y-4 overflow-y-auto p-4 pt-0">
                    {columns[status].map(complaint => (
                        <ComplaintCard key={complaint.id} complaint={complaint} />
                    ))}
                    {columns[status].length === 0 && (
                        <div className="text-center text-sm text-slate-500 py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                            No complaints here.
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Update Complaint Status">
        {selectedComplaint && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <p className="font-semibold text-text-primary dark:text-slate-200">{selectedComplaint.title}</p>
              <p className="text-sm text-text-secondary dark:text-slate-400">Raised by: {selectedComplaint.raisedBy}</p>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-secondary dark:text-slate-400">New Status</label>
              <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
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

      <Modal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)} title="Add Comment">
        {selectedComplaint && (
          <form onSubmit={handleAddComment} className="space-y-4">
            <div>
              <p className="font-semibold text-text-primary dark:text-slate-200">{selectedComplaint.title}</p>
              <p className="text-sm text-text-secondary dark:text-slate-400">Raised by: {selectedComplaint.raisedBy}</p>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Your Comment</label>
              <textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="Add your notes or updates here..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsCommentModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
              <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Add Comment</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaints;