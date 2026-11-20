import { expect, it } from 'vitest';
import { normalizeApiBase } from './apiBase.js';
it.each(['', 'https://api.example.test', 'https://api.example.test/', 'https://api.example.test/api', 'https://api.example.test/api/'])('avoids duplicate /api paths for %s', value => {
  const base=normalizeApiBase(value);
  expect(`${base}/api/faces/state`).toBe(value ? 'https://api.example.test/api/faces/state' : '/api/faces/state');
  expect(`${base}/api/newsletter/subscribe`).toBe(value ? 'https://api.example.test/api/newsletter/subscribe' : '/api/newsletter/subscribe');
});

// The installed app uses an HTTPS API origin rather than its local WebView host.
it('builds API URLs for the installed application', async () => {
  const { vi } = await import('vitest');
  const { apiUrl } = await import('./apiBase.js');
  vi.stubEnv('VITE_API_BASE', 'https://newgbonhi.com/api/');
  try {
    expect(apiUrl('/lab-applications')).toBe('https://newgbonhi.com/api/lab-applications');
    expect(apiUrl('studio/login')).toBe('https://newgbonhi.com/api/studio/login');
  } finally { vi.unstubAllEnvs(); }
});
