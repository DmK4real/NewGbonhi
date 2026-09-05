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
  selectedColor?: string | null;
  selectedDesignName?: string | null;
  preorder?: boolean;
};

export type OrderFulfillment = {
  mode: string;
  paymentRequired: boolean;
  productionWindow: string;
  deliveryWindow: string;
};

export type BuildOrderMessageInput = {
  orderId?: string;
  customer: OrderCustomer;
  cartItems: OrderItem[];
  selectedShipping?: ShippingOption | null;
  shippingFee: number;
  totalWithShipping: number;
  fulfillment?: OrderFulfillment | null;
};

export const DEFAULT_PREORDER_FULFILLMENT: OrderFulfillment = {
  mode: "preorder",
  paymentRequired: true,
  productionWindow: "Production starts after payment confirmation",
  deliveryWindow: "48/72h after payment confirmation",
};

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "abidjan-cocody",
    label: "Cocody",
    fee: 2000,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-plateau",
    label: "Plateau",
    fee: 2500,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-yopougon",
    label: "Yopougon",
    fee: 3000,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-marcory",
    label: "Marcory",
    fee: 2000,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-bingerville",
    label: "Bingerville",
    fee: 3500,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-abobo",
    label: "Abobo",
    fee: 3500,
    eta: "48/72 h après paiement confirmé",
  },
  {
    id: "abidjan-other",
    label: "Other area in Abidjan",
    fee: 4000,
    eta: "48/72 h après paiement confirmé",
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
export const VITE_MOMO_WAVE_LINK = checkoutConfig.momoWaveLink;
export const VITE_MOMO_ORANGE_LINK = checkoutConfig.momoOrangeLink;
export const VITE_MOMO_MTN_LINK = checkoutConfig.momoMtnLink;
export const VITE_MOBILE_MONEY_API_ENABLED = checkoutConfig.mobileMoneyApiEnabled;
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

export const isValidCustomer = (customer: Partial<OrderCustomer> & { zip?: string } = {}): boolean => {
  const requiredFields = [
    customer.firstName,
    customer.lastName,
    customer.address,
    customer.city,
    customer.zip,
  ];
  const email = String(customer.email || "").trim();
  const phone = normalizeNumber(customer.phone);

  return (
    requiredFields.every((value) => String(value || "").trim().length > 0) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.length >= 8 &&
    phone.length <= 15
  );
};

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
  fulfillment,
}: BuildOrderMessageInput): string => {
  const preorderFulfillment = fulfillment || DEFAULT_PREORDER_FULFILLMENT;
  const shippingLine = selectedShipping
    ? `Delivery: ${selectedShipping.label} (${formatPrice(shippingFee)}) - Window: ${preorderFulfillment.deliveryWindow}`
    : "Delivery: -";
  const orderIdLine = orderId ? `Order ID: ${orderId}` : "";
  const lines = [
    "*NewGbonhi Preorder Summary*\n",
    orderIdLine,
    `*Customer Details*`,
    `Name: ${customer.firstName} ${customer.lastName}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Address: ${customer.address}, ${customer.city}`,
    shippingLine,
    "\n*Preorder Process*:",
    "1. Pay the item amount to confirm the preorder.",
    `2. ${preorderFulfillment.productionWindow}.`,
    `3. Delivery is planned in ${preorderFulfillment.deliveryWindow}.`,
    "4. Delivery fee is paid to the courier on arrival.",
    "\n*Order Items*:",
  ];

  cartItems.forEach((item) => {
    const details = [
      item.selectedSize || "",
      item.selectedColor ? `Color: ${item.selectedColor}` : "",
      item.selectedDesignName ? `Design: ${item.selectedDesignName}` : "",
    ].filter(Boolean);
    const detailText = details.length ? ` (${details.join(" | ")})` : "";
    lines.push(
      `- ${item.title}${detailText} x${item.qty} = ${formatPrice(
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
    lines.push("Please pay the item amount via Mobile Money to one of the following numbers:");
    lines.push(...paymentLines);
  } else {
    lines.push("Payment details will be confirmed on WhatsApp.");
  }
  lines.push(`\n${VITE_PAYMENT_NOTE}`);
  lines.push("Thank you for your preorder!");

  return lines.filter(Boolean).join("\n");
};
