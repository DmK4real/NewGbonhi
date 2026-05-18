<template>
  <footer class="site-footer" id="contact">
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
    <LanguageSwitch />
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
  justify-items: center;
  gap: 24px;
  text-align: center;
}

.footer-contact {
  display: grid;
  gap: 12px;
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
  }
}
</style>
