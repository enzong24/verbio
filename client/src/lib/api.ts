// API utilities with Firebase token support
import { auth } from './firebase';

// Get auth headers for API requests
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Try to get Firebase ID token
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${idToken}`;
    } else {
      // Fallback to stored token
      const storedToken = localStorage.getItem('firebaseToken');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }
  } catch (error) {
    console.error('Failed to get Firebase token:', error);
  }

  return headers;
}

// Fetch with Firebase auth
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}
