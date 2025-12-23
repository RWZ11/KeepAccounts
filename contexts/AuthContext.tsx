import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isSkipped: boolean;
  setSkip: (skip: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isSkipped, setIsSkipped] = useState<boolean>(() => StorageService.getSkipAuth());

  const handleSetUser = (newUser: User | null) => {
    StorageService.setCurrentUser(newUser);
    setUser(newUser);
    if (newUser) {
      StorageService.setSkipAuth(false);
      setIsSkipped(false);
    }
  };

  const handleSetSkip = (skip: boolean) => {
    StorageService.setSkipAuth(skip);
    setIsSkipped(skip);
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, isSkipped, setSkip: handleSetSkip, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};