import { checkoutConfig, validateFrontendConfig } from "./config.js";

export type ShippingOption = {
  id: string;
  label: string;
  fee: number;
  eta: string;
};

export type OrderCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type OrderItem = {
  title: string;
  qty: number;
  price: number;
  selectedSize?: string | null;
};

export type BuildOrderMessageInput = {
  orderId?: string;
  customer: OrderCustomer;
  cartItems: OrderItem[];
  selectedShipping?: ShippingOption | null;
  shippingFee: number;
  totalWithShipping: number;
};

export const SHIPPING_OPTIONS: ShippingOption[] = [
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

export const formatPrice = (value: number): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }
  const formatted = new Intl.NumberFormat("fr-CI", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} FCFA`;
};

export const normalizeNumber = (value: string | number | null | undefined): string =>
  String(value || "")
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");

export const formatPhoneDisplay = (
  value: string | number | null | undefined
): string => {
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

export const buildOrderId = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NG-${year}-${rand}`;
};

export const buildOrderMessage = ({
  orderId,
  customer,
  cartItems,
  selectedShipping,
  shippingFee,
  totalWithShipping,
}: BuildOrderMessageInput): string => {
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
