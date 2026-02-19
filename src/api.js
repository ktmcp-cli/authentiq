import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://6-dot-authentiqio.appspot.com';

function getClient() {
  const token = getConfig('token');
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    timeout: 15000
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) {
      throw new Error('Authentication failed. Run: authentiq config set token YOUR_TOKEN');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your API permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Authentiq API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// SESSIONS
// ============================================================

export async function createSession(data) {
  try {
    const response = await getClient().post('/session', data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getSession(sessionId) {
  try {
    const response = await getClient().get(`/session/${sessionId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteSession(sessionId) {
  try {
    const response = await getClient().delete(`/session/${sessionId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function listSessions() {
  try {
    const response = await getClient().get('/session');
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// KEYS
// ============================================================

export async function registerKey(keyData) {
  try {
    const response = await getClient().post('/key', keyData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getKey(pk) {
  try {
    const response = await getClient().get(`/key/${pk}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function revokeKey(pk) {
  try {
    const response = await getClient().delete(`/key/${pk}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateKey(pk, keyData) {
  try {
    const response = await getClient().put(`/key/${pk}`, keyData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// SCOPES
// ============================================================

export async function listScopes() {
  try {
    const response = await getClient().get('/scope');
    return response.data || [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function getScope(scopeId) {
  try {
    const response = await getClient().get(`/scope/${scopeId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function requestScope(scopeData) {
  try {
    const response = await getClient().post('/scope', scopeData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
