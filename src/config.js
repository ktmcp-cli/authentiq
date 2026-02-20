import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CONFIG_DIR = join(homedir(), '.ktmcp');
const CONFIG_FILE = join(CONFIG_DIR, 'authentiq.json');

export function getConfig() {
  if (!existsSync(CONFIG_FILE)) {
    return { apiKey: null, baseUrl: 'https://6-dot-authentiqio.appspot.com' };
  }
  try {
    const data = readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { apiKey: null, baseUrl: 'https://6-dot-authentiqio.appspot.com' };
  }
}

export function setConfig(updates) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = getConfig();
  const newConfig = { ...current, ...updates };
  writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  return newConfig;
}

export function isConfigured() {
  const config = getConfig();
  return !!config.apiKey;
}
