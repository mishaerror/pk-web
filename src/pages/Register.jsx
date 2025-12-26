
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiPost, hasAuthToken } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const { getAuth, setAuth } = useAuth();  
  const [userInfo, setUserInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    merchantName: '',
    merchantContactPerson: '',
    merchantShopName: '',
    merchantAddress: '',
    merchantPhone: '',
    merchantEmail: ''
  });

  // Get user info from auth context on mount
  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        if (!hasAuthToken()) {
          setError('No authentication token found. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const authResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-AUTH-TOKEN': `${localStorage.getItem('pk_auth_token')}`,
          },
        });

        if (!authResponse.ok) {
          setError('Session expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const backendUserData = await authResponse.json();

        // Update auth context with fresh backend data
        setAuth({
          ref: backendUserData.ref || '',
          name: backendUserData.name || '',
          email: backendUserData.email || '',
          picture: backendUserData.picture || '',
          registered: backendUserData.registered || false
        });

        // Set user info for UI
        const user = { 
          name: backendUserData.name, 
          email: backendUserData.email, 
          picture: backendUserData.picture 
        };
        setUserInfo(user);
        
        // Pre-fill form with backend data
        setFormData(prev => ({
          ...prev,
          merchantEmail: backendUserData.email || '',
          merchantContactPerson: backendUserData.name || ''
        }));

      } catch (error) {
        console.error('Auth check failed:', error);
        setError('Authentication failed. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    }

    checkAuthAndLoadData();
  }, [navigate]); // Removed setAuth from dependencies - this was causing the infinite loop!

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      // Structure data according to backend API
      const registrationData = {
        status: 'PENDING',
        merchantRef: null,
        merchantName: formData.merchantName,
        merchantContactPerson: formData.merchantContactPerson,
        merchantShopName: formData.merchantShopName,
        merchantAddress: formData.merchantAddress,
        merchantPhone: formData.merchantPhone,
        merchantEmail: formData.merchantEmail
      };

      console.log('Submitting registration data:', registrationData);
      const merchantRef = await apiPost('/api/merchants/register', registrationData);
      console.log('Registration successful, received merchantRef:', merchantRef);

      // Update auth context with merchant ref and mark as registered
      if (userInfo) {
        setAuth({
          ref: merchantRef,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          registered: true
        });
      }

      setMessage('Registration successful! Redirecting to dashboard...');
      // Registration successful, redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-root">
      <div className="container card">
        <h2>Complete Your Registration</h2>
        
        {userInfo && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <p>Welcome, {userInfo.name}! Please complete your merchant registration.</p>
          </div>
        )}

        {message && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantName" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Business Name *
            </label>
            <input
              type="text"
              id="merchantName"
              name="merchantName"
              value={formData.merchantName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Enter your business name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantContactPerson" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Contact Person *
            </label>
            <input
              type="text"
              id="merchantContactPerson"
              name="merchantContactPerson"
              value={formData.merchantContactPerson}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Enter contact person name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantShopName" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Shop Name *
            </label>
            <input
              type="text"
              id="merchantShopName"
              name="merchantShopName"
              value={formData.merchantShopName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Enter your shop name"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantAddress" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Business Address *
            </label>
            <textarea
              id="merchantAddress"
              name="merchantAddress"
              value={formData.merchantAddress}
              onChange={handleInputChange}
              required
              rows="3"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
              placeholder="Enter your business address"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantPhone" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              id="merchantPhone"
              name="merchantPhone"
              value={formData.merchantPhone}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="merchantEmail" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Email Address *
            </label>
            <input
              type="email"
              id="merchantEmail"
              name="merchantEmail"
              value={formData.merchantEmail}
              onChange={handleInputChange}
              disabled= {true}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </main>
  );
}

