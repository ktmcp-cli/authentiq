import { getConfig } from './config.js';

async function request(endpoint, method = 'GET', body = null) {
  const config = getConfig();
  
  const url = `${config.baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${response.status} ${text}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function createKey(body) {
  return request('/key', 'POST', body);
}

export async function getKey(pk) {
  return request(`/key/${pk}`, 'GET');
}

export async function deleteKey(pk) {
  return request(`/key/${pk}`, 'DELETE');
}

export async function updateKey(pk, body) {
  return request(`/key/${pk}`, 'PUT', body);
}

export async function createScope(body) {
  return request('/scope', 'POST', body);
}

export async function getScope(job) {
  return request(`/scope/${job}`, 'GET');
}
