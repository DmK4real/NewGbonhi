import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FacesCampaign } from './faces.js';
import worker, { OrdersStore } from './index.js';
import { FACES_CAMPAIGN as C, facesRevealedCount } from '../../src/data/facesCampaign.js';

class Storage {
  constructor() { this.map = new Map(); this.queue = Promise.resolve(); }
  async get(key) { return structuredClone(this.map.get(key)); }
  async put(key, value) { this.map.set(key, structuredClone(value)); }
  async delete(key) { for (const item of Array.isArray(key) ? key : [key]) this.map.delete(item); }
  async list({prefix}) { return new Map([...this.map].filter(([key]) => key.startsWith(prefix))); }
  async setAlarm(at) { this.alarm = at; }
  transaction(callback) {
    const run = this.queue.then(async () => {
      const tx = new Storage(); tx.map = structuredClone(this.map);
      const result = await callback(tx);
      this.map = tx.map;
      return result;
    });
    this.queue = run.catch(()=>{});
    return run;
  }
}
const env = { ADMIN_JWT_SECRET:'test-only-long-campaign-secret', RESEND_API_KEY:'mock-test-key' };
const at = date => vi.setSystemTime(new Date(date));
const req = (path, payload, token, ip='203.0.113.1') => new Request(`https://newgbonhi.com/api/faces/${path}`, {
  method: payload ? 'POST':'GET', headers:{ ...(payload ? {'Content-Type':'application/json'} : {}), ...(token ? { Authorization:`Bearer ${token}` } : {}), 'CF-Connecting-IP':ip },
  ...(payload ? { body: JSON.stringify(payload) } : {}),
});
let storage, api, emails;
beforeEach(() => {
  vi.useFakeTimers(); at('2026-11-19T18:00:00Z');
  storage = new Storage(); api = new FacesCampaign({storage}, env); emails = [];
  vi.stubGlobal('fetch', vi.fn(async (url, options) => { emails.push(JSON.parse(options.body)); return new Response(JSON.stringify({id:'mock-only'})); }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const handle = request => api.handle(request, async()=>false);
async function participant(email='player@example.test', ip='203.0.113.1') {
  const access = await handle(req('access', {email,acceptRules:true,rulesVersion:C.rulesVersion},null,ip));
  expect(access.status).toBe(202);
  const {challengeId} = await access.json();
  const code = emails.at(-1).text.match(/\d{8}/)[0];
  const verify = await handle(req('verify',{challengeId,code},null,ip));
  expect(verify.status).toBe(200);
  return { ...(await verify.json()), challengeId, code };
}
async function solution() {
  const tiles = await api.tiles();
  return Object.fromEntries(['leila','laury','isis'].map(id=>[id, tiles.filter(t=>t.portrait===id).sort((a,b)=>a.index-b.index).map(t=>t.id)]));
}

describe('Faces calendar and protected image delivery', () => {
  it('releases exactly one global fragment at each Abidjan 18:00 boundary, alternating Leila, Laury and Isis', async () => {
    const start = Date.parse(C.startsAt);
    for (let day=0;day<27;day++) {
      expect(facesRevealedCount(start+day*86400000-1)).toBe(day);
      const state = await api.publicState(start+day*86400000);
      expect(state.revealedCount).toBe(day+1);
      const expected = [0,1,2].map(i=>Math.max(0,Math.ceil((day+1-i)/3)));
      expect(state.portraits.map(p=>p.tiles.filter(Boolean).length)).toEqual(expected);
    }
    expect(facesRevealedCount(Date.parse(C.revealAt)+86400000)).toBe(27);
    expect(emails).toHaveLength(0);
  });
  it('does not deliver unreleased slices even when their opaque ID is known', async () => {
    const [tile] = (await api.tiles()).filter(t=>t.day===0);
    expect((await handle(req(`tiles/${tile.id}.webp`))).status).toBe(404);
    at(C.startsAt);
    const image = await handle(req(`tiles/${tile.id}.webp`));
    expect(image.status).toBe(200); expect(image.headers.get('Content-Type')).toBe('image/webp');
    expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(1000);
    const future = (await api.tiles()).find(t=>t.day===1);
    expect((await handle(req(`tiles/${future.id}.webp`))).status).toBe(404);
  });
  it('keeps solutions out of the public state until the J-1 reveal, regardless of request query dates', async () => {
    at('2026-12-16T18:00:00Z');
    const state = await (await handle(req('state?now=2099-01-01'))).json();
    const tiles = await api.tiles();
    for (const portrait of state.portraits) for (const tile of tiles.filter(t=>t.portrait===portrait.id)) expect(portrait.tiles[tile.index]?.id).not.toBe(tile.id);
    expect(JSON.stringify(state)).not.toMatch(/codeHash|emailHash|"index"|"data"|"slot"/);
    at(C.revealAt);
    const reveal = await api.publicState();
    expect(reveal.phase).toBe('revealed');
    for (const portrait of reveal.portraits) expect(portrait.tiles.map(t=>t.id)).toEqual((await solution())[portrait.id]);
  });
  it('isolates contest traffic from orders without changing order bindings', async () => {
    const calls=[];
    const binding={ idFromName:name=>(calls.push(name),name),get:()=>({fetch:async()=>new Response('{}')}) };
    await worker.fetch(req('state'),{ORDERS_STORE:binding});
    await worker.fetch(new Request('https://newgbonhi.com/api/health'),{ORDERS_STORE:binding});
    expect(calls).toEqual(['faces-campaign-2026','global']);
  });
});

describe('Faces verified participation', () => {
  it('sends only a requested verification code and makes it single-use, without subscribing anyone', async () => {
    const p = await participant();
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toEqual(['player@example.test']);
    expect(emails[0].text).toContain('sans t\'inscrire à la newsletter');
    expect((await handle(req('verify',{challengeId:p.challengeId,code:p.code}))).status).toBe(400);
    expect([...storage.map.keys()].some(k=>k.startsWith('newsletter'))).toBe(false);
    expect(storage.alarm).toBe(Date.parse(C.deletePersonalDataAt));
  });
  it('rejects incorrect codes, expires them after ten minutes, and caps guesses at five', async () => {
    const access = await (await handle(req('access',{email:'expiry@example.test',acceptRules:true,rulesVersion:C.rulesVersion}))).json();
    const correct = emails.at(-1).text.match(/\d{8}/)[0];
    for(let i=0;i<5;i++) expect((await handle(req('verify',{challengeId:access.challengeId,code:correct==='00000000'?'11111111':'00000000'}))).status).toBe(400);
    expect((await handle(req('verify',{challengeId:access.challengeId,code:correct}))).status).toBe(400);
    const fresh=await (await handle(req('access',{email:'fresh-expiry@example.test',acceptRules:true,rulesVersion:C.rulesVersion},null,'203.0.113.2'))).json();
    const freshCode=emails.at(-1).text.match(/\d{8}/)[0];
    at('2026-11-19T18:11:00Z');
    expect((await handle(req('verify',{challengeId:fresh.challengeId,code:freshCode},null,'203.0.113.2'))).status).toBe(400);
  });
  it('limits code requests by email and IP, validates rules and never emails honeypots', async () => {
    const payload={email:'limit@example.test',acceptRules:true,rulesVersion:C.rulesVersion};
    expect((await handle(req('access',{...payload,acceptRules:false}))).status).toBe(400);
    expect((await handle(req('access',{...payload,website:'spam'}))).status).toBe(202);
    expect(emails).toHaveLength(0);
    expect((await handle(req('access',payload))).status).toBe(202);
    expect((await handle(req('access',payload))).status).toBe(429);
    expect(emails).toHaveLength(1);
  });
  it('reports email failures without issuing an authenticated participant session', async () => {
    fetch.mockResolvedValue(new Response('{}',{status:503}));
    const reply=await handle(req('access',{email:'failure@example.test',acceptRules:true,rulesVersion:C.rulesVersion}));
    expect(reply.status).toBe(503);
    expect(await reply.json()).toEqual({error:'email_unavailable'});
    expect([...storage.map.keys()].some(k=>k.startsWith('faces.otp.')||k.startsWith('faces.session.'))).toBe(false);
  });
  it('rejects oversized bodies, untrusted origins and malformed JSON', async () => {
    expect((await handle(req('access',{email:'x'.repeat(5000)}))).status).toBe(413);
    const foreign = req('access',{}); foreign.headers.set('Origin','https://unrelated.example');
    expect((await handle(foreign)).status).toBe(403);
    const malformed=new Request('https://newgbonhi.com/api/faces/access',{method:'POST',headers:{'Content-Type':'application/json'},body:'null'});
    expect((await handle(malformed)).status).toBe(400);
  });
});

describe('Faces winner adjudication', () => {
  it('accepts the existing admin login token for winner access and rejects forged credentials', async () => {
    const adminEnv={...env,ADMIN_PASSWORD:'test-only-password'};
    const globalStore=new OrdersStore({storage:new Storage()},adminEnv);
    const login=await globalStore.fetch(new Request('https://newgbonhi.com/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:adminEnv.ADMIN_PASSWORD})}));
    const {token}=await login.json();
    await storage.put('faces.winner.private',{email:'winner@example.test',completedAt:'2026-12-17T18:00:01Z',receipt:'FACES-12345678'});
    const campaignStore=new OrdersStore({storage},adminEnv);
    expect((await campaignStore.fetch(req('winner',null,'forged'))).status).toBe(401);
    const authorized=await campaignStore.fetch(req('winner',null,token));
    expect(authorized.status).toBe(200);
    expect((await authorized.json()).winner.email).toBe('winner@example.test');
  });
  it('does not award a prize when validation crosses the closing time', async () => {
    const p=await participant(); const boards=await solution(); const tiles=await api.tiles();
    at('2026-12-18T17:59:59.999Z');
    vi.spyOn(api,'tiles').mockImplementation(async()=>{at(C.contestClosesAt);return tiles;});
    expect((await handle(req('submit',{boards},p.token))).status).toBe(409);
    expect(await storage.get('faces.winner.private')).toBeUndefined();
  });
  it('rejects early, late, unverified and incorrect submissions', async () => {
    const p=await participant(); const boards=await solution();
    expect((await handle(req('submit',{boards},p.token))).status).toBe(409);
    at(C.contestOpensAt);
    expect((await handle(req('submit',{boards},'f'.repeat(64)))).status).toBe(401);
    const wrong=structuredClone(boards); wrong.leila[0]=wrong.leila[1];
    expect(await (await handle(req('submit',{boards:wrong},p.token))).json()).toEqual({complete:false});
    expect(await storage.get('faces.winner.private')).toBeUndefined();
    at(C.contestClosesAt);
    expect((await handle(req('submit',{boards},p.token))).status).toBe(409);
    expect((await handle(req('access',{email:'late@example.test',acceptRules:true,rulesVersion:C.rulesVersion}))).status).toBe(409);
  });
  it('records exactly one winner under simultaneous correct submissions, survives restart and handles retries', async () => {
    const a=await participant('first@example.test','203.0.113.1');
    const b=await participant('second@example.test','203.0.113.2');
    const boards=await solution(); at(C.contestOpensAt);
    const replies=await Promise.all([handle(req('submit',{boards},a.token,'203.0.113.1')),handle(req('submit',{boards},b.token,'203.0.113.2'))]);
    const results=await Promise.all(replies.map(r=>r.json()));
    expect(results.filter(r=>r.winner)).toHaveLength(1);
    expect(results.every(r=>r.complete)).toBe(true);
    const winner=await storage.get('faces.winner.private');
    expect(winner.email).toBe('first@example.test');
    api=new FacesCampaign({storage},env);
    const retry=await (await handle(req('submit',{boards},a.token))).json();
    expect(retry.winner).toBe(true); expect(retry.receipt).toBe(winner.receipt);
    expect((await api.publicState()).winnerClaimed).toBe(true);
    const publicReply=JSON.stringify(await api.publicState()); expect(publicReply).not.toContain('first@example.test');
    expect((await handle(req('winner'))).status).toBe(401);
    const adminReply=await api.handle(req('winner'),async()=>true);
    expect((await adminReply.json()).winner.email).toBe('first@example.test');
  });
  it('removes contest personal data at retention expiry while preserving unrelated records and anonymous prize status', async () => {
    await storage.put('faces.winner.private',{email:'private@example.test'});
    await storage.put('faces.winner.claimed',true); await storage.put('orders.v1',[{id:'keep'}]);
    at(C.deletePersonalDataAt); await api.cleanup();
    expect(await storage.get('faces.winner.private')).toBeUndefined();
    expect(await storage.get('faces.winner.claimed')).toBe(true);
    expect(await storage.get('orders.v1')).toEqual([{id:'keep'}]);
    const store=new OrdersStore({storage},env); await store.alarm();
    expect(await storage.get('orders.v1')).toEqual([{id:'keep'}]);
  });
});
