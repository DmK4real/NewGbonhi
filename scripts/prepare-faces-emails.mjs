import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("marketing/faces");
const { campaigns } = JSON.parse(await fs.readFile(path.join(root, "campaigns.json"), "utf8"));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const output = path.join(root, "emails");
await fs.mkdir(output, { recursive: true });
const previews = [];

for (const campaign of campaigns) {
  const image = campaign.image || "https://newgbonhi.com/faces/social-share.jpg";
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(campaign.subject)}</title>
<style>@media only screen and (max-width:620px){.shell{width:100%!important}.pad{padding-left:22px!important;padding-right:22px!important}.heading{font-size:38px!important}.cta{display:block!important;text-align:center!important}}</style></head>
<body style="margin:0;padding:0;background:#101010;font-family:Arial,Helvetica,sans-serif;color:#f5f5f1">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(campaign.preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#101010"><tr><td align="center" style="padding:24px 10px">
<table class="shell" role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;border:1px solid #444;background:#151515">
<tr><td class="pad" style="padding:24px 32px;border-bottom:1px solid #444;font-weight:800;font-size:18px;letter-spacing:1px">NEWGBONHI <span style="color:#ff746b">/ FACES</span></td></tr>
<tr><td class="pad" style="padding:36px 32px 28px"><p style="margin:0 0 22px;color:#ff746b;font-size:14px;font-weight:700;letter-spacing:1px">19.12.2026 / 18:00 ABIDJAN</p><h1 class="heading" style="margin:0;color:#f5f5f1;font-size:48px;line-height:1.02;letter-spacing:-2px">${escape(campaign.heading)}</h1></td></tr>
<tr><td><img src="${escape(image)}" alt="Faces, nouvelle collection NewGbonhi — le 19 décembre à 18 h, Abidjan" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
<tr><td class="pad" style="padding:28px 32px 36px">${campaign.paragraphs.map(text => `<p style="margin:0 0 18px;font-size:18px;line-height:1.6;color:#e0e0dc">${escape(text)}</p>`).join("")}
<p style="margin:28px 0 0"><a class="cta" href="${escape(campaign.url)}" style="display:inline-block;padding:18px 24px;background:#e10600;color:#fff;text-decoration:none;font-size:16px;font-weight:700">${escape(campaign.cta)}</a></p></td></tr>
<tr><td class="pad" style="padding:24px 32px;border-top:1px solid #444;color:#b8b8b4;font-size:14px;line-height:1.6">Tu reçois cet email parce que tu as rejoint la newsletter NewGbonhi.<br><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#f5f5f1;text-decoration:underline">Se désabonner</a><br><br>NEWGBONHI / ABIDJAN</td></tr>
</table></td></tr></table></body></html>`;
  const text = [campaign.heading, "", ...campaign.paragraphs.flatMap(paragraph => [paragraph, ""]), `${campaign.cta} : ${campaign.url}`, "", "Se désabonner : {{{RESEND_UNSUBSCRIBE_URL}}}"].join("\n");
  await fs.writeFile(path.join(output, `${campaign.id}.html`), html);
  await fs.writeFile(path.join(output, `${campaign.id}.txt`), text);
  const preview = html.replaceAll("https://newgbonhi.com/faces/social-share.jpg", "../../../public/faces/social-share.jpg");
  await fs.writeFile(path.join(output, `${campaign.id}-apercu.html`), preview);
  previews.push(`<li><a href="emails/${campaign.id}-apercu.html">${escape(campaign.subject)}</a>${campaign.needsFinalVisual ? " — visuel final à choisir" : ""}${campaign.requiresCollectionOpen ? " — à envoyer après ouverture effective" : ""}</li>`);
}
await fs.writeFile(path.join(root, "apercus.html"), `<!doctype html><html lang="fr"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FACES — brouillons des emails</title><style>body{max-width:800px;margin:60px auto;padding:24px;background:#101010;color:#f5f5f1;font:18px/1.6 Arial}a{color:#ff746b}li{margin:24px 0}</style><h1>FACES / Les emails</h1><p>Brouillons uniquement. Aucun envoi ni aucune programmation n'ont été effectués.</p><ul>${previews.join("")}</ul></html>`);
console.log(`Prepared ${campaigns.length} email drafts, plain text versions and local previews. No emails sent.`);
