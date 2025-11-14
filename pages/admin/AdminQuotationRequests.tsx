
import React, { useState } from 'react';
import { QUOTATION_REQUESTS } from '../../constants';
import type { QuotationRequest, QuotationStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { PlusCircle, UploadCloud, FileText, Check, X, Hammer, User, Calendar, CircleDollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminQuotationRequests: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<QuotationRequest[]>(QUOTATION_REQUESTS);
    const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
    const [isCommenceModalOpen, setIsCommenceModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);

    const [newRequest, setNewRequest] = useState({
        title: '',
        description: '',
        vendorName: '',
        amount: '',
        quotationFile: null as File | null,
    });
    const [commenceNotes, setCommenceNotes] = useState('');

    const getStatusType = (status: QuotationStatus) => {
        switch (status) {
            case 'Pending Treasurer Approval': return 'warning';
            case 'Pending Committee Approval': return 'info';
            case 'Committee Approved': return 'info';
            case 'Work Commenced': return 'success';
            case 'Rejected by Treasurer': return 'error';
            default: return 'neutral';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            setNewRequest(prev => ({ ...prev, quotationFile: files[0] }));
        }
    };
    
    const handleRaiseRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequest.title || !newRequest.vendorName || !newRequest.amount || !newRequest.quotationFile) {
            toast.error("Please fill all fields and upload the quotation file.");
            return;
        }
        const requestToAdd: QuotationRequest = {
            id: `quote-${Date.now()}`,
            title: newRequest.title,
            description: newRequest.description,
            vendorName: newRequest.vendorName,
            amount: parseFloat(newRequest.amount),
            quotationFile: newRequest.quotationFile.name,
            raisedBy: user?.name || 'Secretary',
            dateRaised: new Date().toISOString().split('T')[0],
            status: 'Pending Treasurer Approval',
        };
        setRequests([requestToAdd, ...requests]);
        setIsRaiseModalOpen(false);
        setNewRequest({ title: '', description: '', vendorName: '', amount: '', quotationFile: null });
        toast.success("Quotation request raised successfully.");
    };

    const handleStatusUpdate = (id: string, newStatus: QuotationStatus) => {
        setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
        toast.success(`Request status updated to "${newStatus}".`);
    };

    const handleCommenceWork = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setRequests(requests.map(req => req.id === selectedRequest.id ? { 
            ...req, 
            status: 'Work Commenced',
            workCommenceDate: new Date().toISOString().split('T')[0],
            workCommenceNotes: commenceNotes,
        } : req));
        toast.success(`Work for "${selectedRequest.title}" has commenced. Residents will be notified.`);
        setIsCommenceModalOpen(false);
        setSelectedRequest(null);
        setCommenceNotes('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Quotation Requests</h1>
                {user?.role === 'Secretary' && (
                    <button onClick={() => setIsRaiseModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
                        <PlusCircle size={20} />
                        Raise New Request
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {requests.map(req => (
                    <div key={req.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg text-text-primary dark:text-slate-200">{req.title}</h3>
                                <StatusBadge text={req.status} type={getStatusType(req.status)} />
                            </div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">By {req.vendorName}</p>
                        </div>
                        <p className="text-sm text-text-primary dark:text-slate-300">{req.description}</p>
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200 dark:border-slate-700">
                            <span className="font-semibold text-text-secondary dark:text-slate-400">Amount: <span className="text-xl font-bold text-primary">₹{req.amount.toLocaleString()}</span></span>
                            <a href="#" onClick={(e) => { e.preventDefault(); toast.success(`Opening ${req.quotationFile}`);}} className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                                <FileText size={14}/> View File
                            </a>
                        </div>

                        {/* Action buttons based on role and status */}
                        <div className="flex justify-end items-center gap-2">
                            {user?.role === 'Treasurer' && req.status === 'Pending Treasurer Approval' && (
                                <>
                                    <button onClick={() => handleStatusUpdate(req.id, 'Rejected by Treasurer')} className="flex items-center gap-1.5 text-sm bg-red-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-red-600 transition"><X size={16}/> Reject</button>
                                    <button onClick={() => handleStatusUpdate(req.id, 'Pending Committee Approval')} className="flex items-center gap-1.5 text-sm bg-emerald-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-emerald-600 transition"><Check size={16}/> Approve</button>
                                </>
                            )}
                             {user?.role === 'Secretary' && req.status === 'Pending Committee Approval' && (
                                <button onClick={() => handleStatusUpdate(req.id, 'Committee Approved')} className="flex items-center gap-1.5 text-sm bg-blue-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-blue-600 transition"><Check size={16}/> Mark Committee Approved</button>
                            )}
                             {user?.role === 'Treasurer' && req.status === 'Committee Approved' && (
                                <button onClick={() => {setSelectedRequest(req); setIsCommenceModalOpen(true);}} className="flex items-center gap-1.5 text-sm bg-primary text-white font-semibold py-2 px-3 rounded-full hover:bg-indigo-700 transition"><Hammer size={16}/> Commence Work</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal title="Raise New Quotation Request" isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)}>
                <form onSubmit={handleRaiseRequest} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Title</label>
                        <input type="text" name="title" value={newRequest.title} onChange={handleInputChange} required placeholder="e.g., Clubhouse Renovation" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Vendor Name</label>
                        <input type="text" name="vendorName" value={newRequest.vendorName} onChange={handleInputChange} required placeholder="e.g., Quality Constructions" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Amount (₹)</label>
                        <input type="number" name="amount" value={newRequest.amount} onChange={handleInputChange} required placeholder="e.g., 150000" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Description</label>
                        <textarea name="description" value={newRequest.description} onChange={handleInputChange} rows={3} placeholder="Briefly describe the work or purpose." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Upload Quotation</label>
                        <label htmlFor="quotation-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer border-slate-300 dark:border-slate-600 hover:border-primary">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="text-sm text-text-secondary dark:text-slate-400">{newRequest.quotationFile ? newRequest.quotationFile.name : 'Click to upload or drag and drop'}</p>
                                <p className="text-xs text-slate-500">PDF, PNG, JPG</p>
                            </div>
                        </label>
                        <input id="quotation-upload" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e.target.files)} className="hidden"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsRaiseModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Submit Request</button>
                    </div>
                </form>
            </Modal>

             <Modal title="Commence Work" isOpen={isCommenceModalOpen} onClose={() => setIsCommenceModalOpen(false)}>
                {selectedRequest && (
                    <form onSubmit={handleCommenceWork} className="space-y-4">
                        <h3 className="font-bold text-lg text-text-primary dark:text-slate-200">{selectedRequest.title}</h3>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Notes for Residents</label>
                            <textarea name="commenceNotes" value={commenceNotes} onChange={(e) => setCommenceNotes(e.target.value)} rows={4} required placeholder="Enter details about the work schedule, potential disruptions, etc. This will be sent as a notification to all residents." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsCommenceModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Confirm & Notify Residents</button>
                        </div>
                    </form>
                )}
             </Modal>
        </div>
    );
};

export default AdminQuotationRequests;
