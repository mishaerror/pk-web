import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setAuthToken, apiGet } from '../utils/api';

// Helper function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuth();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    async function handleCallback() {
      setMessage('Extracting authentication token...');

      try {
        // Check if this is a registration flow - handle both correct and malformed URLs
        const urlParams = new URLSearchParams(window.location.search);
        const isRegistrationFlow = urlParams.get('flow') === 'REGISTER' || 
                                   window.location.pathname.includes('&flow=REGISTER');

        // // Extract JWT token from Auth query parameter
        // const authToken = urlParams.get('Auth');
        // const cookieToken = getCookie('Auth');
        // console.log('Cookie token:', cookieToken);
        // if (!authToken) {
        //   throw new Error('No authentication token found in query parameters');
        // }


        setMessage('Verifying authentication with backend...');

        // Now verify the token with the backend
        const data = await apiGet('/api/auth/me');

        // Update auth context with user data
        if (data) {
          setAuth({
            ref: data.ref || '',
            name: data.name || '',
            email: data.email || '',
            picture: data.picture || '',
            registered: data.registered || false
          });
        }

        // Determine redirect destination based on registration status
        const isRegistered = data.registered === 'true' || data.registered === true;
        const hasRef = data.ref && data.ref !== '';
        
        if (!isRegistered || !hasRef) {
          setMessage('Authentication successful — redirecting to registration...');
          setTimeout(() => navigate('/register'), 700);
        } else {
          setMessage('Authentication successful — redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 700);
        }

      } catch (err) {
        console.error('OAuth callback verification failed', err);
        setMessage(`Authentication failed: ${err.message}. Redirecting to login...`);
        clearAuth();
        setTimeout(() => navigate('/login'), 3000);
      }
    }

    handleCallback();
  }, [navigate, setAuth, clearAuth]);

  return (
    <main className="page-root">
      <div className="container card" style={{ textAlign: 'center' }}>
        <h3>{message}</h3>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>Current URL: {window.location.href}</p>
          <p>Processing OAuth callback...</p>
        </div>
      </div>
    </main>
  );
}
