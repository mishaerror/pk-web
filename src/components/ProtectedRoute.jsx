import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkAuth } from '../utils/api';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated: authContextAuthenticated, clearAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      // Quick check: if no local auth flag, skip backend call
      if (!authContextAuthenticated) {
        setIsChecking(false);
        setIsValid(false);
        return;
      }

      // Verify with backend that session is still valid
      const valid = await checkAuth();

      if (!valid) {
        // Session expired, clear auth state
        clearAuth();
      }

      setIsValid(valid);
      setIsChecking(false);
    }

    verifyAuth();
  }, [authContextAuthenticated, clearAuth]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
}
