import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const userLogin = (userData: User) => {
    setUser(userData);
    console.log('user: ', user);
  };

  const adminLogin = (adminData: Admin) => {
    setAdmin(adminData);
    console.log('admin: ', user);
  };

  const userLogout = () => {
    setUser(null);
    setAdmin(null);
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
