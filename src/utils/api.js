/**
 * API utility for making authenticated requests to Spring Boot backend
 * Uses JWT token authentication with Vite proxy
 */

// Use relative URLs since Vite proxy will handle routing to backend
const API_BASE = '';

/**
 * Get JWT token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('pk_auth_token');
}

/**
 * Set JWT token in localStorage
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('pk_auth_token', token);
  } else {
    localStorage.removeItem('pk_auth_token');
  }
}

/**
 * Clear JWT token from localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem('pk_auth_token');
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/orders')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'X-AUTH-TOKEN': `${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Auto-redirect to login on 401 Unauthorized
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
}

/**
 * GET request
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GET ${endpoint} failed: ${response.status} - ${error}`);
  }
  
  return response.json();
}

/**
 * POST request
 */
export async function apiPost(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`POST ${endpoint} failed: ${response.status} - ${error}`);
  }
  
  return response.json();
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PUT ${endpoint} failed: ${response.status} - ${error}`);
  }
  
  return response.json();
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DELETE ${endpoint} failed: ${response.status} - ${error}`);
  }
  
  return response.json();
}

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    const response = await apiRequest('/api/auth/me', { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  return apiGet('/api/auth/me');
}

/**
 * Logout user
 */
export async function logout() {
  clearAuthToken();
  return apiPost('/api/auth/logout', {});
}

/**
 * Check if JWT token exists
 */
export function hasAuthToken() {
  return getAuthToken() !== null;
}

export { API_BASE };

