<template>
  <footer class="site-footer" id="contact">
    <div class="footer-index"><span>ABIDJAN / CÔTE D’IVOIRE</span><span>INDEPENDENT CULTURE / SINCE 2024</span></div>
    <div class="footer-mark" aria-hidden="true">NEWGBONHI</div>
    <LanguageSwitch />
    <nav class="footer-sitemap" aria-label="Footer">
      <RouterLink to="/">{{ $t("navShop") }}</RouterLink>
      <RouterLink to="/lookbook">{{ $t("navLookbook") }}</RouterLink>
      <RouterLink to="/lab">{{ $t("navLab") }}</RouterLink>
      <RouterLink to="/studio">{{ $t("navStudio") }}</RouterLink>
      <RouterLink to="/about">{{ $t("navAbout") }}</RouterLink>
      <RouterLink to="/orders">{{ $t("navOrders") }}</RouterLink>
    </nav>
    <div class="footer-contact">
      <p>{{ $t("copyright") }}</p>
      <div class="footer-links">
        <a
          href="https://www.instagram.com/new.gbonhi?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a
          href="https://www.tiktok.com/@new_gbonhi0?is_from_webapp=1&sender_device=pc"
          target="_blank"
          rel="noopener noreferrer"
        >
          TikTok
        </a>
        <a href="mailto:hello@newgbonhi.com">Email</a>
      </div>
    </div>
    <PaymentMethods />
  </footer>
</template>

<script>
import PaymentMethods from "./PaymentMethods.vue";
import LanguageSwitch from "./LanguageSwitch.vue";

export default {
  name: "SiteFooter",
  components: {
    PaymentMethods,
    LanguageSwitch,
  },
};
</script>

<style scoped>
.site-footer {
  color: inherit;
  padding: 42px clamp(18px, 6vw, 72px) 28px;
  display: grid;
  grid-template-columns: minmax(80px, 1fr) auto minmax(80px, 1fr);
  align-items: end;
  justify-items: center;
  gap: 24px;
  text-align: center;
}

.footer-mark {
  grid-column: 1 / -1;
  width: 100%;
  overflow: hidden;
  border-bottom: 1px solid currentColor;
  padding-bottom: 18px;
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  font-size: clamp(48px, 12vw, 154px);
  line-height: .78;
  letter-spacing: -.055em;
  text-align: center;
  white-space: nowrap;
}

.footer-index {
  grid-column: 1 / -1;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font: 700 8px/1.2 monospace;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.site-footer :deep(.language-switch) {
  justify-self: start;
  align-self: end;
}


.footer-sitemap {
  grid-column: 1 / -1;
  width: 100%;
  padding-bottom: 22px;
  border-bottom: 1px solid currentColor;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 28px;
}

.footer-sitemap a {
  color: inherit;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 700;
}
.footer-contact {
  display: grid;
  gap: 12px;
  grid-column: 2;
}

.site-footer :deep(.payment-methods) {
  grid-column: 2;
}

.footer-contact p {
  margin: 0;
  color: inherit;
  opacity: 0.68;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
}

@media (max-width: 700px) {
  .site-footer {
    padding: 34px 18px 24px;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 18px;
  }

  .site-footer :deep(.language-switch) {
    justify-self: start;
  }

  .footer-contact,
  .site-footer :deep(.payment-methods) {
    grid-column: auto;
  }
  .footer-mark {
    width: 100%;
    overflow: visible;
    font-size: clamp(34px, 11vw, 58px);
    line-height: .9;
    letter-spacing: -.065em;
    white-space: nowrap;
  }
  .footer-index { align-items: flex-start; flex-direction: column; }
  .footer-sitemap { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); text-align: left; }
  .footer-sitemap a { min-width: 0; letter-spacing: .1em; overflow-wrap: anywhere; }
  .footer-links { width: 100%; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }
  .footer-links a { min-width: 0; font-size: 9px; letter-spacing: .1em; overflow-wrap: anywhere; }
}
</style>
