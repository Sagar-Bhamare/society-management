import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Key, Mail, Home, Eye, EyeOff, Shield, Building, Wrench, UserCheck, ChevronDown } from 'lucide-react';
import type { UserRole } from '../types';

const roles: { role: UserRole, icon: React.ElementType }[] = [
    { role: 'Admin', icon: Shield },
    { role: 'Secretary', icon: Wrench },
    { role: 'Treasurer', icon: Building },
    { role: 'Security', icon: UserCheck },
    { role: 'Resident', icon: User },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@auraliva.com');
  const [password, setPassword] = useState('admin123');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const DUMMY_PASSWORDS: Record<UserRole, string> = {
        Admin: 'admin123',
        Secretary: 'secretary123',
        Treasurer: 'treasurer123',
        Security: 'security123',
        Resident: 'resident123'
    };
    
    setTimeout(() => {
        if (password === DUMMY_PASSWORDS[selectedRole] && login(email, selectedRole)) {
            toast.success(`Welcome, ${selectedRole}!`);
        } else {
            toast.error('Invalid credentials. Please try again.');
        }
        setIsLoading(false);
    }, 1000);
  };
  
  const SelectedRoleIcon = roles.find(r => r.role === selectedRole)?.icon || User;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070')" }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative w-full max-w-md bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6 text-white">
        <div className="text-center">
            <Home className="mx-auto h-12 w-12 text-white" />
            <h1 className="text-3xl font-bold text-white mt-2">AuraLiva</h1>
            <p className="text-white/80">Premium Society Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 bg-white/10 rounded-lg border border-white/30 focus:ring-2 focus:ring-primary focus:border-primary transition placeholder:text-white/70"
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none" />
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 bg-white/10 rounded-lg border border-white/30 focus:ring-2 focus:ring-primary focus:border-primary transition placeholder:text-white/70"
            />
            <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
             <label className="block text-sm font-medium text-white/80 mb-2">Select your role</label>
             <button type="button" onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)} className="w-full flex items-center text-left px-4 py-3 bg-white/10 rounded-lg border border-white/30 focus:ring-2 focus:ring-primary">
                <SelectedRoleIcon className="h-5 w-5 text-white/70 mr-3 flex-shrink-0" />
                <span className="flex-grow">{selectedRole}</span>
                <ChevronDown size={20} className={`transition-transform flex-shrink-0 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
             </button>
             {isRoleDropdownOpen && (
                 <div className="absolute z-10 top-full mt-2 w-full bg-slate-900/80 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 animate-fade-in-fast">
                     {roles.map(({ role, icon: Icon }) => (
                         <div key={role} onClick={() => { setSelectedRole(role); setIsRoleDropdownOpen(false); }} className="flex items-center px-4 py-3 hover:bg-primary/50 cursor-pointer rounded-lg text-sm">
                             <Icon className="mr-3 text-white/70 flex-shrink-0" size={20} />
                             {role}
                         </div>
                     ))}
                 </div>
             )}
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary transition duration-300 disabled:bg-indigo-400 disabled:opacity-70">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;