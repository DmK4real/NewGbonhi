const readEnv = (key, fallback = "") => {
  const value = String(import.meta.env[key] ?? "").trim();
  return value || fallback;
};

const DEFAULT_MOMO_WAVE = "Wave 07 89 53 83 88";
const DEFAULT_MOMO_ORANGE = "Orange 07 89 53 83 88";
const DEFAULT_MOMO_MTN = "MTN 05 04 31 53 31";
const DEFAULT_MOMO_WAVE_LINK = "https://pay.wave.com/m/M_ci_cNiKvg4QvKE3/c/ci/";
const DEFAULT_CONTACT_EMAIL = "newgbonhifamily@gmail.com";

const warnedMessages = new Set();

const warnOnce = (message) => {
  if (warnedMessages.has(message)) {
    return;
  }
  warnedMessages.add(message);
  console.warn(`[config] ${message}`);
};

export const checkoutConfig = {
  whatsappNumber: readEnv("VITE_WHATSAPP_NUMBER"),
  contactEmail: readEnv("VITE_CONTACT_EMAIL", DEFAULT_CONTACT_EMAIL),
  momoWave: readEnv("VITE_MOMO_WAVE", DEFAULT_MOMO_WAVE),
  momoOrange: readEnv("VITE_MOMO_ORANGE", DEFAULT_MOMO_ORANGE),
  momoMtn: readEnv("VITE_MOMO_MTN", DEFAULT_MOMO_MTN),
  momoMoov: readEnv("VITE_MOMO_MOOV"),
  momoAdditional: readEnv("VITE_MOMO_ADDITIONAL"),
  momoWaveLink: readEnv("VITE_MOMO_WAVE_LINK", DEFAULT_MOMO_WAVE_LINK),
  momoOrangeLink: readEnv("VITE_MOMO_ORANGE_LINK"),
  momoMtnLink: readEnv("VITE_MOMO_MTN_LINK"),
  paymentNote: readEnv(
    "VITE_PAYMENT_NOTE",
    "La production commence après validation du paiement. Livraison prévue sous 48/72 h."
  ),
};

export const validateFrontendConfig = () => {
  const missingRequired = [];

  if (!checkoutConfig.whatsappNumber) {
    missingRequired.push("VITE_WHATSAPP_NUMBER");
  }

  if (!checkoutConfig.contactEmail) {
    missingRequired.push("VITE_CONTACT_EMAIL");
  }

  if (missingRequired.length > 0) {
    warnOnce(
      `Missing required frontend env: ${missingRequired.join(", ")}. Checkout contact actions may be unavailable.`
    );
  }

  const paymentMethods = [
    checkoutConfig.momoWave,
    checkoutConfig.momoOrange,
    checkoutConfig.momoMtn,
    checkoutConfig.momoMoov,
    checkoutConfig.momoAdditional,
  ].filter(Boolean);

  if (paymentMethods.length === 0) {
    warnOnce(
      "No Mobile Money env values configured. Set at least one of VITE_MOMO_WAVE, VITE_MOMO_ORANGE, VITE_MOMO_MTN, VITE_MOMO_MOOV, or VITE_MOMO_ADDITIONAL."
    );
  }

  return {
    missingRequired,
    hasPaymentMethods: paymentMethods.length > 0,
  };
};
