import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuth();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    async function handleCallback() {
      setMessage('Verifying authentication with backend...');

      try {
        // Spring Boot will have already set JSESSIONID cookie during OAuth redirect
        // We just need to verify the session and get user info

        // Debug: Log cookies
        console.log('Current cookies:', document.cookie);

        const response = await fetch(`${import.meta.env.VITE_API_BASE || 'https://localhost:8443'}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
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

        // Update auth context (which also updates localStorage)
        const merchant = data.merchant || data.user || data;
        if (merchant) {
          setAuth(merchant);
        }

        setMessage('Authentication successful — redirecting...');
        setTimeout(() => navigate('/dashboard'), 700);
      } catch (err) {
        console.error('OAuth callback verification failed', err);
        setMessage(`Authentication failed: ${err.message}. Redirecting to login...`);
        // Clear auth state
        clearAuth();
        setTimeout(() => navigate('/login'), 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <main className="page-root">
      <div className="container card" style={{ textAlign: 'center' }}>
        <h3>{message}</h3>
      </div>
    </main>
  );
}
