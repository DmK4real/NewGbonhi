import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrdersPage from "./OrdersPage.vue";
import { loadOrders } from "./data/orders.js";

vi.mock("./data/orders.js", () => ({
  adminLogin: vi.fn(),
  deleteOrder: vi.fn(),
  loadOrders: vi.fn(),
  syncGeniusPayPayment: vi.fn(),
  syncMobileMoneyPayment: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

function createPage(overrides = {}) {
  const page = {
    ...OrdersPage.data(),
    isAuthorized: true,
    adminToken: "test-session",
    $t: (key) => key,
    ...overrides,
  };
  for (const [name, method] of Object.entries(OrdersPage.methods)) {
    page[name] = method.bind(page);
  }
  Object.defineProperty(page, "filteredOrders", { get: () => OrdersPage.computed.filteredOrders.call(page) });
  return page;
}

describe("order admin tools", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("refreshes orders while keeping search and status filters", async () => {
    loadOrders.mockResolvedValue([{ id: "NG-2", status: "production" }]);
    const page = createPage({ orderSearch: "NG-2", activeStatusFilter: "production" });
    await page.refreshOrders();
    expect(loadOrders).toHaveBeenCalledWith("test-session");
    expect(page.filteredOrders).toEqual([{ id: "NG-2", status: "production" }]);
    expect(page.orderSearch).toBe("NG-2");
    expect(page.activeStatusFilter).toBe("production");
    expect(page.isLoading).toBe(false);
  });

  it("keeps the previous orders if refresh fails", async () => {
    loadOrders.mockRejectedValue(new Error("Network unavailable"));
    const page = createPage({ orders: [{ id: "NG-1" }] });
    await page.refreshOrders();
    expect(page.orders).toEqual([{ id: "NG-1" }]);
    expect(page.authError).toBe("Network unavailable");
    expect(page.isLoading).toBe(false);
  });

  it("ignores an old response when the admin session changes", async () => {
    let resolve;
    loadOrders.mockReturnValue(new Promise((done) => { resolve = done; }));
    const page = createPage();
    const refresh = page.refreshOrders();
    page.adminToken = "";
    page.isAuthorized = false;
    resolve([{ id: "NG-1" }]);
    await refresh;
    expect(page.orders).toEqual([]);
  });

  it.each([{ isAuthorized: false }, { isLoading: true }, { isSaving: true }])("does not refresh when unavailable: %j", async (state) => {
    const page = createPage(state);
    await page.refreshOrders();
    expect(loadOrders).not.toHaveBeenCalled();
  });

  it("downloads only filtered orders and releases the download URL", async () => {
    vi.useFakeTimers();
    const link = { click: vi.fn(), remove: vi.fn() };
    const createObjectURL = vi.fn(() => "blob:orders");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: () => link, body: { appendChild: vi.fn() } });
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const page = createPage({
      orders: [{ id: "NG-1", status: "sent" }, { id: "NG-2", status: "production" }],
      activeStatusFilter: "production",
    });
    page.exportOrders();
    const contents = await createObjectURL.mock.calls[0][0].text();
    expect(contents).toContain("NG-2");
    expect(contents).not.toContain("NG-1");
    expect(link.download).toMatch(/^newgbonhi-orders-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:orders");
  });

  it("does not export without authorization or matching orders", () => {
    const createElement = vi.fn();
    vi.stubGlobal("document", { createElement });
    createPage({ isAuthorized: false, orders: [{ id: "NG-1" }] }).exportOrders();
    createPage().exportOrders();
    expect(createElement).not.toHaveBeenCalled();
  });
});
