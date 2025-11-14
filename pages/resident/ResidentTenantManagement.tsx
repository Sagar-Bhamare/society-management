
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RESIDENTS } from '../../constants';
import type { Resident } from '../../types';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';
import { PlusCircle, User, Phone, Calendar, FileText, Upload, Trash2, Edit, Camera, ShieldCheck, Banknote, VenetianMask } from 'lucide-react';

const ResidentTenantManagement: React.FC = () => {
  const { user } = useAuth();
  const [localResidents, setLocalResidents] = useState<Resident[]>(RESIDENTS);

  const residentData = useMemo(() => 
    localResidents.find(r => r.flatNo === user?.flatNo), 
    [localResidents, user?.flatNo]
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [tenantForm, setTenantForm] = useState({
      name: '',
      contact: '',
      moveInDate: '',
      agreementDoc: null as File | null,
      aadhaarDoc: null as File | null,
      panDoc: null as File | null,
      photo: null as File | null,
      policeVerificationDoc: null as File | null,
  });

  const handleOpenAddModal = () => {
    setModalMode('add');
    setTenantForm({
        name: '',
        contact: '',
        moveInDate: '',
        agreementDoc: null,
        aadhaarDoc: null,
        panDoc: null,
        photo: null,
        policeVerificationDoc: null,
    });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = () => {
    if (!residentData?.tenant) return;
    setModalMode('edit');
    setTenantForm({
        name: residentData.tenant.name,
        contact: residentData.tenant.contact,
        moveInDate: residentData.tenant.moveInDate,
        agreementDoc: null,
        aadhaarDoc: null,
        panDoc: null,
        photo: null,
        policeVerificationDoc: null,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTenantForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
        setTenantForm(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.name || !tenantForm.contact || !tenantForm.moveInDate) {
        toast.error("Please fill in tenant's name, contact, and move-in date.");
        return;
    }
    if (modalMode === 'add' && (!tenantForm.agreementDoc || !tenantForm.aadhaarDoc || !tenantForm.panDoc || !tenantForm.photo || !tenantForm.policeVerificationDoc)) {
        toast.error("Please upload all required documents.");
        return;
    }

    const newTenant = {
      id: residentData?.tenant?.id || `ten-${Date.now()}`,
      name: tenantForm.name,
      contact: tenantForm.contact,
      moveInDate: tenantForm.moveInDate,
      agreementDoc: tenantForm.agreementDoc?.name || residentData?.tenant?.agreementDoc || '',
      aadhaarDoc: tenantForm.aadhaarDoc?.name || residentData?.tenant?.aadhaarDoc || '',
      panDoc: tenantForm.panDoc?.name || residentData?.tenant?.panDoc || '',
      photo: tenantForm.photo?.name || residentData?.tenant?.photo || '',
      policeVerificationDoc: tenantForm.policeVerificationDoc?.name || residentData?.tenant?.policeVerificationDoc || '',
    };
    
    setLocalResidents(prev => prev.map(res => 
        res.id === residentData?.id ? { ...res, tenant: newTenant } : res
    ));

    toast.success(`Tenant ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
    setIsModalOpen(false);
  };

  const handleRemoveTenant = () => {
    setLocalResidents(prev => prev.map(res => 
        res.id === residentData?.id ? { ...res, tenant: undefined } : res
    ));
    toast.success("Tenant information removed.");
  };
  
  const FileInput: React.FC<{label: string, name: keyof typeof tenantForm, file: File | null, icon: React.ElementType}> = ({label, name, file, icon: Icon}) => (
     <div>
        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">{label}</label>
        <label htmlFor={name} className="mt-1 flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
            <Icon size={18} className="text-slate-500" />
            <span className="text-sm text-text-primary dark:text-slate-200 truncate">{file?.name || "Choose file..."}</span>
        </label>
        <input type="file" name={name} id={name} onChange={handleFileChange} className="hidden" />
    </div>
  );

  const DocumentDisplay: React.FC<{label: string, filename: string, icon: React.ElementType}> = ({label, filename, icon: Icon}) => (
    <button onClick={() => toast.success(`Viewing ${filename}`)} className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-primary/10 border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:border-primary/50">
        <div className="p-2 bg-primary/10 text-primary rounded-full">
            <Icon className="w-5 h-5"/>
        </div>
        <div>
            <p className="font-semibold text-left text-text-primary dark:text-slate-200">{label}</p>
            <p className="text-xs text-text-secondary dark:text-slate-400 text-left">{filename}</p>
        </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">My Tenant Information</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6">
        {residentData?.tenant ? (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-slate-200">{residentData.tenant.name}</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleOpenEditModal} className="flex items-center gap-2 bg-slate-100 text-text-primary font-semibold py-2 px-3 rounded-full hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition">
                            <Edit size={16} /> Edit
                        </button>
                        <button onClick={handleRemoveTenant} className="flex items-center gap-2 bg-red-100 text-red-700 font-semibold py-2 px-3 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition">
                            <Trash2 size={16} /> Remove
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Phone className="w-6 h-6 text-primary"/>
                        <div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Contact</p>
                            <p className="font-semibold">{residentData.tenant.contact}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-6 h-6 text-primary"/>
                        <div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Move-in Date</p>
                            <p className="font-semibold">{residentData.tenant.moveInDate}</p>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DocumentDisplay label="Rental Agreement" filename={residentData.tenant.agreementDoc} icon={FileText} />
                     <DocumentDisplay label="Aadhaar Card" filename={residentData.tenant.aadhaarDoc} icon={VenetianMask} />
                     <DocumentDisplay label="PAN Card" filename={residentData.tenant.panDoc} icon={Banknote} />
                     <DocumentDisplay label="Photo" filename={residentData.tenant.photo} icon={Camera} />
                     <DocumentDisplay label="Police Verification" filename={residentData.tenant.policeVerificationDoc} icon={ShieldCheck} />
                 </div>
            </div>
        ) : (
            <div className="text-center py-12">
                <User size={48} className="mx-auto text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary dark:text-slate-200">No Tenant Information</h3>
                <p className="mt-1 text-text-secondary dark:text-slate-400">You have not added any tenant details for your flat.</p>
                <button onClick={handleOpenAddModal} className="mt-6 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition mx-auto">
                    <PlusCircle size={20} />
                    Add Tenant Details
                </button>
            </div>
        )}
      </div>

      <Modal title={modalMode === 'add' ? 'Add Tenant Details' : 'Edit Tenant Details'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Tenant Name</label>
                <input type="text" name="name" value={tenantForm.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Contact Number</label>
                    <input type="text" name="contact" value={tenantForm.contact} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Move-in Date</label>
                    <input type="date" name="moveInDate" value={tenantForm.moveInDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileInput label="Rent Agreement" name="agreementDoc" file={tenantForm.agreementDoc} icon={FileText}/>
                <FileInput label="Aadhaar Card" name="aadhaarDoc" file={tenantForm.aadhaarDoc} icon={VenetianMask}/>
                <FileInput label="PAN Card" name="panDoc" file={tenantForm.panDoc} icon={Banknote}/>
                <FileInput label="Photo" name="photo" file={tenantForm.photo} icon={Camera}/>
                <FileInput label="Police Verification Form" name="policeVerificationDoc" file={tenantForm.policeVerificationDoc} icon={ShieldCheck}/>
             </div>

           <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                {modalMode === 'add' ? 'Save Tenant' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResidentTenantManagement;
