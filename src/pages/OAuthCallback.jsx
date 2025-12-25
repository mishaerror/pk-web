import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setAuthToken } from '../utils/api';

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

        // Debug: Log URL parsing and cookies
        console.log('Current URL:', window.location.href);
        console.log('Pathname:', window.location.pathname);
        console.log('Search:', window.location.search);
        console.log('Registration flow detected:', isRegistrationFlow);
        console.log('All cookies:', document.cookie);

        // Extract JWT token from Auth query parameter
        const authToken = urlParams.get('Auth');
        console.log('Auth token from query param:', authToken ? authToken.substring(0, 20) + '...' : 'null');
        var cookieToken = getCookie('Auth');
        console.log('Auth token from cookie:', cookieToken ? cookieToken.substring(0, 20) + '...' : 'null');
        if (!authToken) {
          throw new Error('No authentication token found in query parameters');
        }

        // Store the JWT token
        setAuthToken(authToken);
        console.log('JWT token stored from query param:', authToken.substring(0, 20) + '...');

        setMessage('Verifying authentication with backend...');

        //Now verify the token with the backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://localhost:8443'}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-AUTH-TOKEN': `${authToken}`
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          const text = await response.text();
          console.error('Response not OK:', response.status, contentType, text.substring(0, 200));
          throw new Error(`Authentication failed: ${response.status} - ${contentType?.includes('html') ? 'Received HTML instead of JSON (likely redirected to login)' : text}`);
        }

        const data = await response.json();
        console.log('User data received:', data);

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
        
        console.log('Registration status:', { 
          registered: data.registered, 
          isRegistered, 
          ref: data.ref, 
          hasRef 
        });
        
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
