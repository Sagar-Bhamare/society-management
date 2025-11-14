import React, { useState } from 'react';
import { COMPLAINTS } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { PlusCircle, FileText, MessageSquare, AlertTriangle, ChevronsUp, ChevronUp, ChevronDown, ShieldQuestion, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import type { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';

const priorityOptions: { level: ComplaintPriority, icon: React.ElementType, color: string }[] = [
    { level: 'High', icon: ChevronsUp, color: 'text-red-500' },
    { level: 'Medium', icon: ChevronUp, color: 'text-amber-500' },
    { level: 'Low', icon: ChevronDown, color: 'text-blue-500' },
];


const ResidentComplaints: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use local state for complaints to make the list dynamic
  const [myComplaints, setMyComplaints] = useState<Complaint[]>(
    COMPLAINTS.filter(c => c.raisedBy.includes(user?.name || '###NON-EXISTENT-USER###'))
  );

  const [newComplaintTitle, setNewComplaintTitle] = useState('');
  const [newComplaintDesc, setNewComplaintDesc] = useState('');
  const [newComplaintPriority, setNewComplaintPriority] = useState<ComplaintPriority>('Medium');
  
  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);


  const getPriorityType = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
    }
  };

  const getStatusType = (status: ComplaintStatus) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
    }
  };
  
  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintTitle.trim() || !newComplaintDesc.trim()) {
      toast.error('Please provide a title and description for your complaint.');
      return;
    }

    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      title: newComplaintTitle.trim(),
      description: newComplaintDesc.trim(),
      priority: newComplaintPriority,
      raisedBy: `${user?.name} (${user?.flatNo})`,
      date: new Date().toISOString().split('T')[0],
      status: 'Open'
    };
    
    setMyComplaints(prevComplaints => [newComplaint, ...prevComplaints]);

    // Reset form and close modal
    setNewComplaintTitle('');
    setNewComplaintDesc('');
    setNewComplaintPriority('Medium');
    setIsModalOpen(false);
    
    toast.success('Your complaint has been submitted!');
  };

  const handleOpenDeleteModal = (complaint: Complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!complaintToDelete) return;

    setMyComplaints(myComplaints.filter(c => c.id !== complaintToDelete.id));
    toast.success(`Complaint "${complaintToDelete.title}" deleted.`);
    
    setIsDeleteModalOpen(false);
    setComplaintToDelete(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">My Complaints</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          <PlusCircle size={20} />
          Raise New Complaint
        </button>
      </div>
      
      {myComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6 flex flex-col justify-between animate-fade-in-fast">
                <div>
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-text-primary dark:text-slate-200 pr-2">{complaint.title}</h3>
                      <StatusBadge text={complaint.priority} type={getPriorityType(complaint.priority)} />
                  </div>
                  <p className="text-xs text-text-secondary dark:text-slate-400 mb-4">Date: {complaint.date}</p>
                  <p className="text-sm text-text-primary dark:text-slate-300 mb-4">{complaint.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <StatusBadge text={complaint.status} type={getStatusType(complaint.status)} />
                  <button
                    onClick={() => handleOpenDeleteModal(complaint)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                    aria-label="Delete complaint"
                    title="Delete Complaint"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
            </div>
            ))}
        </div>
      ) : (
         <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/80">
            <ShieldQuestion className="mx-auto text-primary" size={40} />
            <h3 className="mt-4 text-lg font-semibold text-text-primary dark:text-slate-200">No Complaints Here</h3>
            <p className="mt-1 text-text-secondary dark:text-slate-400">Looks like everything is in order. Have an issue? Raise a complaint!</p>
        </div>
      )}

       <Modal title="Raise a New Complaint" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleRaiseComplaint} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Complaint Title</label>
             <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={newComplaintTitle}
                  onChange={(e) => setNewComplaintTitle(e.target.value)}
                  placeholder="e.g., Streetlight not working" 
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" 
                  required
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Description</label>
            <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                <textarea 
                  rows={4} 
                  value={newComplaintDesc}
                  onChange={(e) => setNewComplaintDesc(e.target.value)}
                  placeholder="Provide details about the issue..." 
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  required
                />
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-2">Priority</label>
             <div className="flex justify-between items-center gap-2">
                {priorityOptions.map(({level, icon: Icon, color}) => (
                    <button 
                        key={level}
                        type="button"
                        onClick={() => setNewComplaintPriority(level)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg border-2 transition-all ${newComplaintPriority === level ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}
                    >
                        <Icon size={16} className={color} />
                        {level}
                    </button>
                ))}
             </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Submit Complaint</button>
          </div>
        </form>
      </Modal>

      <Modal title="Confirm Deletion" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        {complaintToDelete && (
            <div>
                <p className="text-text-secondary dark:text-slate-400 mb-6">
                    Are you sure you want to delete the complaint: <strong className="text-text-primary dark:text-slate-200">"{complaintToDelete.title}"</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="bg-error text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default ResidentComplaints;