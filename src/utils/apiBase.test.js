import { expect, it } from 'vitest';
import { normalizeApiBase } from './apiBase.js';
it.each(['', 'https://api.example.test', 'https://api.example.test/', 'https://api.example.test/api', 'https://api.example.test/api/'])('avoids duplicate /api paths for %s', value => {
  const base=normalizeApiBase(value);
  expect(`${base}/api/faces/state`).toBe(value ? 'https://api.example.test/api/faces/state' : '/api/faces/state');
  expect(`${base}/api/newsletter/subscribe`).toBe(value ? 'https://api.example.test/api/newsletter/subscribe' : '/api/newsletter/subscribe');
});
