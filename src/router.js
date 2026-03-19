import { createRouter, createWebHistory } from "vue-router";
import ShopPage from "./ShopPage.vue";
import LookbookPage from "./LookbookPage.vue";
import AboutPage from "./AboutPage.vue";
import ProductPage from "./ProductPage.vue";
import CheckoutPage from "./CheckoutPage.vue";
import OrdersPage from "./OrdersPage.vue";

const routes = [
  { path: "/", name: "shop", component: ShopPage },
  { path: "/product/:slug", name: "product", component: ProductPage },
  { path: "/checkout", name: "checkout", component: CheckoutPage },
  { path: "/orders", name: "orders", component: OrdersPage },
  { path: "/lookbook", name: "lookbook", component: LookbookPage },
  { path: "/about", name: "about", component: AboutPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
