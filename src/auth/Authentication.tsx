// src/auth/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface Admin {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  userLogin: (userData: User) => void;
  adminLogin: (adminData: Admin) => void;
  userLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    // Load user and admin data from local storage on initial load
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
  }, []);

  const userLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Save to local storage
  };

  const adminLogin = (adminData: Admin) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData)); // Save to local storage
  };

  const userLogout = () => {
    setUser(null);
    setAdmin(null);
    localStorage.removeItem('user'); // Remove from local storage
    localStorage.removeItem('admin'); // Remove from local storage
  };

  return (
    <AuthContext.Provider value={{ user, admin, userLogin, adminLogin, userLogout }}>
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

export const isAuthenticated = ({ user, admin }: { user: User | null; admin: Admin | null }): boolean => {
  return !!user || !!admin;
};
