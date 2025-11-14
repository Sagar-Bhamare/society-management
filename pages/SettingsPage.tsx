
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { User, Shield, Bell, Palette, Eye, EyeOff, Save, Sun, Moon } from 'lucide-react';
import LazyImage from '../components/Image';

type SettingsTab = 'Profile' | 'Security' | 'Notifications' | 'Appearance';

const SettingsCard: React.FC<{title: string, description?: string, children: React.ReactNode, footer?: React.ReactNode}> = ({ title, description, children, footer }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-text-primary dark:text-slate-200">{title}</h3>
            {description && <p className="mt-1 text-sm text-text-secondary dark:text-slate-400">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
        {footer && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-xl flex justify-end">
                {footer}
            </div>
        )}
    </div>
);


const SettingsPage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

    // Account state
    const [name, setName] = useState(user?.name || '');
    const [contact, setContact] = useState(user?.contact || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Notification state (UI only)
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    if (!user) {
        return <div>Loading settings...</div>;
    }

    const handleAccountSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ name, contact, avatar });
        toast.success('Profile updated successfully!');
    };
    
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        // Mock password change
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const tabs: { name: SettingsTab, icon: React.ElementType }[] = [
        { name: 'Profile', icon: User },
        { name: 'Security', icon: Shield },
        { name: 'Notifications', icon: Bell },
        { name: 'Appearance', icon: Palette },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <form onSubmit={handleAccountSave}>
                        <SettingsCard 
                            title="Profile Information" 
                            description="Update your personal details here."
                            footer={
                                <button type="submit" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                                    <Save size={16} /> Save Changes
                                </button>
                            }
                        >
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <LazyImage src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover" />
                                    <div className="flex-grow">
                                        <label htmlFor="avatar-url" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Avatar URL</label>
                                        <div className="relative mt-1">
                                            <input 
                                                id="avatar-url"
                                                type="text" 
                                                value={avatar}
                                                onChange={(e) => setAvatar(e.target.value)}
                                                className="w-full pl-4 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Provide a URL to update your profile picture.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Full Name</label>
                                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label htmlFor="contact" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Contact Number</label>
                                        <input id="contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                    </div>
                                </div>
                            </div>
                        </SettingsCard>
                    </form>
                );
            case 'Security':
                return (
                     <form onSubmit={handlePasswordChange}>
                        <SettingsCard 
                            title="Change Password"
                            description="For your security, we recommend using a strong password that you're not using elsewhere."
                            footer={
                                <button type="submit" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-700 transition">
                                    <Shield size={16} /> Update Password
                                </button>
                            }
                        >
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Current Password</label>
                                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">New Password</label>
                                    <div className="relative">
                                        <input type={isPasswordVisible ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                        <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary dark:text-slate-400">Confirm New Password</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                                </div>
                            </div>
                        </SettingsCard>
                    </form>
                );
            case 'Notifications':
                 return (
                    <SettingsCard title="Notification Settings" description="Manage how you receive notifications from AuraLiva.">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-text-primary dark:text-slate-200">Email Notifications</h4>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">Get notified via email for important updates.</p>
                                </div>
                                <button onClick={() => setEmailNotifications(!emailNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div>
                                    <h4 className="font-medium text-text-primary dark:text-slate-200">Push Notifications</h4>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">Receive push notifications in your browser.</p>
                                </div>
                                <button onClick={() => setPushNotifications(!pushNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </SettingsCard>
                 );
            case 'Appearance':
                return (
                    <SettingsCard title="Appearance" description="Customize the look and feel of your interface.">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-text-primary dark:text-slate-200">Interface Theme</h4>
                                <p className="text-sm text-text-secondary dark:text-slate-400">Select or customize your interface theme.</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <button onClick={() => theme !== 'light' && toggleTheme()} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-800 shadow text-text-primary dark:text-slate-200' : 'text-text-secondary dark:text-slate-400'}`}>
                                    <Sun size={16} /> Light
                                </button>
                                <button onClick={() => theme !== 'dark' && toggleTheme()} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-800 shadow text-text-primary dark:text-slate-200' : 'text-text-secondary dark:text-slate-400'}`}>
                                    <Moon size={16} /> Dark
                                </button>
                            </div>
                        </div>
                    </SettingsCard>
                );
        }
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary dark:text-slate-200">Settings</h1>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                             <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${activeTab === tab.name ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <tab.icon size={20} />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
