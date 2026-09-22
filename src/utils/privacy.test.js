import { describe, it, expect } from 'vitest';
import { readConsent, CONSENT_MAX_AGE } from './privacy.js';
const storage = value => ({ getItem: () => JSON.stringify(value) });
describe('privacy consent', () => {
  it('requires an explicit current choice and preserves refusal', () => {
    expect(readConsent(storage(null), 100)).toBeNull();
    expect(readConsent(storage({ version: 1, analytics: false, savedAt: 0 }), 100)?.analytics).toBe(false);
    expect(readConsent(storage({ version: 1, analytics: true, savedAt: 0 }), CONSENT_MAX_AGE)).toBeNull();
    expect(readConsent(storage({ version: 1, analytics: 'true', savedAt: 0 }), 100)).toBeNull();
    expect(readConsent(storage({ version: 1, analytics: true, savedAt: 200 }), 100)).toBeNull();
  });
  it('works when browser storage is unavailable', () => {
    expect(readConsent({ getItem: () => { throw new Error('blocked'); } })).toBeNull();
  });
});
