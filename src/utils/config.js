const readEnv = (key, fallback = "") => String(import.meta.env[key] ?? fallback).trim();

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
  contactEmail: readEnv("VITE_CONTACT_EMAIL"),
  momoWave: readEnv("VITE_MOMO_WAVE"),
  momoOrange: readEnv("VITE_MOMO_ORANGE"),
  momoMtn: readEnv("VITE_MOMO_MTN"),
  momoMoov: readEnv("VITE_MOMO_MOOV"),
  momoAdditional: readEnv("VITE_MOMO_ADDITIONAL"),
  paymentNote: readEnv("VITE_PAYMENT_NOTE", "Carte sur demande via WhatsApp."),
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
