export const SHIPPING_OPTIONS = [
  {
    id: "yango_distance",
    label: "Yango Delivery",
    fee: 0,
    eta: "Subject to availability",
  },
];

export const VITE_WHATSAPP_NUMBER = "0711115686";
export const VITE_CONTACT_EMAIL = "kouadiobhegnino@gmail.com";
export const VITE_MOMO_WAVE = "Wave 0700000000"; // Assuming from README example
export const VITE_MOMO_ORANGE = "Orange 0700000000"; // Assuming from README example
export const VITE_MOMO_MTN = "MTN 0500000000"; // Assuming from README example
export const VITE_MOMO_MOOV = "Moov 0100000000"; // Assuming from README example
export const VITE_MOMO_ADDITIONAL = "Mobile Money 0505201515"; // From user input
export const VITE_PAYMENT_NOTE = "Carte sur demande via WhatsApp.";

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
    ? `Delivery: ${selectedShipping.label} (${formatPrice(shippingFee)})`
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
  lines.push("\n*Payment Instructions:*");
  lines.push("Please make your payment via Mobile Money to one of the following numbers:");
  lines.push(`- ${VITE_MOMO_WAVE.replace('Wave ', 'Wave: ')}`);
  lines.push(`- ${VITE_MOMO_ORANGE.replace('Orange ', 'Orange: ')}`);
  lines.push(`- ${VITE_MOMO_MTN.replace('MTN ', 'MTN: ')}`);
  lines.push(`- ${VITE_MOMO_MOOV.replace('Moov ', 'Moov: ')}`);
  lines.push(`- ${VITE_MOMO_ADDITIONAL.replace('Mobile Money ', 'Mobile Money: ')}`);
  lines.push(`\n${VITE_PAYMENT_NOTE}`);
  lines.push("Thank you for your order!");

  return lines.filter(Boolean).join("\n");
};
