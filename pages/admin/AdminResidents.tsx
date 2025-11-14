
import React, { useState, useEffect } from 'react';
import { RESIDENTS } from '../../constants';
import type { Resident } from '../../types';
import { PlusCircle, Edit, Trash2, UserCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';

const AdminResidents: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);
  
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Pre-fill form when editing
    if (isModalOpen && modalMode === 'edit') {
        // The currentResident state is already set by handleOpenEditModal
    } else {
        // Reset for adding
        setCurrentResident({ id: '', name: '', wing: 'A', flatNo: '', contact: '', status: 'Active' });
    }
  }, [isModalOpen, modalMode]);
  
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentResident({ id: '', name: '', wing: 'A', flatNo: '', contact: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resident: Resident) => {
    setModalMode('edit');
    setCurrentResident({ ...resident }); // Create a copy to edit
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentResident) return;
    const { name, value } = e.target;
    setCurrentResident({ ...currentResident, [name]: value });
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResident?.name || !currentResident?.flatNo || !currentResident?.contact) {
      toast.error('Please fill all fields.');
      return;
    }

    if (modalMode === 'add') {
      const newResident = { ...currentResident, id: `res-${Date.now()}` };
      setResidents([newResident, ...residents]);
      toast.success('Resident added successfully!');
    } else {
      setResidents(residents.map(r => r.id === currentResident.id ? currentResident : r));
      toast.success('Resident details updated!');
    }

    setIsModalOpen(false);
    setCurrentResident(null);
  };

  const handleOpenDeleteModal = (resident: Resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!residentToDelete) return;

    setIsDeleting(true);
    // Simulate async operation for better UX feedback
    setTimeout(() => {
      setResidents(residents.filter(r => r.id !== residentToDelete.id));
      toast.success(`Resident "${residentToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setResidentToDelete(null);
      setIsDeleting(false);
    }, 500);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Resident Management</h1>
        <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          <PlusCircle size={20} />
          Add New Resident
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <tr>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Name</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Wing/Flat No.</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Contact</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Tenant</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Actions</th>
                </tr>
            </thead>
            <tbody>
                {residents.map(resident => (
                <tr key={resident.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                    <td className="p-4 text-text-primary dark:text-slate-200">{resident.name}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{`${resident.wing}-${resident.flatNo}`}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{resident.contact}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">
                      {resident.tenant ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                              <UserCheck size={14} />
                              {resident.tenant.name}
                          </span>
                      ) : 'N/A'}
                    </td>
                    <td className="p-4">
                        <StatusBadge text={resident.status} type={resident.status === 'Active' ? 'success' : 'neutral'} />
                    </td>
                    <td className="p-4">
                        <div className="flex gap-2">
                            <button onClick={() => handleOpenEditModal(resident)} className="text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white"><Edit size={18} /></button>
                            <button onClick={() => handleOpenDeleteModal(resident)} className="text-text-secondary dark:text-slate-400 hover:text-error dark:hover:text-red-500"><Trash2 size={18} /></button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden">
            {residents.map(resident => (
                <div key={resident.id} className="p-4 border-b dark:border-slate-700 last:border-b-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-text-primary dark:text-slate-200">{resident.name}</p>
                            <p className="text-sm text-text-secondary dark:text-slate-400">{`${resident.wing}-${resident.flatNo}`}</p>
                        </div>
                         <StatusBadge text={resident.status} type={resident.status === 'Active' ? 'success' : 'neutral'} />
                    </div>
                     {resident.tenant && (
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mt-2">
                            <UserCheck size={14} />
                            <span>Tenant: {resident.tenant.name}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-text-secondary dark:text-slate-400">{resident.contact}</p>
                         <div className="flex gap-4">
                            <button onClick={() => handleOpenEditModal(resident)} className="text-text-secondary dark:text-slate-400 hover:text-primary"><Edit size={18} /></button>
                            <button onClick={() => handleOpenDeleteModal(resident)} className="text-text-secondary dark:text-slate-400 hover:text-error"><Trash2 size={18} /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <Modal title={modalMode === 'add' ? 'Add New Resident' : 'Edit Resident Details'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSaveResident} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={currentResident?.name || ''}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Flat Number</label>
            <input 
              type="text" 
              name="flatNo"
              value={currentResident?.flatNo || ''}
              onChange={handleInputChange}
              placeholder="e.g. A-101"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Contact Number</label>
            <input 
              type="text" 
              name="contact"
              value={currentResident?.contact || ''}
              onChange={handleInputChange}
              placeholder="e.g. 9876543210"
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">{modalMode === 'add' ? 'Add Resident' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Confirm Deletion" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        {residentToDelete && (
          <div>
            <p className="text-text-secondary dark:text-slate-400 mb-6">
              Are you sure you want to delete resident <strong className="text-text-primary dark:text-slate-200">{residentToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setResidentToDelete(null); }}
                className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-error text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminResidents;
