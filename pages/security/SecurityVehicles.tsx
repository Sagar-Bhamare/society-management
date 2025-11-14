

import React, { useState, useMemo } from 'react';
import { VEHICLES } from '../../constants';
import type { Vehicle } from '../../types';
import { Search, LogOut, Car, User, Home } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { toast } from 'react-hot-toast';

const SecurityVehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmExitVehicleId, setConfirmExitVehicleId] = useState<string | null>(null);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle =>
            vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vehicle.flatNo && vehicle.flatNo.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, vehicles]);

    const handleMarkExitClick = (vehicleId: string) => {
        setConfirmExitVehicleId(vehicleId);
    };

    const handleConfirmExit = () => {
        if (!confirmExitVehicleId) return;

        const vehicleToUpdate = vehicles.find(v => v.id === confirmExitVehicleId);

        setVehicles(vehicles.map(v => 
            v.id === confirmExitVehicleId
            ? { ...v, status: 'Exited', outTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
            : v
        ));

        if (vehicleToUpdate) {
            toast.success(`${vehicleToUpdate.vehicleNo} has been marked as exited.`);
        }
        setConfirmExitVehicleId(null);
    };
    
    const vehicleToConfirmExit = useMemo(() => {
        if (!confirmExitVehicleId) return null;
        return vehicles.find(v => v.id === confirmExitVehicleId);
    }, [confirmExitVehicleId, vehicles]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Vehicle Tracking</h1>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by vehicle, owner, or flat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-80 pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary focus:border-primary transition"
                        aria-label="Search vehicles"
                    />
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700/80 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Vehicle No.</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Owner Name</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Type</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Flat No.</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">In / Out Time</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Status</th>
                                <th className="p-4 font-semibold text-sm text-text-primary dark:text-slate-200">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                                    <td className="p-4 font-mono text-text-primary dark:text-slate-200">{vehicle.vehicleNo}</td>
                                    <td className="p-4 text-text-secondary dark:text-slate-400">{vehicle.ownerName}</td>
                                    <td className="p-4"><StatusBadge text={vehicle.ownerType} type={vehicle.ownerType === 'Resident' ? 'info' : 'neutral'} /></td>
                                    <td className="p-4 text-text-secondary dark:text-slate-400">{vehicle.flatNo || 'N/A'}</td>
                                    <td className="p-4 text-text-secondary dark:text-slate-400">{vehicle.inTime} / {vehicle.outTime || '--'}</td>
                                    <td className="p-4"><StatusBadge text={vehicle.status} type={vehicle.status === 'Inside' ? 'success' : 'neutral'} /></td>
                                    <td className="p-4">
                                        {vehicle.status === 'Inside' && (
                                            <button onClick={() => handleMarkExitClick(vehicle.id)} className="flex items-center gap-1 text-sm text-secondary hover:underline">
                                                <LogOut size={14} /> Mark Exit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <Car className="w-5 h-5 text-primary" />
                                    <p className="font-bold font-mono text-text-primary dark:text-slate-200">{vehicle.vehicleNo}</p>
                                </div>
                                <StatusBadge text={vehicle.status} type={vehicle.status === 'Inside' ? 'success' : 'neutral'} />
                            </div>

                            <div className="mt-3 space-y-2 text-sm text-text-secondary dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Owner: <strong className="text-text-primary dark:text-slate-200">{vehicle.ownerName}</strong></span>
                                    <StatusBadge text={vehicle.ownerType} type={vehicle.ownerType === 'Resident' ? 'info' : 'neutral'} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4" />
                                    <span>Flat: <strong className="text-text-primary dark:text-slate-200">{vehicle.flatNo || 'N/A'}</strong></span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-text-secondary dark:text-slate-500">
                                <div>
                                    <p><strong>In:</strong> {vehicle.inTime}</p>
                                    <p><strong>Out:</strong> {vehicle.outTime || 'N/A'}</p>
                                </div>
                                {vehicle.status === 'Inside' && (
                                    <button onClick={() => handleMarkExitClick(vehicle.id)} className="flex items-center gap-1 text-sm text-secondary font-semibold">
                                        <LogOut size={14} /> Mark Exit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 {filteredVehicles.length === 0 && (
                    <div className="text-center py-12 text-text-secondary dark:text-slate-400">
                        No vehicles found matching your search.
                    </div>
                 )}
            </div>

            <Modal
                title="Confirm Vehicle Exit"
                isOpen={!!confirmExitVehicleId}
                onClose={() => setConfirmExitVehicleId(null)}
            >
                {vehicleToConfirmExit && (
                    <div className="text-center">
                        <p className="text-text-secondary dark:text-slate-400 mb-6">
                            Are you sure you want to mark vehicle <strong className="font-mono text-text-primary dark:text-slate-200">{vehicleToConfirmExit.vehicleNo}</strong> as exited?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setConfirmExitVehicleId(null)}
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

export default SecurityVehicles;