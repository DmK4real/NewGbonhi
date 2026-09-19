import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { privacy } = vi.hoisted(() => ({ privacy: { analytics: false } }));
vi.mock('./privacy.js', () => ({ privacy }));
let scripts, plausible;
beforeEach(() => {
  vi.resetModules(); privacy.analytics = false; scripts = [];
  plausible = vi.fn(); plausible.init = vi.fn();
  vi.stubEnv('VITE_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-test.js');
  vi.stubGlobal('window', { location: { origin: 'https://newgbonhi.com' }, plausible });
  vi.stubGlobal('document', { createElement: () => ({ remove: vi.fn() }), head: { appendChild: script => { scripts.push(script); script.onload(); } } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('consent-gated audience measurement', () => {
  it('never loads or sends before consent, or without configuration', async () => {
    await (await import('./analytics.js')).trackPage({ name: 'shop', path: '/' });
    expect(scripts).toHaveLength(0);
    privacy.analytics = true;
    vi.stubEnv('VITE_PLAUSIBLE_SCRIPT_URL', ''); vi.resetModules();
    await (await import('./analytics.js')).trackPage({ name: 'shop', path: '/' });
    expect(scripts).toHaveLength(0);
  });
  it('excludes private routes and redacts product slugs', async () => {
    privacy.analytics = true;
    const { trackPage } = await import('./analytics.js');
    await trackPage({ name: 'checkout', path: '/checkout', meta: { robots: 'noindex, nofollow' } });
    expect(scripts).toHaveLength(0);
    await trackPage({ name: 'product', path: '/product/example', query: { email: 'private@example.com' } });
    expect(plausible).toHaveBeenCalledExactlyOnceWith('pageview', { url: 'https://newgbonhi.com/product' });
    expect(plausible.init.mock.calls[0][0].autoCapturePageviews).toBe(false);
  });
  it('stops all future events on withdrawal, including provider callbacks', async () => {
    privacy.analytics = true;
    const { trackPage } = await import('./analytics.js');
    await trackPage({ name: 'shop', path: '/' });
    privacy.analytics = false;
    await trackPage({ name: 'about', path: '/about' });
    expect(plausible).toHaveBeenCalledTimes(1);
    expect(plausible.init.mock.calls[0][0].transformRequest({ u: 'anything' })).toBeNull();
  });
});
