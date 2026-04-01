import { checkoutConfig, validateFrontendConfig } from "./config.js";

export const SHIPPING_OPTIONS = [
  {
    id: "abidjan-cocody",
    label: "Cocody",
    fee: 2000,
    eta: "45 to 75 min",
  },
  {
    id: "abidjan-plateau",
    label: "Plateau",
    fee: 2500,
    eta: "35 to 60 min",
  },
  {
    id: "abidjan-yopougon",
    label: "Yopougon",
    fee: 3000,
    eta: "60 to 90 min",
  },
  {
    id: "abidjan-marcory",
    label: "Marcory",
    fee: 2000,
    eta: "35 to 60 min",
  },
  {
    id: "abidjan-bingerville",
    label: "Bingerville",
    fee: 3500,
    eta: "60 to 90 min",
  },
  {
    id: "abidjan-other",
    label: "Other area in Abidjan",
    fee: 4000,
    eta: "Quote confirmed on WhatsApp",
  },
];

validateFrontendConfig();

export const VITE_WHATSAPP_NUMBER = checkoutConfig.whatsappNumber;
export const VITE_CONTACT_EMAIL = checkoutConfig.contactEmail;
export const VITE_MOMO_WAVE = checkoutConfig.momoWave;
export const VITE_MOMO_ORANGE = checkoutConfig.momoOrange;
export const VITE_MOMO_MTN = checkoutConfig.momoMtn;
export const VITE_MOMO_MOOV = checkoutConfig.momoMoov;
export const VITE_MOMO_ADDITIONAL = checkoutConfig.momoAdditional;
export const VITE_PAYMENT_NOTE = checkoutConfig.paymentNote;

export const formatPrice = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }
  const formatted = new Intl.NumberFormat("fr-CI", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} FCFA`;
};

export const normalizeNumber = (value) =>
  String(value || "")
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");

export const formatPhoneDisplay = (value) => {
  const digits = normalizeNumber(value);
  if (!digits) {
    return "";
  }
  const local = digits.slice(-10);
  const grouped = local.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  if (digits.startsWith("225")) {
    return `225 ${grouped}`;
  }
  if (digits.length > 10) {
    const prefix = digits.slice(0, digits.length - 10);
    return `${prefix} ${grouped}`.trim();
  }
  return grouped;
};

export const buildOrderId = () => {
  // Generate a shorter, more readable ID
  const rand = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `NG-${rand}`;
};

export const buildOrderMessage = ({
  orderId,
  customer,
  cartItems,
  selectedShipping,
  shippingFee,
  totalWithShipping,
}) => {
  const shippingLine = selectedShipping
    ? `Delivery: ${selectedShipping.label} (${formatPrice(shippingFee)}) - ETA: ${selectedShipping.eta}`
    : "Delivery: -";
  const orderIdLine = orderId ? `Order ID: ${orderId}` : "";
  const lines = [
    "*NewGbonhi Order Summary*\n",
    orderIdLine,
    `*Customer Details*`,
    `Name: ${customer.firstName} ${customer.lastName}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Address: ${customer.address}, ${customer.city}`,
    shippingLine,
    "\n*Order Items*:",
  ];

  cartItems.forEach((item) => {
    const sizeText = item.selectedSize ? ` (${item.selectedSize})` : "";
    lines.push(
      `- ${item.title}${sizeText} x${item.qty} = ${formatPrice(
        item.qty * item.price
      )}`
    );
  });

  lines.push(`\n*Total: ${formatPrice(totalWithShipping)}*`);

  // Add payment instructions
  const paymentLines = [
    VITE_MOMO_WAVE && `- ${VITE_MOMO_WAVE.replace("Wave ", "Wave: ")}`,
    VITE_MOMO_ORANGE && `- ${VITE_MOMO_ORANGE.replace("Orange ", "Orange: ")}`,
    VITE_MOMO_MTN && `- ${VITE_MOMO_MTN.replace("MTN ", "MTN: ")}`,
    VITE_MOMO_MOOV && `- ${VITE_MOMO_MOOV.replace("Moov ", "Moov: ")}`,
    VITE_MOMO_ADDITIONAL &&
      `- ${VITE_MOMO_ADDITIONAL.replace("Mobile Money ", "Mobile Money: ")}`,
  ].filter(Boolean);

  lines.push("\n*Payment Instructions:*");
  if (paymentLines.length > 0) {
    lines.push("Please make your payment via Mobile Money to one of the following numbers:");
    lines.push(...paymentLines);
  } else {
    lines.push("Payment details will be confirmed on WhatsApp.");
  }
  lines.push(`\n${VITE_PAYMENT_NOTE}`);
  lines.push("Thank you for your order!");

  return lines.filter(Boolean).join("\n");
};
