import { describe, it, expect } from 'vitest';
import { createRateLimiter, validateCustomerContact, validateItems } from './guard.js';
import { OrdersStore } from './worker/index.js';
import { onRequest } from '../functions/_middleware.js';

const store = () => new OrdersStore({ storage: { get: async () => [], put: async () => {} } }, { ADMIN_PASSWORD: 'test-only-secret', STUDIO_PASSWORD: 'studio-only-secret' });
const request = (path, payload) => new Request(`https://example.com/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' }, body: JSON.stringify(payload) });

describe('public API protections', () => {
  it('limits repeated requests, separates clients and resets after expiry', () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 100 });
    expect(allow('a', 0)).toBe(true);
    expect(allow('a', 1)).toBe(true);
    expect(allow('a', 2)).toBe(false);
    expect(allow('b', 2)).toBe(true);
    expect(allow('a', 100)).toBe(true);
  });
  it('rejects malformed contact details and quantities', () => {
    expect(() => validateCustomerContact({ email: 'bad', phone: '0700000000' })).toThrow();
    expect(() => validateCustomerContact({ email: 'a@example.com', phone: 'abcdefgh' })).toThrow();
    expect(() => validateCustomerContact({ email: 'a@example.com', phone: '+225 07 00 00 00 00' })).not.toThrow();
    for (const qty of [-1, 0, 1.5, 101]) expect(() => validateItems([{ qty, price: 5000 }])).toThrow();
  });
  it('uses the configured admin secret and rejects incorrect passwords', async () => {
    const api = store();
    expect((await api.fetch(request('admin/login', { password: 'wrong' }))).status).toBe(401);
    expect((await api.fetch(request('admin/login', { password: 'test-only-secret' }))).status).toBe(200);
  });
  it('verifies Studio passwords on the server', async () => {
    const api = store();
    expect((await api.fetch(request('studio/login', { password: 'wrong' }))).status).toBe(401);
    expect((await api.fetch(request('studio/login', { password: 'studio-only-secret' }))).status).toBe(200);
  });
  it('does not expose or mutate an order without its payment token', async () => {
    const api = store();
    const order = { id: 'NG-test', status: 'paid', paymentToken: 'private-token', customer: { email: 'private@example.com' } };
    api.loadOrders = async () => [order];
    const denied = await api.fetch(request('orders/NG-test/report-payment', {}));
    expect(denied.status).toBe(403);
    expect(await denied.text()).not.toContain('private@example.com');
    expect((await api.fetch(request('orders/NG-test/report-payment', { paymentToken: 'private-token' }))).status).toBe(200);
  });
  it('rate-limits newsletter sends before calling the email provider', async () => {
    const api = store();
    for (let i = 0; i < 10; i++) expect((await api.fetch(request('newsletter/subscribe', { email: 'bad' }))).status).toBe(400);
    expect((await api.fetch(request('newsletter/subscribe', { email: 'bad' }))).status).toBe(429);
  });
});
describe('Pages routing and HTTPS', () => {
  const context = url => ({ request: new Request(url, { headers: { Accept: 'text/html' } }), next: async () => new Response('<html>app</html>', { headers: { 'Content-Type': 'text/html' } }) });
  it('redirects HTTP and www to the HTTPS canonical host', async () => {
    for (const url of ['http://newgbonhi.com/cgu?a=1', 'https://www.newgbonhi.com/cgu?a=1']) {
      const response = await onRequest(context(url));
      expect(response.status).toBe(301);
      expect(response.headers.get('Location')).toBe('https://newgbonhi.com/cgu?a=1');
    }
  });
  it('returns 404 for unknown pages and 200 for legal pages', async () => {
    expect((await onRequest(context('https://newgbonhi.com/missing'))).status).toBe(404);
    expect((await onRequest(context('https://newgbonhi.com/cgu'))).status).toBe(200);
    expect((await onRequest(context('https://newgbonhi.com/product/does-not-exist'))).status).toBe(404);
  });
});

describe('server-side commercial validation', () => {
  it('rejects forged prices and shipping fees before any order is saved', async () => {
    const api = store();
    const item = { title: 'T-SHIRT NEWGBONHI CAMO', qty: 1, price: 1, selectedSize: 'M' };
    const draft = { items: [item], shipping: { id: 'abidjan-cocody', fee: 2000 } };
    expect((await api.fetch(request('orders', draft))).status).toBe(400);
    draft.items[0].price = 13000;
    draft.shipping.fee = 0;
    const response = await api.fetch(request('orders', draft));
    expect(response.status).toBe(400);
    expect(await response.text()).toContain('delivery');
  });
});

describe('valid checkout flow', () => {
  it('accepts a catalog order with the shared delivery fee', async () => {
    const api = store();
    api.sendOrderStatusEmail = async () => {};
    api.sendOrderTeamEmail = async () => {};
    const response = await api.fetch(request('orders', {
      customer: { firstName: 'Test', lastName: 'Client', email: 'test@example.com', phone: '0700000000', address: 'Adresse de test', city: 'Abidjan', zip: '00000' },
      items: [{ title: 'T-SHIRT NEWGBONHI CAMO', qty: 2, price: 13000, selectedSize: 'M' }],
      shipping: { id: 'abidjan-cocody', label: 'Cocody', fee: 2000 }
    }));
    expect(response.status).toBe(201);
    expect((await response.json()).order.total).toBe(28000);
  });
});
