import { FACES_CAMPAIGN as CAMPAIGN, FACES_PORTRAITS, facesCampaignPhase, facesRevealedCount } from "../../src/data/facesCampaign.js";
import { FACES_ASSETS, FACES_ASSETS_REVISION } from "./faces-assets.js";

const ROOT = "/api/faces";
const PREFIX = "faces.";
const WINNER = `${PREFIX}winner.private`;
const CLAIMED = `${PREFIX}winner.claimed`;
const DAY = 86400000;
// Every tile starts away from its correct position. These are server-only indices.
const SLOTS = [4, 7, 0, 8, 2, 6, 1, 5, 3];
const REVEAL_ORDER = [4, 3, 7, 1, 5, 0, 8, 2, 6];
const encoder = new TextEncoder();
const response = (status, payload, extra = {}) => new Response(JSON.stringify(payload), { status, headers: {
  "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra,
  "Access-Control-Allow-Origin": "*",
} });
const fail = (status, code) => { throw Object.assign(new Error(code), { status, code }); };
const sha = async text => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text))), x => x.toString(16).padStart(2, "0")).join("");
const random = () => crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");

async function body(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) fail(415, "invalid_request");
  const reader = request.body?.getReader();
  if (!reader) fail(400, "invalid_request");
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 4096) { await reader.cancel(); fail(413, "invalid_request"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail(400, "invalid_request");
    return parsed;
  } catch { fail(400, "invalid_request"); }
}

export class FacesCampaign {
  constructor(state, env) { this.state = state; this.storage = state.storage; this.env = env; }

  async tiles() {
    if (!this.tilePromise) this.tilePromise = (async () => {
      const secret = this.env.FACES_PUZZLE_SECRET || this.env.ADMIN_JWT_SECRET || this.env.ADMIN_PASSWORD;
      if (!secret) fail(503, "unavailable");
      const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return Promise.all(FACES_ASSETS.map(async tile => {
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${CAMPAIGN.id}:tile:${tile.portrait}:${tile.index}`));
        const id = Array.from(new Uint8Array(signature), x => x.toString(16).padStart(2, "0")).join("").slice(0, 40);
        const person = FACES_PORTRAITS.findIndex(x => x.id === tile.portrait);
        return { ...tile, id, day: REVEAL_ORDER.indexOf(tile.index) * 3 + person, slot: SLOTS[tile.index] };
      }));
    })();
    try { return await this.tilePromise; } catch (error) { this.tilePromise = null; throw error; }
  }

  async publicState(now = Date.now(), preview = "") {
    const phase = facesCampaignPhase(now);
    const count = facesRevealedCount(now);
    const previewQuery = preview ? `&preview=${encodeURIComponent(preview)}` : "";
    const tiles = await this.tiles();
    return {
      campaign: CAMPAIGN, serverNow: new Date(now).toISOString(), phase, revealedCount: count,
      nextRevealAt: count < 27 ? new Date(Date.parse(CAMPAIGN.startsAt) + count * DAY).toISOString() : null,
      preview: Boolean(preview), winnerClaimed: !preview && Boolean(await this.storage.get(CLAIMED)),
      portraits: FACES_PORTRAITS.map(person => {
        const slots = Array(9).fill(null);
        for (const tile of tiles.filter(x => x.portrait === person.id && x.day < count)) {
          slots[phase === "revealed" ? tile.index : tile.slot] = { id: tile.id, src: `${ROOT}/tiles/${tile.id}.webp?v=${FACES_ASSETS_REVISION}${previewQuery}` };
        }
        return { ...person, tiles: slots };
      }),
    };
  }

  async rate(key, limit, period) {
    const now = Date.now();
    const allowed = await this.storage.transaction(async tx => {
      const old = await tx.get(`${PREFIX}rate.${key}`);
      const next = old && now < old.until ? { ...old, count: old.count + 1 } : { count: 1, until: now + period };
      if (next.count > limit) return false;
      await tx.put(`${PREFIX}rate.${key}`, next);
      return true;
    });
    if (!allowed) fail(429, "rate_limited");
    if (!this.cleanupScheduled) {
      await this.storage.setAlarm(Date.parse(CAMPAIGN.deletePersonalDataAt));
      this.cleanupScheduled = true;
    }
  }

  async sendCode(email, code, challengeId) {
    const key = this.env.RESEND_API_KEY || this.env.RESEND_NEWSLETTER_API_KEY;
    if (!key) fail(503, "email_unavailable");
    const res = await fetch("https://api.resend.com/emails", {
      signal: AbortSignal.timeout(10000),
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `faces-access-${challengeId}` },
      body: JSON.stringify({
        from: this.env.NEWSLETTER_FROM_EMAIL || "NewGbonhi <news@newgbonhi.com>", to: [email],
        subject: "Ton code pour le défi FACES / Your FACES code",
        text: `Ton code FACES : ${code}\nValable 10 minutes. Ce code vérifie ton adresse pour le défi, sans t'inscrire à la newsletter.\n\nYour FACES code: ${code}\nValid for 10 minutes. This verifies your email for the challenge and does not subscribe you to our newsletter.\n\nTu n'as pas demandé ce code ? Ignore cet email. / Didn't request this code? Ignore this email.`,
      }),
    });
    if (!res.ok) fail(503, "email_unavailable");
  }

  async access(payload, ip) {
    const now = Date.now();
    if (now >= Date.parse(CAMPAIGN.contestClosesAt)) fail(409, "contest_closed");
    if (payload.website) return response(202, { challengeId: random() });
    if (payload.acceptRules !== true || payload.rulesVersion !== CAMPAIGN.rulesVersion) fail(400, "accept_rules");
    const email = String(payload.email || "").trim().toLowerCase();
    if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, "invalid_email");
    const emailHash = await sha(email);
    await this.rate(`code.ip.${ip}`, 5, 3600000);
    await this.rate(`code.email.${emailHash}`, 3, 3600000);
    await this.rate(`code.cooldown.${emailHash}`, 1, 60000);
    const challengeId = random();
    const number = new Uint32Array(1);
    crypto.getRandomValues(number);
    const code = String(number[0] % 100000000).padStart(8, "0");
    const key = `${PREFIX}otp.${challengeId}`;
    await this.storage.put(key, { email, emailHash, codeHash: await sha(`${challengeId}:${code}`), expires: now + 600000, attempts: 0, rulesVersion: CAMPAIGN.rulesVersion, acceptedAt: new Date(now).toISOString() });
    await this.storage.setAlarm(Date.parse(CAMPAIGN.deletePersonalDataAt));
    try { await this.sendCode(email, code, challengeId); }
    catch (error) { await this.storage.delete(key); throw error; }
    return response(202, { challengeId });
  }

  async verify(payload, ip) {
    if (Date.now() >= Date.parse(CAMPAIGN.contestClosesAt)) fail(409, "contest_closed");
    await this.rate(`verify.${ip}`, 20, 60000);
    const challengeId = String(payload.challengeId || "");
    if (!/^[a-f0-9]{64}$/.test(challengeId) || !/^\d{8}$/.test(String(payload.code || ""))) fail(400, "invalid_code");
    const digest = await sha(`${challengeId}:${payload.code}`);
    const token = random();
    const tokenHash = await sha(token);
    const valid = await this.storage.transaction(async tx => {
      const key = `${PREFIX}otp.${challengeId}`;
      const challenge = await tx.get(key);
      if (!challenge || Date.now() >= challenge.expires || challenge.attempts >= 5) return false;
      if (challenge.codeHash !== digest) { await tx.put(key, { ...challenge, attempts: challenge.attempts + 1 }); return false; }
      await tx.delete(key);
      await tx.put(`${PREFIX}session.${tokenHash}`, { email: challenge.email, emailHash: challenge.emailHash, rulesVersion: challenge.rulesVersion, acceptedAt: challenge.acceptedAt, expires: Date.parse(CAMPAIGN.contestClosesAt) });
      return true;
    });
    if (!valid) fail(400, "invalid_code");
    return response(200, { token, expiresAt: CAMPAIGN.contestClosesAt });
  }

  async submit(request, payload, ip) {
    const now = Date.now();
    if (now < Date.parse(CAMPAIGN.contestOpensAt)) fail(409, "contest_not_open");
    if (now >= Date.parse(CAMPAIGN.contestClosesAt)) fail(409, "contest_closed");
    await this.rate(`submit.ip.${ip}`, 30, 60000);
    const token = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
    if (!/^[a-f0-9]{64}$/.test(token)) fail(401, "verify_email");
    const session = await this.storage.get(`${PREFIX}session.${await sha(token)}`);
    if (!session || now >= session.expires) fail(401, "verify_email");
    await this.rate(`submit.email.${session.emailHash}`, 10, 60000);
    if (!(await this.solved(payload.boards))) return response(200, { complete: false });
    const result = await this.storage.transaction(async tx => {
      if (Date.now() >= Date.parse(CAMPAIGN.contestClosesAt)) fail(409, "contest_closed");
      const winner = await tx.get(WINNER);
      if (winner) return { complete: true, winner: winner.emailHash === session.emailHash, winnerClaimed: true, receipt: winner.emailHash === session.emailHash ? winner.receipt : null };
      const record = { email: session.email, emailHash: session.emailHash, completedAt: new Date().toISOString(), receipt: `FACES-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, rulesVersion: session.rulesVersion, acceptedAt: session.acceptedAt };
      await tx.put(WINNER, record);
      await tx.put(CLAIMED, true);
      return { complete: true, winner: true, winnerClaimed: true, receipt: record.receipt };
    });
    return response(200, result);
  }

  async solved(boards) {
    const tiles = await this.tiles();
    return FACES_PORTRAITS.every(person => {
      const answer = boards?.[person.id];
      return Array.isArray(answer) && answer.length === 9 && tiles.filter(tile => tile.portrait === person.id).every(tile => answer[tile.index] === tile.id);
    });
  }

  async cleanup() {
    if (Date.now() < Date.parse(CAMPAIGN.deletePersonalDataAt)) return;
    // Prefix-scoped even though this campaign uses its own Durable Object instance.
    while (true) {
      const entries = await this.storage.list({ prefix: PREFIX, limit: 128 });
      const keys = [...entries.keys()].filter(key => key !== CLAIMED);
      if (!keys.length) break;
      for (let i = 0; i < keys.length; i += 100) await this.storage.delete(keys.slice(i, i + 100));
    }
  }

  async handle(request, authorize) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    try {
      const preview = url.searchParams.get("preview");
      if (preview !== null && (!this.env.FACES_PREVIEW_KEY || preview !== this.env.FACES_PREVIEW_KEY)) fail(403, "preview_denied");
      const campaignNow = preview ? Date.parse(CAMPAIGN.contestOpensAt) : Date.now();
      if (request.method === "GET" && path === `${ROOT}/state`) return response(200, await this.publicState(campaignNow, preview));
      if (request.method === "GET" && path === `${ROOT}/winner`) {
        if (!(await authorize(request))) fail(401, "unauthorized");
        const winner = Date.now() < Date.parse(CAMPAIGN.deletePersonalDataAt) ? await this.storage.get(WINNER) : null;
        return response(200, { winner: winner ? { email: winner.email, completedAt: winner.completedAt, receipt: winner.receipt } : null });
      }
      if (request.method === "GET" && path.startsWith(`${ROOT}/tiles/`)) {
        const id = path.slice(`${ROOT}/tiles/`.length).replace(/\.webp$/, "");
        const tile = (await this.tiles()).find(item => item.id === id);
        if (!tile || tile.day >= facesRevealedCount(campaignNow)) fail(404, "not_found");
        const data = Uint8Array.from(atob(tile.data), char => char.charCodeAt(0));
        return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": preview ? "no-store" : "private, max-age=3600", "X-Content-Type-Options": "nosniff", "Access-Control-Allow-Origin": "*" } });
      }
      if (request.method !== "POST") fail(404, "not_found");
      const origin = request.headers.get("Origin");
      if (origin && !["https://newgbonhi.com", "https://www.newgbonhi.com", "capacitor://localhost", "https://localhost"].includes(origin) && !/^https:\/\/(?:[a-z0-9-]+\.)?newgbonhi\.pages\.dev$/.test(origin)) fail(403, "invalid_request");
      const payload = await body(request);
      if (preview) {
        if (path !== `${ROOT}/submit`) fail(404, "not_found");
        return response(200, { complete: await this.solved(payload.boards) });
      }
      const ip = await sha(request.headers.get("CF-Connecting-IP") || "unknown");
      if (path === `${ROOT}/access`) return await this.access(payload, ip);
      if (path === `${ROOT}/verify`) return await this.verify(payload, ip);
      if (path === `${ROOT}/submit`) return await this.submit(request, payload, ip);
      fail(404, "not_found");
    } catch (error) {
      return response(error.status || 503, { error: error.code || "unavailable" }, error.status === 429 ? { "Retry-After": "60" } : {});
    }
  }
}
