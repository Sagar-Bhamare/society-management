
import React, { useState, useMemo } from 'react';
import { INVOICES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { CreditCard, QrCode, Upload, Download } from 'lucide-react';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';

const ResidentFinances: React.FC = () => {
    const { user } = useAuth();

    const [myInvoices, setMyInvoices] = useState<Invoice[]>(INVOICES.filter(i => i.residentName.includes(user?.name || '')));
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState(1); // 1: confirmation, 2: QR & upload
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

    const getStatusType = (status: Invoice['status']) => {
        switch (status) {
        case 'Paid': return 'success';
        case 'Pending': return 'warning';
        case 'Overdue': return 'error';
        case 'Pending Verification': return 'info';
        }
    };
    
    const handleToggleInvoiceSelection = (invoiceId: string) => {
        setSelectedInvoiceIds(prev =>
            prev.includes(invoiceId)
                ? prev.filter(id => id !== invoiceId)
                : [...prev, invoiceId]
        );
    };

    const selectedInvoices = useMemo(() => 
        myInvoices.filter(inv => selectedInvoiceIds.includes(inv.id)),
        [myInvoices, selectedInvoiceIds]
    );

    const totalAmountToPay = useMemo(() =>
        selectedInvoices.reduce((total, inv) => total + inv.amount + (inv.fine || 0), 0),
        [selectedInvoices]
    );
    
    const handlePayClick = () => {
        if (selectedInvoices.length === 0) {
            toast.error("Please select at least one invoice to pay.");
            return;
        }
        setPaymentStep(1);
        setPaymentScreenshot(null);
        setIsPayModalOpen(true);
    };

    const handleSubmitForVerification = () => {
        if (!paymentScreenshot) {
            toast.error("Please upload a payment screenshot.");
            return;
        }
        
        setMyInvoices(currentInvoices =>
            currentInvoices.map(inv =>
                selectedInvoiceIds.includes(inv.id) 
                    ? { ...inv, status: 'Pending Verification', paymentScreenshot: URL.createObjectURL(paymentScreenshot) } 
                    : inv
            )
        );

        setIsPayModalOpen(false);
        setSelectedInvoiceIds([]);
        toast.success(`Payment submitted for verification!`);
    };

    const handleDownloadReceipt = (invoice: Invoice) => {
        const receiptContent = `
            <html>
                <head>
                    <title>Maintenance Receipt - ${invoice.invoiceNumber}</title>
                    <style>
                        body { font-family: sans-serif; margin: 40px; }
                        .container { border: 1px solid #ccc; padding: 20px; width: 600px; margin: auto; }
                        h1 { text-align: center; color: #6366f1; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>AuraLiva Society</h1>
                        <h2>Maintenance Payment Receipt</h2>
                        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                        <p><strong>Resident Name:</strong> ${invoice.residentName}</p>
                        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <table>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                            <tr>
                                <td>Maintenance for Invoice ${invoice.invoiceNumber}</td>
                                <td>₹${invoice.amount.toLocaleString()}</td>
                            </tr>
                            ${invoice.fine ? `<tr><td>Late Fee</td><td>₹${invoice.fine.toLocaleString()}</td></tr>` : ''}
                            <tr class="total">
                                <td>Total Paid</td>
                                <td>₹${(invoice.amount + (invoice.fine || 0)).toLocaleString()}</td>
                            </tr>
                        </table>
                        <p style="text-align: center; margin-top: 30px; font-style: italic;">This is a computer-generated receipt.</p>
                    </div>
                </body>
            </html>
        `;
        const receiptWindow = window.open('', '_blank');
        receiptWindow?.document.write(receiptContent);
        receiptWindow?.document.close();
        receiptWindow?.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">My Bills & Payments</h1>
                <button onClick={handlePayClick} disabled={selectedInvoiceIds.length === 0} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                    <CreditCard size={18} /> Pay Selected ({selectedInvoiceIds.length})
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="p-4 w-4"></th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Invoice #</th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Amount</th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Fine</th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Due Date</th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
                            <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {myInvoices.map(invoice => {
                            const isPayable = invoice.status === 'Pending' || invoice.status === 'Overdue';
                            return (
                                <tr key={invoice.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                                <td className="p-4">
                                    {isPayable && (
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary"
                                            checked={selectedInvoiceIds.includes(invoice.id)}
                                            onChange={() => handleToggleInvoiceSelection(invoice.id)}
                                        />
                                    )}
                                </td>
                                <td className="p-4 font-medium text-primary">{invoice.invoiceNumber}</td>
                                <td className="p-4 text-text-secondary dark:text-slate-400">₹{invoice.amount.toLocaleString()}</td>
                                <td className="p-4 text-red-600 dark:text-red-400">{invoice.fine ? `₹${invoice.fine.toLocaleString()}` : '-'}</td>
                                <td className="p-4 text-text-secondary dark:text-slate-400">{invoice.dueDate}</td>
                                <td className="p-4">
                                    <StatusBadge text={invoice.status} type={getStatusType(invoice.status)} />
                                </td>
                                <td className="p-4">
                                    {invoice.status === 'Paid' && (
                                        <button onClick={() => handleDownloadReceipt(invoice)} className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                                            <Download size={14} /> Receipt
                                        </button>
                                    )}
                                </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal title="Confirm and Pay" isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)}>
                {paymentStep === 1 && (
                     <div>
                        <p className="text-sm text-text-secondary dark:text-slate-400">You are about to pay for {selectedInvoices.length} invoice(s).</p>
                        <ul className="my-4 space-y-2 text-sm">
                            {selectedInvoices.map(inv => (
                                <li key={inv.id} className="flex justify-between items-center">
                                    <span>{inv.invoiceNumber} (Due: {inv.dueDate})</span>
                                    <span className="font-semibold">₹{(inv.amount + (inv.fine || 0)).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                             <p className="text-xl font-bold text-text-primary dark:text-slate-200">Total: ₹{totalAmountToPay.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-6">
                            <button type="button" onClick={() => setIsPayModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
                            <button onClick={() => setPaymentStep(2)} type="button" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                                <QrCode size={16} /> Proceed to Pay
                            </button>
                        </div>
                     </div>
                )}
                {paymentStep === 2 && (
                    <div className="space-y-4 text-center">
                        <h3 className="font-semibold">Scan to Pay ₹{totalAmountToPay.toLocaleString()}</h3>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=society@payment" alt="GPay QR Code" className="mx-auto rounded-lg border-4 border-slate-200 dark:border-slate-600" />
                        <p className="text-sm text-text-secondary dark:text-slate-400">After payment, please upload a screenshot of the confirmation page.</p>
                        <div>
                            <label htmlFor="screenshot-upload" className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-text-primary dark:text-slate-200 font-semibold py-2 px-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer">
                                <Upload size={16} /> {paymentScreenshot ? "Change Screenshot" : "Upload Screenshot"}
                            </label>
                            <input id="screenshot-upload" type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files ? e.target.files[0] : null)} className="hidden"/>
                            {paymentScreenshot && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{paymentScreenshot.name} selected.</p>}
                        </div>
                         <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setPaymentStep(1)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Back</button>
                            <button onClick={handleSubmitForVerification} disabled={!paymentScreenshot} type="button" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition disabled:bg-slate-400 dark:disabled:bg-slate-600">Submit for Verification</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ResidentFinances;
