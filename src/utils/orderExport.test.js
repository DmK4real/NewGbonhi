import { describe, expect, it } from "vitest";
import { buildOrdersCsv } from "./orderExport.js";
import { messages } from "../i18n.js";

const options = {
  translate: (key) => messages.fr[key] || key,
  formatStatus: (status) => status || "sent",
  formatPaymentStatus: (status) => status || "Unknown",
  formatPaymentProvider: (provider) => provider || "Unknown",
};

const order = {
  id: "NG-001",
  createdAt: "2026-09-07T10:00:00.000Z",
  status: "production",
  customer: {
    firstName: "Amélie",
    lastName: 'Kouamé; "Famille"',
    phone: "0700000000",
    address: "Rue 1\nPorte 2",
    city: "Abidjan",
  },
  items: [
    { title: "CAMO", qty: 2, selectedSize: "L", selectedColor: "Blanc" },
    { title: "City Tee", qty: 1, selectedSize: "M", selectedColor: "Noir", selectedDesignName: "Studio" },
  ],
  payment: { provider: "wave", status: "paid", reference: "REF-001" },
  subtotal: 30000,
  shipping: { fee: 1500 },
  total: 31500,
  paymentToken: "private-token",
};

describe("orders CSV export", () => {
  it("exports French headers, accents and numeric FCFA amounts", () => {
    const csv = buildOrdersCsv([order], options);
    expect(csv.startsWith("\uFEFFID commande;Date de commande (UTC)")).toBe(true);
    expect(csv).toContain("Prénom;Nom;Téléphone");
    expect(csv).toContain("Sous-total (FCFA);Livraison (FCFA);Total (FCFA)");
    expect(csv).toContain("Amélie");
    expect(csv).toContain(";'0700000000;");
    expect(csv).toContain(";30000;1500;31500\r\n");
    expect(csv).not.toContain("private-token");
  });

  it("keeps multiple items in one order row and escapes separators and newlines", () => {
    const csv = buildOrdersCsv([order], options);
    expect(csv).toContain('"Kouamé; ""Famille"""');
    expect(csv).toContain('"Rue 1\nPorte 2"');
    expect(csv).toContain('"CAMO x2 / L / Blanc\nCity Tee x1 / M / Noir / Studio"');
    expect(csv.match(/NG-001/g)).toHaveLength(1);
  });

  it.each(["=1+1", "+1+1", "-1+1", "@SUM(A1)"])("escapes spreadsheet formulas: %s", (value) => {
    const csv = buildOrdersCsv([{ ...order, customer: { firstName: value } }], options);
    expect(csv).toContain(`;'${value};`);
  });

  it("exports only supplied orders and supports missing optional fields", () => {
    const csv = buildOrdersCsv([{ id: "NG-002", subtotal: 0, total: 0 }], options);
    expect(csv).toContain("NG-002;");
    expect(csv).not.toContain("NG-001");
    expect(csv).not.toContain("undefined");
    expect(csv).toContain(";0;0;0\r\n");
  });
});
