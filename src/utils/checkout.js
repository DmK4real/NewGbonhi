export const SHIPPING_OPTIONS = [
  {
    id: "yango_distance",
    label: "Yango Delivery",
    fee: 0,
    eta: "Subject to availability",
  },
];

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
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NG-${stamp}-${rand}`;
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
    "NewGbonhi Order",
    orderIdLine,
    `Name: ${customer.firstName} ${customer.lastName}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Address: ${customer.address}, ${customer.city}`,
    shippingLine,
    "Items:",
  ];

  cartItems.forEach((item) => {
    const sizeText = item.selectedSize ? ` (${item.selectedSize})` : "";
    lines.push(
      `- ${item.title}${sizeText} x${item.qty} = ${formatPrice(
        item.qty * item.price
      )}`
    );
  });

  lines.push(`Total: ${formatPrice(totalWithShipping)}`);
  lines.push("Thank you.");
  return lines.filter(Boolean).join("\n");
};
