
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResidents from './pages/admin/AdminResidents';
import AdminFinances from './pages/admin/AdminFinances';
import AdminComplaints from './pages/admin/AdminComplaints';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import AmenityBooking from './pages/resident/AmenityBooking';
import NoticeBoard from './pages/NoticeBoard';
import SecurityDashboard from './pages/security/SecurityDashboard';
import ResidentComplaints from './pages/resident/ResidentComplaints';
import ResidentFinances from './pages/resident/ResidentFinances';
import type { UserRole } from './types';
import SecurityVisitorLog from './pages/security/SecurityVisitorLog';
import SecurityPatrols from './pages/security/SecurityPatrols';
import SecurityIncidents from './pages/security/SecurityIncidents';
import SecurityVehicles from './pages/security/SecurityVehicles';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminQuotationRequests from './pages/admin/AdminQuotationRequests';
import ResidentTenantManagement from './pages/resident/ResidentTenantManagement';
import CommitteePage from './pages/CommitteePage';
import AdminTenants from './pages/admin/AdminTenants';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!roles.includes(user.role)) {
    // Redirect to a default dashboard if role doesn't match, or an unauthorized page
    const defaultPath = user.role === 'Resident' ? '/resident/dashboard' : '/admin/dashboard';
    return <Navigate to={defaultPath} replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" toastOptions={{
          className: 'font-sans',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}/>
        <Router />
      </ThemeProvider>
    </AuthProvider>
  );
};

const Router: React.FC = () => {
  const { user } = useAuth();
  
  const getHomePath = () => {
    if (!user) return "/";
    switch(user.role) {
      case 'Admin':
      case 'Secretary':
      case 'Treasurer':
        return '/admin/dashboard';
      case 'Security':
        return '/security/dashboard';
      case 'Resident':
        return '/resident/dashboard';
      default:
        return '/';
    }
  }

  return (
      <HashRouter>
        <Routes>
          <Route path="/" element={!user ? <LoginPage /> : <Navigate to={getHomePath()} />} />
          
          <Route path="/admin" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="residents" element={<ProtectedRoute roles={['Admin', 'Secretary']}><AdminResidents /></ProtectedRoute>} />
            <Route path="tenants" element={<ProtectedRoute roles={['Admin', 'Secretary']}><AdminTenants /></ProtectedRoute>} />
            <Route path="finances" element={<ProtectedRoute roles={['Admin', 'Treasurer']}><AdminFinances /></ProtectedRoute>} />
            <Route path="expenses" element={<ProtectedRoute roles={['Admin', 'Treasurer']}><AdminExpenses /></ProtectedRoute>} />
            <Route path="quotations" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><AdminQuotationRequests /></ProtectedRoute>} />
            <Route path="complaints" element={<ProtectedRoute roles={['Admin', 'Secretary']}><AdminComplaints /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute roles={['Admin', 'Secretary']}><NoticeBoard /></ProtectedRoute>} />
            <Route path="committee" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><CommitteePage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><ProfilePage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><SettingsPage /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute roles={['Admin', 'Secretary', 'Treasurer']}><NotificationsPage /></ProtectedRoute>} />
          </Route>
          
          <Route path="/resident" element={<ProtectedRoute roles={['Resident']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<ProtectedRoute roles={['Resident']}><ResidentDashboard /></ProtectedRoute>} />
            <Route path="amenities" element={<ProtectedRoute roles={['Resident']}><AmenityBooking /></ProtectedRoute>} />
            <Route path="complaints" element={<ProtectedRoute roles={['Resident']}><ResidentComplaints /></ProtectedRoute>} />
            <Route path="finances" element={<ProtectedRoute roles={['Resident']}><ResidentFinances /></ProtectedRoute>} />
            <Route path="tenant-management" element={<ProtectedRoute roles={['Resident']}><ResidentTenantManagement /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute roles={['Resident']}><NoticeBoard /></ProtectedRoute>} />
            <Route path="committee" element={<ProtectedRoute roles={['Resident']}><CommitteePage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute roles={['Resident']}><ProfilePage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute roles={['Resident']}><SettingsPage /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute roles={['Resident']}><NotificationsPage /></ProtectedRoute>} />
          </Route>

          <Route path="/security" element={<ProtectedRoute roles={['Security']}><DashboardLayout /></ProtectedRoute>}>
             <Route path="dashboard" element={<ProtectedRoute roles={['Security']}><SecurityDashboard /></ProtectedRoute>} />
             <Route path="visitor-log" element={<ProtectedRoute roles={['Security']}><SecurityVisitorLog /></ProtectedRoute>} />
             <Route path="patrols" element={<ProtectedRoute roles={['Security']}><SecurityPatrols /></ProtectedRoute>} />
             <Route path="incidents" element={<ProtectedRoute roles={['Security']}><SecurityIncidents /></ProtectedRoute>} />
             <Route path="vehicles" element={<ProtectedRoute roles={['Security']}><SecurityVehicles /></ProtectedRoute>} />
             <Route path="committee" element={<ProtectedRoute roles={['Security']}><CommitteePage /></ProtectedRoute>} />
             <Route path="profile" element={<ProtectedRoute roles={['Security']}><ProfilePage /></ProtectedRoute>} />
             <Route path="settings" element={<ProtectedRoute roles={['Security']}><SettingsPage /></ProtectedRoute>} />
             <Route path="notifications" element={<ProtectedRoute roles={['Security']}><NotificationsPage /></ProtectedRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
  );
}


export default App;
