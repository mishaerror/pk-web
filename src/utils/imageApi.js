import { getAuthToken } from './api';

const API_BASE = '';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  // Get merchantRef from localStorage
  const merchantRef = localStorage.getItem('pk_merchantRef');
  
  const response = await fetch(`${API_BASE}/api/images`, {
    method: 'POST',
    headers: {
      'X-Merchant-Ref': merchantRef,
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Image upload failed');
  }

  return await response.json();
};