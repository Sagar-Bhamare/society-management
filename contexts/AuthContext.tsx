
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { USERS } from '../constants';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auraliva_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = useCallback((email: string, role: UserRole) => {
    const userToLogin = USERS[role];
    if (userToLogin && userToLogin.email === email) {
      localStorage.setItem('auraliva_user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auraliva_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser(currentUser => {
        if (currentUser) {
            const newUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('auraliva_user', JSON.stringify(newUser));
            return newUser;
        }
        return null;
    });
  }, []);


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};