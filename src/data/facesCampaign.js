// All campaign times are Abidjan time (UTC). Unlocks are enforced by the API.
export const FACES_CAMPAIGN = Object.freeze({
  id: "faces-2026",
  startsAt: "2026-11-20T18:00:00Z",
  contestOpensAt: "2026-12-17T18:00:00Z",
  contestClosesAt: "2026-12-18T18:00:00Z",
  revealAt: "2026-12-18T18:00:00Z",
  dropAt: "2026-12-19T18:00:00Z",
  deletePersonalDataAt: "2027-03-19T18:00:00Z",
  rulesVersion: "2026-11-19",
});

export const FACES_PORTRAITS = Object.freeze([
  { id: "leila", name: "Visage 1" },
  { id: "laury", name: "Visage 2" },
  { id: "isis", name: "Visage 3" },
]);

export function facesCampaignPhase(now) {
  if (now >= Date.parse(FACES_CAMPAIGN.revealAt)) return "revealed";
  if (now >= Date.parse(FACES_CAMPAIGN.contestOpensAt)) return "game";
  if (now < Date.parse(FACES_CAMPAIGN.startsAt)) return "upcoming";
  return "fragments";
}

export function facesRevealedCount(now) {
  return Math.min(27, Math.max(0, Math.floor((now - Date.parse(FACES_CAMPAIGN.startsAt)) / 86400000) + 1));
}
