import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import ShopPage from "./ShopPage.vue";
import LookbookPage from "./LookbookPage.vue";
import AboutPage from "./AboutPage.vue";
import ProductPage from "./ProductPage.vue";
import CheckoutPage from "./CheckoutPage.vue";
import OrdersPage from "./OrdersPage.vue";
import { applySeo } from "./utils/seo.js";
import { clearAppError } from "./utils/appError.js";

const routes = [
  {
    path: "/",
    name: "shop",
    component: ShopPage,
    meta: {
      title: "New Gbonhi Shop | Streetwear en Cote d'Ivoire",
      description:
        "New Gbonhi Shop: decouvre les pieces du drop, les nouveautes streetwear et les informations de commande.",
    },
  },
  {
    path: "/product/:slug",
    name: "product",
    component: ProductPage,
    meta: {
      title: "Produit | New Gbonhi Shop",
      description: "Details produit New Gbonhi Shop: visuels, tailles et prix.",
    },
  },
  {
    path: "/checkout",
    name: "checkout",
    component: CheckoutPage,
    meta: {
      title: "Checkout | New Gbonhi Shop",
      description: "Finalise ta commande New Gbonhi Shop.",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/orders",
    name: "orders",
    component: OrdersPage,
    meta: {
      title: "Orders | New Gbonhi Shop",
      description: "Espace administration des commandes.",
      robots: "noindex, nofollow",
    },
  },
  {
    path: "/lookbook",
    name: "lookbook",
    component: LookbookPage,
    meta: {
      title: "Lookbook | New Gbonhi Shop",
      description: "Lookbook officiel New Gbonhi Shop et direction visuelle des drops.",
    },
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
    meta: {
      title: "About | New Gbonhi Shop",
      description: "A propos de New Gbonhi Shop: vision, univers et infos de la marque.",
    },
  },
];

const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === "true";
const history = useHashRouter
  ? createWebHashHistory(import.meta.env.BASE_URL)
  : createWebHistory(import.meta.env.BASE_URL);

const router = createRouter({
  history,
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  clearAppError();
  applySeo({
    title: to.meta?.title,
    description: to.meta?.description,
    robots: to.meta?.robots,
    path: to.path,
  });
});

export default router;
