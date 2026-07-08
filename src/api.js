const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://trin-pe-backend.onrender.com';
const SESSION_KEY = 'trinPeSession';

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = () => {
  const savedSession = localStorage.getItem(SESSION_KEY);
  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('usuarioCiudadano');
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('usuarioCiudadano');
};

export const getUser = () => getSession()?.usuario || null;

export const apiFetch = (path, options = {}) => {
  const session = getSession();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
};
