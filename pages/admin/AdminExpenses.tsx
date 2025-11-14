import React, { useState, useMemo, useRef, useEffect } from 'react';
import { EXPENSES } from '../../constants';
import type { Expense, ExpenseCategory, ExpenseStatus } from '../../types';
import KPICard from '../../components/KPICard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { PlusCircle, WalletCards, AlertTriangle, ListChecks, Download, User, Calendar, Tag, Info, FileText, Search, Check, X, ChevronDown, UploadCloud, ListFilter, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

declare const XLSX: any;

const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ExpenseCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ExpenseStatus>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject' | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [isBulkConfirmModalOpen, setIsBulkConfirmModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'delete' | null>(null);


  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Miscellaneous' as ExpenseCategory,
    payee: '',
    amount: '',
    description: '',
    receiptFile: null as File | null,
  });

  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const gridStroke = theme === 'dark' ? '#334155' : '#e2e8f0';

  const expenseCategories: ExpenseCategory[] = ['Maintenance', 'Utilities', 'Staff Salary', 'Event', 'Miscellaneous'];
  const expenseStatuses: ExpenseStatus[] = ['Paid', 'Pending Approval', 'Rejected'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0); // Normalize to start of day

        const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || expense.status === statusFilter;
        
        const matchesStartDate = !startDate || expenseDate >= new Date(new Date(startDate).setHours(0,0,0,0));
        const matchesEndDate = !endDate || expenseDate <= new Date(new Date(endDate).setHours(0,0,0,0));
        
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) {
            return matchesCategory && matchesStatus && matchesStartDate && matchesEndDate;
        }

        const matchesSearch =
            expense.payee.toLowerCase().includes(lowercasedQuery) ||
            expense.description.toLowerCase().includes(lowercasedQuery) ||
            expense.category.toLowerCase().includes(lowercasedQuery);

        return matchesCategory && matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [expenses, searchQuery, categoryFilter, statusFilter, startDate, endDate]);


  const expenseSummary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const summary = {
      totalThisMonth: 0,
      pendingApprovalAmount: 0,
    };
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        summary.totalThisMonth += expense.amount;
      }
      if (expense.status === 'Pending Approval') {
        summary.pendingApprovalAmount += expense.amount;
      }
    });

    return summary;
  }, [expenses]);
  
  const monthlyExpenseData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthData: { [key: number]: number } = {};

    filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getFullYear() === currentYear) {
            const month = expenseDate.getMonth();
            monthData[month] = (monthData[month] || 0) + expense.amount;
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((name, index) => ({
        name,
        Expense: monthData[index] || 0,
    }));
  }, [filteredExpenses]);

  const getStatusType = (status: ExpenseStatus) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending Approval': return 'warning';
      case 'Rejected': return 'error';
    }
  };
  
  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.payee.trim() || !newExpense.description.trim() || isNaN(amount) || amount <= 0) {
      toast.error('Please fill all fields with valid data.');
      return;
    }

    const expenseToAdd: Expense = {
      id: `exp-${Date.now()}`,
      date: newExpense.date,
      category: newExpense.category,
      payee: newExpense.payee.trim(),
      amount: amount,
      status: 'Pending Approval',
      description: newExpense.description.trim(),
      receipt: newExpense.receiptFile?.name,
    };
    
    setExpenses([expenseToAdd, ...expenses]);
    setIsModalOpen(false);
    setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Miscellaneous',
        payee: '',
        amount: '',
        description: '',
        receiptFile: null,
    });
    toast.success('Expense logged for approval.');
  };

  const handleConfirmStatusChange = () => {
    if (!selectedExpense || !confirmationAction) return;

    const newStatus = confirmationAction === 'approve' ? 'Paid' : 'Rejected';
    
    setExpenses(expenses.map(exp => 
      exp.id === selectedExpense.id ? { ...exp, status: newStatus } : exp
    ));

    toast.success(`Expense status updated to "${newStatus}".`);

    setIsConfirmModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedExpense(null);
    setConfirmationAction(null);
  };

  const handleViewReceipt = (expense?: Expense | null) => {
    if (!expense || !expense.receipt) return;
    toast.success(`Opening receipt: ${expense.receipt}`);
    // In a real app, this would be a link to the stored file
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
        const file = files[0];
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a PDF, JPG, or PNG.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File is too large. Maximum size is 5MB.');
            return;
        }
        setNewExpense(prev => ({ ...prev, receiptFile: file }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
      } else if (e.type === "dragleave") {
          setDragActive(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileChange(e.dataTransfer.files);
      }
  };

  const handleRemoveFile = () => {
      setNewExpense(prev => ({ ...prev, receiptFile: null }));
      if(fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
      }
  };


  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
        toast.error("No expense data to export.");
        return;
    }

    const headers = ['ID', 'Date', 'Category', 'Payee', 'Amount', 'Status', 'Description', 'Receipt'];
    
    const formatCSVField = (field: any) => {
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
        headers.join(','),
        ...filteredExpenses.map(exp => [
            exp.id,
            exp.date,
            exp.category,
            formatCSVField(exp.payee),
            exp.amount,
            exp.status,
            formatCSVField(exp.description),
            exp.receipt || '',
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `expenses_log_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("CSV export started.");
  };
  
  const handleExportXLSX = () => {
      if (typeof XLSX === 'undefined') {
          toast.error("Export library not loaded. Please try again.");
          return;
      }
      if (filteredExpenses.length === 0) {
          toast.error("No expense data to export.");
          return;
      }

      const dataToExport = filteredExpenses.map(exp => ({
          'ID': exp.id,
          'Date': exp.date,
          'Category': exp.category,
          'Payee': exp.payee,
          'Amount': exp.amount,
          'Status': exp.status,
          'Description': exp.description,
          'Receipt': exp.receipt || 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `expenses_log_${date}.xlsx`);
      setIsExportOpen(false);
      toast.success("XLSX export started.");
  };

  const handleSelect = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedExpenses(filteredExpenses.map(exp => exp.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleOpenBulkConfirm = (action: 'approve' | 'reject' | 'delete') => {
      if (selectedExpenses.length === 0) {
        toast.error("Please select at least one expense.");
        return;
      }
      setBulkAction(action);
      setIsBulkConfirmModalOpen(true);
  };

  const handleConfirmBulkAction = () => {
      if (!bulkAction) return;

      let updatedExpenses = [...expenses];
      const selectedCount = selectedExpenses.length;

      switch (bulkAction) {
          case 'approve':
              updatedExpenses = expenses.map(exp => 
                  selectedExpenses.includes(exp.id) && exp.status === 'Pending Approval' ? { ...exp, status: 'Paid' } : exp
              );
              toast.success(`${selectedCount} expense(s) approved.`);
              break;
          case 'reject':
              updatedExpenses = expenses.map(exp => 
                  selectedExpenses.includes(exp.id) && exp.status === 'Pending Approval' ? { ...exp, status: 'Rejected' } : exp
              );
              toast.success(`${selectedCount} expense(s) rejected.`);
              break;
          case 'delete':
              updatedExpenses = expenses.filter(exp => !selectedExpenses.includes(exp.id));
              toast.success(`${selectedCount} expense(s) deleted.`);
              break;
      }
      setExpenses(updatedExpenses);
      setSelectedExpenses([]);
      setBulkAction(null);
      setIsBulkConfirmModalOpen(false);
  };


  return (
    <div className="space-y-6 pb-20"> {/* Padding bottom for floating bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Expense Management</h1>
        <div className="flex items-center gap-2">
             <div className="relative" ref={exportRef}>
                <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-emerald-600 transition duration-300">
                    <Download size={20} /> Export
                </button>
                {isExportOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in-fast z-10">
                        <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200">As CSV</button>
                        <button onClick={handleExportXLSX} className="w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200">As XLSX</button>
                    </div>
                )}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
              <PlusCircle size={20} />
              Log New Expense
            </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[250px] sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
                type="text"
                placeholder="Search by payee, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
                aria-label="Search expenses"
            />
        </div>
        <div className="relative w-full sm:w-auto">
             <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'All' | ExpenseCategory)}
                className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
                aria-label="Filter by category"
            >
                <option value="All">All Categories</option>
                {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
         <div className="relative w-full sm:w-auto">
             <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | ExpenseStatus)}
                className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
                aria-label="Filter by status"
            >
                <option value="All">All Statuses</option>
                {expenseStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" aria-label="Start date" />
            <span className="text-text-secondary dark:text-slate-400">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" aria-label="End date" />
        </div>
        {(startDate || endDate) && (
          <button onClick={() => {setStartDate(''); setEndDate('');}} className="flex items-center justify-center gap-1 text-sm text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white transition">
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard title="Total Expenses (This Month)" value={`₹${expenseSummary.totalThisMonth.toLocaleString()}`} icon={WalletCards} color="#6366f1" />
        <KPICard title="Pending Approval" value={`₹${expenseSummary.pendingApprovalAmount.toLocaleString()}`} icon={AlertTriangle} color="#f59e0b" />
        <KPICard title="Items Logged" value={filteredExpenses.length} icon={ListChecks} color="#10b981" />
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80">
        <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">Monthly Expense Trend (₹)</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: textColor }} tickLine={{ stroke: textColor }} />
                <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: textColor }} tickLine={{ stroke: textColor }} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip cursor={{fill: 'rgba(239, 68, 68, 0.1)'}} contentStyle={{ borderRadius: '0.5rem', border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg }} formatter={(value: number) => [`₹${value.toLocaleString()}`, "Expense"]} />
                <Legend wrapperStyle={{fontSize: "14px"}}/>
                <Bar dataKey="Expense" fill="#ef4444" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="p-4 w-4">
                  <input 
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary"
                    checked={filteredExpenses.length > 0 && selectedExpenses.length === filteredExpenses.length}
                    onChange={handleSelectAll}
                    aria-label="Select all expenses"
                  />
                </th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Date</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Category</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Payee</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Amount</th>
                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                    <td className="p-4 w-4">
                      <input 
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={() => handleSelect(expense.id)}
                        onClick={(e) => e.stopPropagation()} 
                        aria-label={`Select expense ${expense.payee}`}
                      />
                    </td>
                    <td onClick={() => handleViewDetails(expense)} className="p-4 text-text-secondary dark:text-slate-400 cursor-pointer">{expense.date}</td>
                    <td onClick={() => handleViewDetails(expense)} className="p-4 text-text-primary dark:text-slate-200 cursor-pointer">{expense.category}</td>
                    <td onClick={() => handleViewDetails(expense)} className="p-4 text-text-primary dark:text-slate-200 cursor-pointer">{expense.payee}</td>
                    <td onClick={() => handleViewDetails(expense)} className="p-4 text-text-secondary dark:text-slate-400 cursor-pointer">₹{expense.amount.toLocaleString()}</td>
                    <td onClick={() => handleViewDetails(expense)} className="p-4 cursor-pointer"><StatusBadge text={expense.status} type={getStatusType(expense.status)} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={6} className="text-center py-12 text-text-secondary dark:text-slate-400">
                        No expenses found matching your criteria.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         <div className="md:hidden">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                  <div key={expense.id} className="p-4 border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <div className="flex justify-between items-start">
                          <div onClick={() => handleViewDetails(expense)} className="flex-grow cursor-pointer">
                              <p className="font-bold text-text-primary dark:text-slate-200">{expense.payee}</p>
                              <p className="text-sm text-text-secondary dark:text-slate-400">{expense.category} - {expense.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge text={expense.status} type={getStatusType(expense.status)} />
                            <input 
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-primary"
                              checked={selectedExpenses.includes(expense.id)}
                              onChange={() => handleSelect(expense.id)}
                              aria-label={`Select expense ${expense.payee}`}
                            />
                          </div>
                      </div>
                      <div onClick={() => handleViewDetails(expense)} className="flex justify-between items-center mt-3 cursor-pointer">
                          <p className="text-lg font-semibold text-primary dark:text-indigo-400">₹{expense.amount.toLocaleString()}</p>
                          <p className="text-xs text-text-secondary dark:text-slate-500 max-w-[60%] truncate" title={expense.description}>{expense.description}</p>
                      </div>
                  </div>
              ))
            ) : (
                <div className="text-center py-12 text-text-secondary dark:text-slate-400 p-4">
                    No expenses found matching your criteria.
                </div>
            )}
        </div>
      </div>

      {selectedExpenses.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-20 lg:left-64 right-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20 animate-fade-in-fast flex items-center justify-between transition-all duration-300">
          <p className="font-semibold text-text-primary dark:text-slate-200">{selectedExpenses.length} selected</p>
          <div className="flex items-center gap-2">
            <button onClick={() => handleOpenBulkConfirm('approve')} className="flex items-center gap-1.5 text-sm bg-emerald-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-emerald-600 transition">
              <Check size={16} /> Approve
            </button>
            <button onClick={() => handleOpenBulkConfirm('reject')} className="flex items-center gap-1.5 text-sm bg-amber-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-amber-600 transition">
              <X size={16} /> Reject
            </button>
            <button onClick={() => handleOpenBulkConfirm('delete')} className="flex items-center gap-1.5 text-sm bg-red-500 text-white font-semibold py-2 px-3 rounded-full hover:bg-red-600 transition">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      <Modal title="Log New Expense" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleLogExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Date</label>
              <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Amount (₹)</label>
                <input type="number" name="amount" value={newExpense.amount} onChange={handleInputChange} placeholder="e.g. 5000" required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
          </div>
           <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Category</label>
              <select name="category" value={newExpense.category} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                <option>Maintenance</option>
                <option>Utilities</option>
                <option>Staff Salary</option>
                <option>Event</option>
                <option>Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Vendor / Payee</label>
              <input type="text" name="payee" value={newExpense.payee} onChange={handleInputChange} placeholder="e.g. City Power Ltd." required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Description / Bill #</label>
              <textarea name="description" value={newExpense.description} onChange={handleInputChange} rows={2} placeholder="e.g., Monthly electricity bill" required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Upload Receipt (Optional)</label>
              <input 
                ref={fileInputRef}
                type="file" 
                id="receipt-upload" 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              {newExpense.receiptFile ? (
                <div className="mt-1 flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-700 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={20} className="text-primary flex-shrink-0" />
                    <span className="text-sm text-text-primary dark:text-slate-200 truncate">{newExpense.receiptFile.name}</span>
                  </div>
                  <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="receipt-upload" 
                  onDragEnter={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDragOver={handleDrag} 
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-text-secondary dark:text-slate-400">
                      <p className="pl-1">Click to upload or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PDF, PNG, JPG up to 5MB</p>
                  </div>
                </label>
              )}
            </div>
           <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">Log Expense</button>
          </div>
        </form>
      </Modal>
      
      <Modal title="Expense Details" isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        {selectedExpense && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm text-text-secondary dark:text-slate-400">Amount</p>
              <p className="text-4xl font-bold text-primary dark:text-indigo-400">₹{selectedExpense.amount.toLocaleString()}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                    <User size={16} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-text-secondary dark:text-slate-400">Payee</p>
                        <p className="font-semibold text-text-primary dark:text-slate-200">{selectedExpense.payee}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-text-secondary dark:text-slate-400">Date</p>
                        <p className="font-semibold text-text-primary dark:text-slate-200">{selectedExpense.date}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Tag size={16} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-text-secondary dark:text-slate-400">Category</p>
                        <p className="font-semibold text-text-primary dark:text-slate-200">{selectedExpense.category}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Info size={16} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-text-secondary dark:text-slate-400">Status</p>
                        <StatusBadge text={selectedExpense.status} type={getStatusType(selectedExpense.status)} />
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                 <div className="flex items-start gap-3">
                    <FileText size={16} className="text-slate-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-text-secondary dark:text-slate-400">Description</p>
                        <p className="text-sm font-medium text-text-primary dark:text-slate-200 whitespace-pre-wrap">{selectedExpense.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 gap-2 flex-wrap">
              {selectedExpense.receipt && (
                <button
                  type="button"
                  onClick={() => handleViewReceipt(selectedExpense)}
                  className="flex items-center gap-2 bg-slate-100 text-text-primary dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  <FileText size={16} /> View Receipt
                </button>
              )}
              {selectedExpense.status === 'Pending Approval' && (
                  <>
                      <button
                          type="button"
                          onClick={() => {
                              setConfirmationAction('reject');
                              setIsConfirmModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition"
                      >
                          <X size={16} /> Reject
                      </button>
                      <button
                          type="button"
                          onClick={() => {
                              setConfirmationAction('approve');
                              setIsConfirmModalOpen(true);
                          }}
                          className="flex items-center gap-2 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-emerald-600 transition"
                      >
                          <Check size={16} /> Approve
                      </button>
                  </>
              )}
              <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">
                  Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        title={confirmationAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'} 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)}
      >
        {selectedExpense && confirmationAction && (
          <div>
            <p className="text-text-secondary dark:text-slate-400 mb-6">
              Are you sure you want to {confirmationAction} this expense of <strong className="text-text-primary dark:text-slate-200">₹{selectedExpense.amount.toLocaleString()}</strong> for <strong className="text-text-primary dark:text-slate-200">{selectedExpense.payee}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`${
                  confirmationAction === 'approve' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-red-500 hover:bg-red-600'
                } text-white font-semibold py-2 px-4 rounded-full transition`}
              >
                {confirmationAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        title={`Confirm Bulk ${bulkAction ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1) : ''}`}
        isOpen={isBulkConfirmModalOpen} 
        onClose={() => setIsBulkConfirmModalOpen(false)}
      >
        {bulkAction && (
          <div>
            <p className="text-text-secondary dark:text-slate-400 mb-6">
              Are you sure you want to {bulkAction} {selectedExpenses.length} selected expense(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkConfirmModalOpen(false)}
                className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkAction}
                className={`
                  ${bulkAction === 'approve' && 'bg-emerald-500 hover:bg-emerald-600'}
                  ${bulkAction === 'reject' && 'bg-amber-500 hover:bg-amber-600'}
                  ${bulkAction === 'delete' && 'bg-red-500 hover:bg-red-600'}
                   text-white font-semibold py-2 px-4 rounded-full transition`}
              >
                Confirm {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminExpenses;
