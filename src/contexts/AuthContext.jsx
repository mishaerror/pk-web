import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: localStorage.getItem('pk_authenticated') === 'true',
    merchantName: localStorage.getItem('pk_merchantName') || '',
    merchantEmail: localStorage.getItem('pk_merchantEmail') || '',
    merchantId: localStorage.getItem('pk_merchantId') || '',
  });

  // Function to update auth state
  const setAuth = (merchant) => {
    if (merchant) {
      const newState = {
        isAuthenticated: true,
        merchantName: merchant.name || '',
        merchantEmail: merchant.email || '',
        merchantId: merchant.id || '',
      };
      
      // Update localStorage
      localStorage.setItem('pk_authenticated', 'true');
      localStorage.setItem('pk_merchantName', merchant.name || '');
      localStorage.setItem('pk_merchantEmail', merchant.email || '');
      if (merchant.id) localStorage.setItem('pk_merchantId', merchant.id);
      
      // Update state
      setAuthState(newState);
    }
  };

  // Function to clear auth state
  const clearAuth = () => {
    const newState = {
      isAuthenticated: false,
      merchantName: '',
      merchantEmail: '',
      merchantId: '',
    };
    
    // Clear localStorage
    localStorage.removeItem('pk_authenticated');
    localStorage.removeItem('pk_merchantName');
    localStorage.removeItem('pk_merchantEmail');
    localStorage.removeItem('pk_merchantId');
    
    // Update state
    setAuthState(newState);
  };

  return (
    <AuthContext.Provider value={{ ...authState, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

