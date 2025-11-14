
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LazyImage from '../components/Image';
import { Mail, Phone, Home, Edit, Briefcase } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getBasePath = () => {
        if (location.pathname.startsWith('/admin')) return '/admin';
        if (location.pathname.startsWith('/resident')) return '/resident';
        if (location.pathname.startsWith('/security')) return '/security';
        return '/';
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary dark:text-slate-400">Loading profile...</p>
            </div>
        );
    }

    const profileDetails = [
        { icon: Mail, label: 'Email Address', value: user.email },
        { icon: Phone, label: 'Contact', value: user.contact || 'N/A' },
        { icon: Briefcase, label: 'Role', value: user.role },
    ];
    
    if (user.role === 'Resident' && user.flatNo) {
        profileDetails.push({ icon: Home, label: 'Flat Number', value: user.flatNo });
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
                <div className="relative">
                    <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070" alt="Profile background" className="w-full h-48 object-cover"/>
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                        <LazyImage src={user.avatar} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl" />
                    </div>
                </div>

                <div className="pt-20 md:pt-6 pb-8 px-6 md:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-center md:text-left md:ml-40">
                             <h1 className="text-3xl font-bold text-text-primary dark:text-slate-100">{user.name}</h1>
                             <p className="text-text-secondary dark:text-slate-400">{user.email}</p>
                        </div>
                        <button onClick={() => navigate(`${getBasePath()}/settings`)} className="flex items-center gap-2 mt-4 md:mt-0 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                            <Edit size={16} /> Edit Profile
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-6">Profile Details</h2>
                        <ul className="space-y-6">
                            {profileDetails.map((detail, index) => (
                                <li key={index} className="flex items-center">
                                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mr-4">
                                        <detail.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-sm text-text-secondary dark:text-slate-400">{detail.label}</span>
                                        <p className="font-semibold text-text-primary dark:text-slate-200">{detail.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
