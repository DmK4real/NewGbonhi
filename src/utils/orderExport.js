import { stringify } from "csv-stringify/browser/esm/sync";

// One row per order keeps totals correct when a preorder has several items.
export function buildOrdersCsv(orders, { translate, formatStatus, formatPaymentStatus, formatPaymentProvider }) {
  const columns = [
    ["id", "orderId"],
    ["createdAt", "orderExportDate"],
    ["status", "orderExportStatus"],
    ["firstName", "firstName"],
    ["lastName", "lastName"],
    ["phone", "phone"],
    ["email", "email"],
    ["address", "address"],
    ["city", "city"],
    ["items", "orderExportItems"],
    ["provider", "paymentProvider"],
    ["paymentMethod", "paymentMethod"],
    ["paymentStatus", "paymentStatus"],
    ["reference", "paymentReferenceShort"],
    ["subtotal", "subtotal"],
    ["shipping", "delivery"],
    ["total", "total"],
  ].map(([key, label]) => ({
    key,
    header: `${translate(label)}${["subtotal", "shipping", "total"].includes(key) ? " (FCFA)" : ""}`,
  }));

  const rows = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    status: formatStatus(order.status),
    firstName: order.customer?.firstName,
    lastName: order.customer?.lastName,
    // Preserve country prefixes and leading zeros when opened in a spreadsheet.
    phone: order.customer?.phone ? `'${order.customer.phone}` : "",
    email: order.customer?.email,
    address: order.customer?.address,
    city: order.customer?.city,
    items: (order.items || []).map((item) => [
      `${item.title || ""} x${item.qty ?? 0}`,
      item.selectedSize,
      item.selectedColor,
      item.selectedDesignName,
    ].filter(Boolean).join(" / ")).join("\n"),
    provider: formatPaymentProvider(order.payment?.provider),
    paymentMethod: order.payment?.paymentMethod,
    paymentStatus: formatPaymentStatus(order.payment?.status),
    reference: order.payment?.reference,
    subtotal: order.subtotal,
    shipping: order.shipping?.fee ?? 0,
    total: order.total,
  }));

  return stringify(rows, {
    columns,
    header: true,
    bom: true,
    quoted_match: /[\r\n]/,
    delimiter: ";",
    record_delimiter: "\r\n",
    escape_formulas: true,
  });
}
