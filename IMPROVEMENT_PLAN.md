# NewGbonhi Improvement Plan

This document outlines a roadmap for technical and functional enhancements to the NewGbonhi e-commerce platform.

## 1. State Management & Persistence
*   **[x] Reactive Cart Store:** Refactor `src/data/cart.js` to use Vue 3's `reactive` or `ref` APIs for seamless UI synchronization across `CartPanel` and `ProductGrid`.
*   **[x] LocalStorage Integration:** Implement automated state persistence so the user's shopping cart survives page refreshes and browser restarts.

## 2. Frontend Performance & UX
*   **[ ] Image Optimization Pipeline:** 
    *   Integrate `vite-plugin-image-optimizer` for automatic WebP conversion during build.
    *   Implement `loading="lazy"` on all product images in `ProductGrid.vue`.
*   **[ ] Discovery Features:**
    *   Add a search bar and category filters (e.g., "Cameleons", "Safe Babi Girl") to `ShopPage.vue`.
    *   Implement skeleton loaders to improve perceived performance during initial data fetch.

## 3. Checkout & Payment Enhancements
*   **[ ] Automated Order ID:** Generate a unique, human-readable order ID (e.g., `NG-2026-XXXX`) upon checkout to simplify tracking in the WhatsApp message and admin dashboard.
*   **[ ] Delivery Zone Selector:** Add a dropdown in `CheckoutPage.vue` for common delivery areas (Cocody, Plateau, etc.) with pre-configured fees to automate total price calculation.
*   **[ ] WhatsApp Message Templates:** Refine the `src/utils/checkout.js` logic to create a more professional, structured order summary for the merchant.

## 4. Admin & Security
*   **[ ] Enhanced Authentication:** Transition from simple password checks to **JSON Web Tokens (JWT)** for securing `OrdersPage.vue` and API endpoints.
*   **[ ] Config Validation:** Add a startup utility to verify required environment variables (`VITE_WHATSAPP_NUMBER`, `ADMIN_PASSWORD`, etc.) and log warnings if missing.
*   **[ ] Audit Logs:** (Optional) Implement basic logging for order status changes in the Cloudflare Worker/Durable Object.

## 5. Code Quality & Maintenance
*   **[ ] TypeScript Migration:** Progressively migrate core business logic (`cart.js`, `products.js`, `checkout.js`) to TypeScript to ensure type safety in price and order calculations.
*   **[ ] Global Error Handling:** Implement a robust error boundary in `App.vue` to handle API timeouts or network failures gracefully.
*   **[ ] Automated Testing:** Add Vitest for unit testing critical logic like cart calculations and order ID generation.

---
*Created: April 1, 2026*
