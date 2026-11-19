export const FACES_DROP_AT = "2026-12-19T18:00:00Z";
export const FACES_DROP_TIMESTAMP = Date.parse(FACES_DROP_AT);
export const FACES_PRIVATE_PARTY = {
  startsAt: "2026-12-19T17:00:00Z",
  endsAt: "2026-12-20T00:00:00Z",
  guestLimit: 30,
};
export const FACES_META = {
  title: "FACES — 19 décembre à 18 h | NewGbonhi",
  description: "Un détail aujourd'hui. Faces le 19 décembre 2026 à 18 h, heure d'Abidjan. Rejoins le Gbonhi pour découvrir les premiers aperçus de la collection.",
  image: "https://newgbonhi.com/faces/social-share.jpg",
};

export function getFacesCountdown(now = Date.now()) {
  const totalSeconds = Math.max(0, Math.ceil((FACES_DROP_TIMESTAMP - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: now >= FACES_DROP_TIMESTAMP,
  };
}
