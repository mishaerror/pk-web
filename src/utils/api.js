/**
 * API utility for making authenticated requests to Spring Boot backend
 * Automatically includes credentials (JSESSIONID cookie) with all requests
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:8443';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/orders')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    ...options,
    credentials: 'include', // Always include cookies (JSESSIONID)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  // If unauthorized, redirect to login
  if (response.status === 401) {
    localStorage.removeItem('pk_authenticated');
    localStorage.removeItem('pk_merchantName');
    localStorage.removeItem('pk_merchantEmail');
    localStorage.removeItem('pk_merchantId');
    window.location.href = '/login';
    throw new Error('Unauthorized - redirecting to login');
  }

  return response;
}

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  return response.json();
}

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPost(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  return response.json();
}

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPut(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  return response.json();
}

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiDelete(endpoint) {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  // DELETE might return empty response
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Check if user is authenticated by verifying session with backend
 * @returns {Promise<boolean>}
 */
export async function checkAuth() {
  try {
    const response = await apiRequest('/api/auth/me', { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user/merchant info
 * @returns {Promise<object>}
 */
export async function getCurrentUser() {
  return apiGet('/api/auth/me');
}

/**
 * Logout user
 * Note: This only calls the backend. Use AuthContext.clearAuth() to clear local state.
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await apiPost('/logout', {});
  } catch (error) {
    console.error('Logout error:', error);
  }
  // Note: Don't clear localStorage or redirect here
  // Let the component using AuthContext handle that
}

export { API_BASE };

