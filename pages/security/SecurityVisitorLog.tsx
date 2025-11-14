



import React, { useState, useMemo, useEffect, useRef } from 'react';
import { VISITORS, RESIDENTS } from '../../constants';
import type { Visitor } from '../../types';
import { PlusCircle, LogOut, Phone, History, Users, User, Car, Home, ChevronDown, Search, ClipboardList, QrCode, Camera, CheckCircle, AlertTriangle, Download, Edit } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';

declare const XLSX: any;

const SecurityVisitorLog: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>(VISITORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [visitorData, setVisitorData] = useState<Partial<Visitor>>({});

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<{ status: 'idle' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [confirmExitVisitorId, setConfirmExitVisitorId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const activeResidents = RESIDENTS.filter(r => r.status === 'Active');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVisitorData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setVisitorData({
      name: '',
      contact: '',
      vehicleNo: '',
      visitingFlat: '',
      purpose: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (visitor: Visitor) => {
    setModalMode('edit');
    setVisitorData({ ...visitor });
    setIsModalOpen(true);
  };

  const handleSaveVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.name?.trim() || !visitorData.visitingFlat?.trim() || !visitorData.contact?.trim()) {
      toast.error('Name, Contact, and Visiting Flat are required.');
      return;
    }

    if (modalMode === 'add') {
      const visitorToAdd: Visitor = {
        id: `vis-${Date.now()}`,
        name: visitorData.name.trim(),
        contact: visitorData.contact.trim(),
        vehicleNo: visitorData.vehicleNo?.trim() || 'N/A',
        visitingFlat: visitorData.visitingFlat.trim(),
        purpose: visitorData.purpose?.trim() || 'N/A',
        inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outTime: null,
        status: 'Inside',
      };
      setVisitors([visitorToAdd, ...visitors]);
      toast.success('Visitor entry logged successfully!');
    } else {
      setVisitors(visitors.map(v => (v.id === visitorData.id ? { ...v, ...visitorData } as Visitor : v)));
      toast.success('Visitor details updated successfully!');
    }

    setIsModalOpen(false);
  };

  const handleMarkExitClick = (visitorId: string) => {
    setConfirmExitVisitorId(visitorId);
  };

  const handleConfirmExit = () => {
    if (!confirmExitVisitorId) return;

    const visitorToUpdate = visitors.find(v => v.id === confirmExitVisitorId);
    
    setVisitors(visitors.map(v => 
        v.id === confirmExitVisitorId
        ? { ...v, status: 'Exited', outTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : v
    ));

    if (visitorToUpdate) {
        toast.success(`${visitorToUpdate.name} has been marked as exited.`);
    }
    setConfirmExitVisitorId(null);
  };

  const handleSimulateScanEntry = () => {
    setScanStatus({ status: 'success', message: 'Success!' });
    setTimeout(() => {
      setIsScannerOpen(false);
      handleOpenAddModal();
      toast.success("QR Scanned: Please confirm visitor details.");
    }, 1500);
  };

  const handleSimulateScanExit = () => {
    const visitorToExit = visitors.find(v => v.status === 'Inside');
    if (!visitorToExit) {
      setScanStatus({ status: 'error', message: 'Scan Failed' });
      setTimeout(() => {
        setIsScannerOpen(false);
        toast.error("No visitors are currently inside to mark for exit.");
      }, 2000);
      return;
    }
    
    setScanStatus({ status: 'success', message: 'Success!' });
    setTimeout(() => {
        setVisitors(visitors.map(v => 
            v.id === visitorToExit.id
            ? { ...v, status: 'Exited', outTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
            : v
        ));
        setIsScannerOpen(false);
        toast.success(`${visitorToExit.name} marked as exited via QR scan.`);
    }, 1500);
  };
  
  const visitorToConfirmExit = useMemo(() => {
    if (!confirmExitVisitorId) return null;
    return visitors.find(v => v.id === confirmExitVisitorId);
  }, [confirmExitVisitorId, visitors]);

  const filteredVisitors = useMemo(() => {
    let visitorsToFilter = showHistory ? visitors : visitors.filter(v => v.status === 'Inside');

    if (debouncedQuery) {
        visitorsToFilter = visitorsToFilter.filter(visitor =>
            visitor.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            visitor.contact.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            visitor.visitingFlat.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            visitor.vehicleNo.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (visitor.purpose && visitor.purpose.toLowerCase().includes(debouncedQuery.toLowerCase()))
        );
    }
    return visitorsToFilter;
  }, [visitors, showHistory, debouncedQuery]);

  const handleExportCSV = () => {
    if (filteredVisitors.length === 0) {
        toast.error("No data to export.");
        return;
    }
    const headers = ['ID', 'Name', 'Contact', 'Vehicle No', 'Visiting Flat', 'Purpose', 'In Time', 'Out Time', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredVisitors.map(v => [
            v.id,
            `"${v.name.replace(/"/g, '""')}"`,
            `"${v.contact}"`,
            `"${v.vehicleNo}"`,
            `"${v.visitingFlat}"`,
            `"${(v.purpose || 'N/A').replace(/"/g, '""')}"`,
            v.inTime,
            v.outTime || 'N/A',
            v.status
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `visitor_log_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
    toast.success("CSV export started.");
  };

  const handleExportXLSX = () => {
      if (typeof XLSX === 'undefined') {
          toast.error("Export library not loaded. Please refresh the page and try again.");
          console.error("SheetJS library (XLSX) not found on window object.");
          return;
      }
      if (filteredVisitors.length === 0) {
          toast.error("No data to export.");
          return;
      }

      const dataToExport = filteredVisitors.map(v => ({
          'ID': v.id,
          'Name': v.name,
          'Contact': v.contact,
          'Vehicle No': v.vehicleNo,
          'Visiting Flat': v.visitingFlat,
          'Purpose': v.purpose || 'N/A',
          'In Time': v.inTime,
          'Out Time': v.outTime || 'N/A',
          'Status': v.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Visitor Log");

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `visitor_log_${date}.xlsx`);
      setIsExportOpen(false);
      toast.success("XLSX export started.");
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Visitor Log</h1>
        <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-center gap-2 bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition duration-300">
                {showHistory ? <Users size={20} /> : <History size={20} />}
                {showHistory ? 'View Current' : 'View History'}
            </button>
            <div className="relative">
                <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-emerald-600 transition duration-300">
                    <Download size={20} /> Export
                </button>
                {isExportOpen && (
                    <div ref={exportRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-1 border border-slate-200 dark:border-slate-700 animate-fade-in-fast z-10">
                        <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200">As CSV</button>
                        <button onClick={handleExportXLSX} className="w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200">As XLSX</button>
                    </div>
                )}
            </div>
             <button onClick={() => { setScanStatus({ status: 'idle', message: '' }); setIsScannerOpen(true); }} className="flex items-center justify-center gap-2 bg-secondary text-white font-semibold py-2 px-4 rounded-full hover:bg-amber-600 transition duration-300">
                <QrCode size={20} />
                Scan QR
            </button>
            <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300">
                <PlusCircle size={20} />
                Log Visitor
            </button>
        </div>
      </div>

       <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <input
                type="text"
                placeholder="Search by name, contact, flat, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
                aria-label="Search visitors"
            />
        </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-slate-200 mb-4">
              {showHistory ? 'Full Visitor History' : 'Visitors Currently Inside'}
          </h2>
          {filteredVisitors.length > 0 ? (
              <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <tr>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Name</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Contact</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Visiting Flat</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Purpose</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Vehicle No.</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">In / Out Time</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
                      <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredVisitors.map(visitor => (
                      <tr key={visitor.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                          <td className="p-4 font-semibold text-text-primary dark:text-slate-200">{visitor.name}</td>
                          <td className="p-4 font-medium text-text-primary dark:text-slate-200">{visitor.contact}</td>
                          <td className="p-4 font-medium text-text-primary dark:text-slate-200">{visitor.visitingFlat}</td>
                          <td className="p-4 text-text-secondary dark:text-slate-400">{visitor.purpose || 'N/A'}</td>
                          <td className="p-4 font-mono text-text-primary dark:text-slate-200">{visitor.vehicleNo}</td>
                          <td className="p-4 text-text-secondary dark:text-slate-400">
                            <span className="font-medium text-text-primary dark:text-slate-300">{visitor.inTime}</span>
                            {' / '}
                            <span className="font-medium text-text-primary dark:text-slate-300">{visitor.outTime || '--'}</span>
                          </td>
                          <td className="p-4"><StatusBadge text={visitor.status} type={visitor.status === 'Inside' ? 'success' : 'neutral'} /></td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleOpenEditModal(visitor)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                    <Edit size={14} /> Edit
                                </button>
                                {visitor.status === 'Inside' && (
                                    <button onClick={() => handleMarkExitClick(visitor.id)} className="flex items-center gap-1 text-sm text-secondary hover:underline">
                                        <LogOut size={14} /> Mark Exit
                                    </button>
                                )}
                            </div>
                          </td>
                      </tr>
                      ))}
                  </tbody>
                  </table>
              </div>
              {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredVisitors.map(visitor => (
                      <div key={visitor.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                          <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-primary" />
                                  <p className="font-bold text-text-primary dark:text-slate-200">{visitor.name}</p>
                              </div>
                              <StatusBadge text={visitor.status} type={visitor.status === 'Inside' ? 'success' : 'neutral'} />
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-text-secondary dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                  <Home className="w-4 h-4" />
                                  <span>Visiting: <strong className="text-text-primary dark:text-slate-200">{visitor.visitingFlat}</strong></span>
                              </div>
                               <div className="flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4" />
                                  <span>Purpose: <strong className="text-text-primary dark:text-slate-200">{visitor.purpose || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>Contact: <strong className="text-text-primary dark:text-slate-200">{visitor.contact}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4" />
                                  <span>Vehicle: <strong className="font-mono text-text-primary dark:text-slate-200">{visitor.vehicleNo}</strong></span>
                              </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-text-secondary dark:text-slate-500">
                              <div>
                                  <p><strong>IN:</strong> {visitor.inTime}</p>
                                  <p><strong>OUT:</strong> {visitor.outTime || 'N/A'}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <button onClick={() => handleOpenEditModal(visitor)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold">
                                    <Edit size={14} /> Edit
                                </button>
                                {visitor.status === 'Inside' && (
                                    <button onClick={() => handleMarkExitClick(visitor.id)} className="flex items-center gap-1 text-sm text-secondary font-semibold">
                                        <LogOut size={14} /> Mark Exit
                                    </button>
                                )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              </>
          ) : (
              <div className="text-center py-12">
                  <p className="text-text-secondary dark:text-slate-400">
                      {searchQuery ? 'No visitors found matching your search.' : (showHistory ? 'No visitor history found.' : 'No visitors are currently inside.')}
                  </p>
              </div>
          )}
      </div>

      <Modal title="QR Code Scanner" isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
        <div className="flex flex-col items-center text-center">
            {scanStatus.status === 'idle' && (
                <>
                    <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                        <Camera size={64} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-text-secondary dark:text-slate-400 mb-6">Point the camera at a QR code to scan.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={handleSimulateScanEntry}
                            className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-full hover:bg-blue-600 transition"
                        >
                            Simulate Scan for Entry
                        </button>
                        <button
                            onClick={handleSimulateScanExit}
                            className="w-full bg-red-500 text-white font-semibold py-3 px-4 rounded-full hover:bg-red-600 transition"
                        >
                            Simulate Scan for Exit
                        </button>
                    </div>
                </>
            )}
            {scanStatus.status === 'success' && (
                <div className="flex flex-col items-center justify-center min-h-[250px] animate-fade-in-fast">
                    <CheckCircle size={64} className="text-emerald-500 mb-4" />
                    <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{scanStatus.message}</p>
                </div>
            )}
            {scanStatus.status === 'error' && (
                <div className="flex flex-col items-center justify-center min-h-[250px] animate-fade-in-fast">
                    <AlertTriangle size={64} className="text-red-500 mb-4" />
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400">{scanStatus.message}</p>
                </div>
            )}
        </div>
      </Modal>

      <Modal title={modalMode === 'add' ? 'Log New Visitor' : 'Edit Visitor Details'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSaveVisitor}>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Visitor Name</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input type="text" name="name" value={visitorData.name || ''} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g. John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Contact Number</label>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input type="tel" name="contact" value={visitorData.contact || ''} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g. 9876543210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Vehicle Number (Optional)</label>
            <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input type="text" name="vehicleNo" value={visitorData.vehicleNo || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g. MH12AB1234"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Visiting Flat</label>
             <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                <select name="visitingFlat" value={visitorData.visitingFlat || ''} onChange={handleInputChange} required className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 appearance-none">
                    <option value="" disabled>Select resident flat</option>
                    {activeResidents.map(resident => (
                        <option key={resident.id} value={`${resident.wing}-${resident.flatNo}`}>
                            {`${resident.wing}-${resident.flatNo}`} ({resident.name})
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Purpose of Visit (Optional)</label>
            <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <input type="text" name="purpose" value={visitorData.purpose || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" placeholder="e.g. Delivery, Meeting"/>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                {modalMode === 'add' ? 'Log Entry' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Confirm Visitor Exit"
        isOpen={!!confirmExitVisitorId}
        onClose={() => setConfirmExitVisitorId(null)}
      >
        {visitorToConfirmExit && (
            <div className="text-center">
                <p className="text-text-secondary dark:text-slate-400 mb-6">
                    Are you sure you want to mark <strong className="text-text-primary dark:text-slate-200">{visitorToConfirmExit.name}</strong> (Visiting: {visitorToConfirmExit.visitingFlat}, Vehicle: {visitorToConfirmExit.vehicleNo}) as exited?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setConfirmExitVisitorId(null)}
                        className="bg-slate-200 text-text-primary font-semibold py-2 px-6 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmExit}
                        className="bg-primary text-white font-semibold py-2 px-6 rounded-full hover:bg-indigo-700 transition"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default SecurityVisitorLog;