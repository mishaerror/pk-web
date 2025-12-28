import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: localStorage.getItem('pk_authenticated') === 'true',
    merchantName: localStorage.getItem('pk_merchantName') || '',
    merchantEmail: localStorage.getItem('pk_merchantEmail') || '',
    merchantRef: localStorage.getItem('pk_merchantRef') || '',
  });

  // Function to update auth state
  const setAuth = (merchant) => {
    if (merchant) {
      const newState = {
        isAuthenticated: true,
        merchantName: merchant.name || '',
        merchantEmail: merchant.email || '',
        merchantRef: merchant.ref || '',
      };
      
      // Update localStorage
      localStorage.setItem('pk_authenticated', 'true');
      localStorage.setItem('pk_merchantName', merchant.name || '');
      localStorage.setItem('pk_merchantEmail', merchant.email || '');
      if (merchant.ref) localStorage.setItem('pk_merchantRef', merchant.ref);
      console.log('Setting merchantRef in localStorage:', merchant.ref);
      
      // Update state
      setAuthState(newState);
    }
  };
  const getAuth = () => {
    return authState;
  };

  // Function to clear auth state
  const clearAuth = () => {
    const newState = {
      isAuthenticated: false,
      merchantName: '',
      merchantEmail: '',
      merchantRef: '',
    };
    
    // Clear localStorage
    localStorage.removeItem('pk_authenticated');
    localStorage.removeItem('pk_merchantName');
    localStorage.removeItem('pk_merchantEmail');
    localStorage.removeItem('pk_merchantRef');
    
    // Update state
    setAuthState(newState);
  };

  return (
    <AuthContext.Provider value={{ ...authState, setAuth, clearAuth, getAuth }}>
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
