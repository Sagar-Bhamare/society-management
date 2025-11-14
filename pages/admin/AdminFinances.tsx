
import React, { useState, useMemo } from 'react';
import { INVOICES, PAYMENTS, RESIDENTS, MAINTENANCE_CONFIG } from '../../constants';
import type { Invoice, Payment, MaintenanceConfig } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { PlusCircle, Send, DollarSign, CheckCircle, AlertTriangle, Wallet, Settings, Check, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import KPICard from '../../components/KPICard';
import Modal from '../../components/Modal';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import LazyImage from '../../components/Image';

const AdminFinances: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ residentName: '', amount: '', dueDate: '' });
  const { theme } = useTheme();

  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(MAINTENANCE_CONFIG);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  const getStatusType = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      case 'Pending Verification': return 'info';
    }
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Reminder sent to ${invoice.residentName} for invoice ${invoice.invoiceNumber}.`);
  };

  const financialSummary = useMemo(() => {
    const summary = {
      paid: 0,
      pending: 0,
      overdue: 0,
      totalPaidAmount: 0,
      totalPendingAmount: 0,
      totalOverdueAmount: 0,
    };

    invoices.forEach(invoice => {
      if (invoice.status === 'Paid') {
        summary.paid++;
        summary.totalPaidAmount += invoice.amount;
      } else if (invoice.status === 'Pending') {
        summary.pending++;
        summary.totalPendingAmount += invoice.amount;
      } else if (invoice.status === 'Overdue') {
        summary.overdue++;
        summary.totalOverdueAmount += invoice.amount + (invoice.fine || 0);
      }
    });
    return summary;
  }, [invoices]);

  const invoiceStatusData = [
    { name: 'Paid', value: financialSummary.paid },
    { name: 'Pending', value: financialSummary.pending },
    { name: 'Overdue', value: financialSummary.overdue },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvoice(prev => ({...prev, [name]: value}));
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaintenanceConfig(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSaveConfig = () => {
    toast.success("Maintenance settings saved!");
  };

  const handleVerification = (invoiceId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'Paid' : 'Pending';
    setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
    toast.success(`Payment has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.residentName || !newInvoice.amount || !newInvoice.dueDate) {
        toast.error('Please fill all fields.');
        return;
    }
    const amount = parseFloat(newInvoice.amount);
    if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount.');
        return;
    }
    
    const invoiceToAdd: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV${Math.floor(1000 + Math.random() * 9000)}`,
        residentName: newInvoice.residentName,
        amount: amount,
        dueDate: newInvoice.dueDate,
        status: 'Pending',
    };
    
    setInvoices([invoiceToAdd, ...invoices]);
    setIsInvoiceModalOpen(false);
    setNewInvoice({ residentName: '', amount: '', dueDate: ''});
    toast.success('Invoice generated successfully!');
  };


  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  const renderOverview = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard title="Total Collected" value={`₹${financialSummary.totalPaidAmount.toLocaleString()}`} icon={CheckCircle} color="#10b981" />
        <KPICard title="Pending Amount" value={`₹${financialSummary.totalPendingAmount.toLocaleString()}`} icon={DollarSign} color="#f59e0b" />
        <KPICard title="Overdue Amount" value={`₹${financialSummary.totalOverdueAmount.toLocaleString()}`} icon={AlertTriangle} color="#ef4444" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
            <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Recent Payments</h2>
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {PAYMENTS.slice(0, 5).map(payment => (
                  <li key={payment.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text-primary dark:text-slate-200">{payment.residentName}</p>
                      <p className="text-sm text-text-secondary dark:text-slate-400">Paid via {payment.paymentMethod} on {payment.paymentDate}</p>
                    </div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">+₹{payment.amount.toLocaleString()}</p>
                  </li>
                ))}
            </ul>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
          <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Invoice Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={invoiceStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {invoiceStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "14px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
  
  const renderPaymentVerifications = () => {
    const pendingVerificationInvoices = invoices.filter(inv => inv.status === 'Pending Verification');
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Resident</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Invoice #</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Amount</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Screenshot</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingVerificationInvoices.length > 0 ? pendingVerificationInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                  <td className="p-4 text-text-primary dark:text-slate-200">{invoice.residentName}</td>
                  <td className="p-4 font-medium text-primary">{invoice.invoiceNumber}</td>
                  <td className="p-4 text-text-secondary dark:text-slate-400">₹{(invoice.amount + (invoice.fine || 0)).toLocaleString()}</td>
                  <td className="p-4">
                    <button onClick={() => { setScreenshotUrl(invoice.paymentScreenshot!); setIsScreenshotModalOpen(true); }} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <ImageIcon size={14} /> View
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleVerification(invoice.id, 'approve')} className="p-2 rounded-full text-emerald-600 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900"><Check size={16} /></button>
                        <button onClick={() => handleVerification(invoice.id, 'reject')} className="p-2 rounded-full text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center py-12 text-text-secondary dark:text-slate-400">No pending payment verifications.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMaintenanceSettings = () => (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-6">
      <div className="max-w-md space-y-4">
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Monthly Maintenance Amount (₹)</label>
            <input type="number" name="monthlyAmount" value={maintenanceConfig.monthlyAmount} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
        </div>
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Due Date (Day of Month)</label>
            <input type="number" name="dueDateDay" value={maintenanceConfig.dueDateDay} onChange={handleConfigChange} min="1" max="28" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
        </div>
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Late Fee (₹)</label>
            <input type="number" name="lateFee" value={maintenanceConfig.lateFee} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
        </div>
        <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Apply Late Fee After (Day of Month)</label>
            <input type="number" name="lateFeeAfterDay" value={maintenanceConfig.lateFeeAfterDay} onChange={handleConfigChange} min="1" max="28" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
        </div>
        <div className="pt-2">
            <button onClick={handleSaveConfig} className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Save Settings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Financial Management</h1>
        <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
          <PlusCircle size={20} />
          Generate New Invoice
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['Overview', 'Invoices', 'Payment Verifications', 'Maintenance Settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Overview' && renderOverview()}
      {activeTab === 'Payment Verifications' && renderPaymentVerifications()}
      {activeTab === 'Maintenance Settings' && renderMaintenanceSettings()}

      {activeTab === 'Invoices' && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Invoice #</th>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Resident</th>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Amount</th>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Due Date</th>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
                        <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.id} className="border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                        <td className="p-4 font-medium text-primary">{invoice.invoiceNumber}</td>
                        <td className="p-4 text-text-primary dark:text-slate-200">{invoice.residentName}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-400">₹{invoice.amount.toLocaleString()}</td>
                        <td className="p-4 text-text-secondary dark:text-slate-400">{invoice.dueDate}</td>
                        <td className="p-4">
                            <StatusBadge text={invoice.status} type={getStatusType(invoice.status)} />
                        </td>
                        <td className="p-4">
                            {invoice.status !== 'Paid' && invoice.status !== 'Pending Verification' && (
                                <button onClick={() => handleSendReminder(invoice)} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                <Send size={14} /> Send Reminder
                                </button>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
      
      {activeTab === 'Payment History' && ( /* Kept for potential future use, though not in this tab set */
         <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Resident Name</th>
                  <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Invoice #</th>
                  <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Amount Paid</th>
                  <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Payment Date</th>
                  <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENTS.map((payment: Payment) => (
                  <tr key={payment.id} className="border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                    <td className="p-4 text-text-primary dark:text-slate-200">{payment.residentName}</td>
                    <td className="p-4 font-medium text-primary">{payment.invoiceNumber}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">₹{payment.amount.toLocaleString()}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{payment.paymentDate}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{payment.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal title="Generate New Invoice" isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)}>
        <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Select Resident</label>
                <select name="residentName" value={newInvoice.residentName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                    <option value="" disabled>-- Select a resident --</option>
                    {RESIDENTS.filter(r => r.status === 'Active').map(resident => (
                        <option key={resident.id} value={resident.name}>{resident.name} ({resident.flatNo})</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Amount (₹)</label>
                <input type="number" name="amount" value={newInvoice.amount} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g. 5000" />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Due Date</label>
                <input type="date" name="dueDate" value={newInvoice.dueDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Generate Invoice</button>
            </div>
        </form>
      </Modal>

       <Modal title="Payment Screenshot" isOpen={isScreenshotModalOpen} onClose={() => setIsScreenshotModalOpen(false)}>
         <LazyImage src={screenshotUrl} alt="Payment Screenshot" className="w-full h-auto rounded-lg" />
       </Modal>

    </div>
  );
};

export default AdminFinances;
