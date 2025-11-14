
import React, { useState, useMemo } from 'react';
import { RESIDENTS } from '../../constants';
import type { Tenant } from '../../types';
import { Search, Eye, User, Phone, Calendar, FileText, Camera, ShieldCheck, VenetianMask, Banknote, Building } from 'lucide-react';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';

interface TenantDetails extends Tenant {
  ownerName: string;
  flatNo: string;
  wing: string;
}

const AdminTenants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDetails | null>(null);

  const allTenants = useMemo<TenantDetails[]>(() => 
    RESIDENTS
      .filter(r => r.tenant)
      .map(r => ({ 
        ...(r.tenant!), 
        ownerName: r.name, 
        flatNo: r.flatNo, 
        wing: r.wing 
      })), 
    []
  );

  const filteredTenants = useMemo(() => {
    return allTenants.filter(tenant => {
      const matchesWing = wingFilter === 'All' || tenant.wing === wingFilter;
      const matchesSearch = 
        searchQuery.trim() === '' ||
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesWing && matchesSearch;
    });
  }, [allTenants, searchQuery, wingFilter]);

  const handleViewDetails = (tenant: TenantDetails) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };
  
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
      <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Tenant Overview</h1>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search by Tenant, Owner, or Flat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
          />
        </div>
        <select
          value={wingFilter}
          onChange={(e) => setWingFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition appearance-none"
        >
          <option value="All">All Wings</option>
          <option value="A">Wing A</option>
          <option value="B">Wing B</option>
          <option value="C">Wing C</option>
        </select>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <tr>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Tenant Name</th>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Flat No.</th>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Owner Name</th>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Contact</th>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Move-in Date</th>
                    <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredTenants.map(tenant => (
                <tr key={tenant.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                    <td className="p-4 text-text-primary dark:text-slate-200 font-semibold">{tenant.name}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{tenant.flatNo}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{tenant.ownerName}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{tenant.contact}</td>
                    <td className="p-4 text-text-secondary dark:text-slate-400">{tenant.moveInDate}</td>
                    <td className="p-4">
                        <button onClick={() => handleViewDetails(tenant)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                            <Eye size={16} /> View Details
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden">
            {filteredTenants.map(tenant => (
                <div key={tenant.id} className="p-4 border-b dark:border-slate-700 last:border-b-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-text-primary dark:text-slate-200">{tenant.name}</p>
                            <p className="text-sm text-primary font-semibold">{tenant.flatNo}</p>
                        </div>
                        <button onClick={() => handleViewDetails(tenant)} className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary py-1 px-2 rounded-full">
                            <Eye size={14} /> View
                        </button>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-slate-400 mt-2">Owner: {tenant.ownerName}</p>
                    <p className="text-sm text-text-secondary dark:text-slate-400">Contact: {tenant.contact}</p>
                </div>
            ))}
        </div>
         {filteredTenants.length === 0 && (
            <div className="text-center py-12 text-text-secondary dark:text-slate-400">
                No tenants found matching your criteria.
            </div>
        )}
      </div>

      <Modal title="Tenant Details" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedTenant && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-text-primary dark:text-slate-200">{selectedTenant.name}</h3>
                    <p className="text-primary font-semibold">Flat {selectedTenant.flatNo} (Owner: {selectedTenant.ownerName})</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Contact</p>
                            <p className="font-semibold">{selectedTenant.contact}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary"/>
                        <div>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Move-in Date</p>
                            <p className="font-semibold">{selectedTenant.moveInDate}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-text-primary dark:text-slate-300">Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                         <DocumentDisplay label="Rental Agreement" filename={selectedTenant.agreementDoc} icon={FileText} />
                         <DocumentDisplay label="Aadhaar Card" filename={selectedTenant.aadhaarDoc} icon={VenetianMask} />
                         <DocumentDisplay label="PAN Card" filename={selectedTenant.panDoc} icon={Banknote} />
                         <DocumentDisplay label="Photo" filename={selectedTenant.photo} icon={Camera} />
                         <DocumentDisplay label="Police Verification" filename={selectedTenant.policeVerificationDoc} icon={ShieldCheck} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-text-primary font-semibold py-2 px-4 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition">Close</button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminTenants;
