<template>
  <div class="lab-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main>
      <section class="lab-hero">
        <div class="hero-copy">
          <div class="lab-index">
            <span>LAB / 001</span>
            <span>ABIDJAN / 05.3484° N</span>
          </div>
          <p class="eyebrow">{{ pageCopy.heroKicker }}</p>
          <h1>{{ pageCopy.heroTitle }}</h1>
          <p class="hero-sub">{{ pageCopy.heroSub }}</p>
          <div class="hero-actions">
            <a class="lab-button" href="#clients">
              {{ pageCopy.primaryCta }}
            </a>
            <RouterLink class="lab-button lab-button-light" to="/lab/arw-studio">
              {{ pageCopy.secondaryCta }}
            </RouterLink>
          </div>
        </div>

        <div class="hero-showcase" aria-label="NewGbonhi Lab showcase">
          <div class="showcase-meta">
            <span>Resident 001</span>
            <strong>ARW Studio</strong>
          </div>
          <div class="showcase-stage">
            <div class="showcase-board">
              <img
                class="showcase-logo showcase-logo-arw"
                :src="arwLogo"
                alt="ARW Film"
                decoding="async"
              />
              <span class="showcase-cross">x</span>
              <img
                class="showcase-logo showcase-logo-newgbonhi"
                :src="newgbonhiOval"
                alt="NewGbonhi"
                decoding="async"
              />
            </div>
            <img
              class="showcase-shirt"
              :src="cityWhiteTee"
              alt=""
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
            <img class="showcase-cup" :src="cupSticker" alt="" decoding="async" />
          </div>
          <div class="showcase-footer">
            <span>Drop 03</span>
            <span>Digital showroom</span>
          </div>
        </div>
      </section>

      <section id="clients" class="lab-explorer" aria-labelledby="lab-explorer-title">
        <div class="explorer-head">
          <div>
            <p class="eyebrow">LAB / 002 — {{ labContent.directoryKicker }}</p>
            <h2 id="lab-explorer-title">{{ labContent.directoryTitle }}</h2>
          </div>
          <RouterLink class="lab-button lab-button-light" to="/lab/arw-studio">
            {{ labContent.openResident }}
          </RouterLink>
        </div>
        <div class="discipline-filters" aria-label="Disciplines">
          <button
            v-for="filter in labContent.filters"
            :key="filter.id"
            type="button"
            :class="{ active: activeDiscipline === filter.id }"
            :aria-pressed="activeDiscipline === filter.id"
            @click="activeDiscipline = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="resident-grid">
          <component
            :is="resident.to ? 'RouterLink' : 'article'"
            v-for="resident in filteredResidents"
            :key="resident.name"
            :to="resident.to"
            class="resident-card"
          >
            <div class="resident-visual" :style="{ '--resident-color': resident.color }">
              <img :src="resident.image" :alt="resident.name" loading="lazy" decoding="async" />
              <span>{{ resident.code }}</span>
            </div>
            <div class="resident-info">
              <span class="status-dot">{{ resident.status }}</span>
              <h3>{{ resident.name }}</h3>
              <p>{{ resident.discipline }} · {{ resident.city }}</p>
            </div>
          </component>
        </div>
      </section>

      <section class="lab-projects" aria-labelledby="lab-projects-title">
        <div class="project-intro">
          <p class="eyebrow">ARCHIVE / 001 — {{ labContent.projectKicker }}</p>
          <h2 id="lab-projects-title">{{ labContent.projectTitle }}</h2>
          <p>{{ labContent.projectText }}</p>
        </div>
        <div class="project-grid">
          <RouterLink
            v-for="project in labProjects"
            :key="project.number"
            class="project-card"
            :to="project.to"
          >
            <span>{{ project.number }} / {{ project.status }}</span>
            <img :src="project.image" :alt="project.title" loading="lazy" decoding="async" />
            <div>
              <h3>{{ project.title }}</h3>
              <p>{{ project.credit }}</p>
            </div>
          </RouterLink>
        </div>
      </section>
      <section class="lab-shop" aria-labelledby="lab-shop-title">
        <div class="lab-shop-head">
          <div>
            <p class="eyebrow">DROP / 03 — SHOP CONNECTION</p>
            <h2 id="lab-shop-title">{{ labContent.shopTitle }}</h2>
          </div>
          <RouterLink class="lab-button lab-button-light" to="/#products">
            {{ labContent.shopCta }}
          </RouterLink>
        </div>
        <div class="lab-product-grid">
          <RouterLink
            v-for="product in labProducts"
            :key="product.slug"
            class="lab-product"
            :to="product.url"
          >
            <span>{{ product.creatorName }} / {{ product.tags?.[0] || "DROP 03" }}</span>
            <img :src="product.imagePrimary" :alt="product.title" loading="lazy" decoding="async" />
            <div>
              <strong>{{ product.title }}</strong>
              <em>{{ formatPrice(product.price) }}</em>
            </div>
          </RouterLink>
        </div>
      </section>
      <section class="lab-system" aria-labelledby="lab-system-title">
        <div class="section-heading">
          <p class="eyebrow">{{ pageCopy.systemKicker }}</p>
          <h2 id="lab-system-title">{{ pageCopy.systemTitle }}</h2>
        </div>
        <div class="system-grid">
          <article v-for="item in pageCopy.systemItems" :key="item.title">
            <span>{{ item.number }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section id="lab-services" class="client-directory" aria-labelledby="client-directory-title">
        <div class="directory-topline">
          <span>NEWGBONHI LAB</span>
          <RouterLink to="/lab/arw-studio">{{ pageCopy.directoryClose }}</RouterLink>
        </div>

        <div class="directory-body">
          <div class="directory-lead">
            <div>
              <p class="eyebrow">{{ pageCopy.indexKicker }}</p>
              <h2 id="client-directory-title">{{ pageCopy.indexTitle }}</h2>
            </div>
            <RouterLink class="directory-total" to="/lab/arw-studio">
              {{ pageCopy.liveListingLabel }}
              <span aria-hidden="true">></span>
            </RouterLink>
          </div>

          <div class="directory-block">
            <p class="directory-label">{{ pageCopy.liveClientsLabel }}</p>
            <div class="client-listing">
              <RouterLink
                v-for="client in clients"
                :key="client.name"
                class="client-row"
                :to="client.to"
              >
                <span>{{ client.kicker }}</span>
                <strong>{{ client.name }}</strong>
                <em>{{ client.meta }}</em>
                <b>{{ client.status }}</b>
              </RouterLink>
            </div>
          </div>

          <div class="directory-columns">
            <section>
              <h3>{{ pageCopy.clientCategoriesTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.clientCategories" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section>
              <h3>{{ pageCopy.clientCollectionsTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.clientCollections" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section>
              <h3>{{ pageCopy.featuredClientsTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.featuredClients" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
      <section class="lab-join" aria-labelledby="lab-join-title">
        <div class="join-intro">
          <p class="eyebrow">OPEN CALL / 2026</p>
          <h2 id="lab-join-title">{{ labContent.joinTitle }}</h2>
          <p>{{ labContent.joinText }}</p>
        </div>
        <form class="join-form" @submit.prevent="submitOpenCall">
          <label>
            <span>{{ labContent.formName }}</span>
            <input v-model.trim="openCall.name" type="text" required />
          </label>
          <label>
            <span>{{ labContent.formEmail }}</span>
            <input v-model.trim="openCall.email" type="email" autocomplete="email" required />
          </label>
          <label>
            <span>{{ labContent.formDiscipline }}</span>
            <select v-model="openCall.discipline" required>
              <option value="" disabled>{{ labContent.formChoose }}</option>
              <option v-for="filter in labContent.filters.slice(1)" :key="filter.id" :value="filter.label">
                {{ filter.label }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ labContent.formCity }}</span>
            <input v-model.trim="openCall.city" type="text" required />
          </label>
          <label>
            <span>{{ labContent.formLink }}</span>
            <input v-model.trim="openCall.link" type="url" placeholder="https://" required />
          </label>
          <label class="join-form-wide">
            <span>{{ labContent.formPitch }}</span>
            <textarea v-model.trim="openCall.pitch" rows="4" maxlength="600" required></textarea>
          </label>
          <label class="join-honeypot" aria-hidden="true">
            <span>Company</span>
            <input v-model="openCall.company" type="text" tabindex="-1" autocomplete="off" />
          </label>
          <button class="lab-button" type="submit" :disabled="isSubmittingOpenCall">
            {{ isSubmittingOpenCall ? labContent.formSending : labContent.joinCta }}
          </button>
          <p v-if="openCallMessage" class="join-message" :class="{ 'is-error': openCallError }" :role="openCallError ? 'alert' : 'status'">{{ openCallMessage }}</p>
        </form>
      </section>
      <section class="lab-agenda" aria-labelledby="lab-agenda-title">
        <div class="agenda-heading">
          <div>
            <p class="eyebrow">{{ labContent.agendaKicker }}</p>
            <h2 id="lab-agenda-title">{{ labContent.agendaTitle }}</h2>
          </div>
          <span>AGENDA / 2026</span>
        </div>
        <div class="agenda-list">
          <article v-for="event in agendaEntries" :key="event.code" class="agenda-row">
            <time :datetime="event.datetime">{{ event.date }}</time>
            <div>
              <span>{{ event.code }} / {{ event.type }}</span>
              <strong>{{ event.title }}</strong>
            </div>
            <span>{{ event.place }} · {{ event.status }}</span>
            <RouterLink :to="event.to">{{ event.cta }} ↗</RouterLink>
          </article>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
import { products } from "./data/products.ts";
import { i18nState } from "./i18n.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const arwLogo = new URL("./assets/ARW FILM.png", import.meta.url).href;
const newgbonhiOval = new URL("./assets/NEW GBONHI OVAL.png", import.meta.url).href;
const cityWhiteTee = new URL(
  "./assets/ARW FILM CITY TEE WHITE FRONT CUTOUT.png",
  import.meta.url
).href;
const cupSticker = new URL("./assets/ARW FILM CUP STICKER.png", import.meta.url).href;

const pageCopies = {
  en: {
    heroKicker: "Collective platform",
    heroTitle: "NewGbonhi Lab",
    heroSub:
      "A digital showroom for the NewGbonhi collective: a place to reference, present, and promote clothing, graphics, music, skate projects, design work, and independent creative drops.",
    primaryCta: "Browse clients",
    secondaryCta: "Open ARW Studio",
    systemKicker: "Platform logic",
    systemTitle: "The Lab is built like a digital concept store",
    systemItems: [
      {
        number: "01",
        title: "Reference",
        text: "Each client gets a focused room with identity, discipline, current project, and direct room access.",
      },
      {
        number: "02",
        title: "Present",
        text: "Drops are shown with the visual language behind them, not just a product thumbnail.",
      },
      {
        number: "03",
        title: "Connect",
        text: "Visitors can discover the talent and move directly toward orders, contact, or collaboration.",
      },
    ],
    residentKicker: "Resident 001",
    residentTitle: "ARW Studio",
    residentText:
      "ARW Studio opens the Lab through the Drop 03 collaboration. The room keeps the capsule, graphic identity, and film energy together so the project feels like a complete universe.",
    residentFacts: [
      { label: "Discipline", value: "Graphic direction / film identity" },
      { label: "Current project", value: "Drop 03 ARW Film collab" },
      { label: "Location", value: "Abidjan" },
    ],
    residentPrimary: "Open ARW room",
    residentSecondary: "Contact",
    arwMeta: "Graphic direction / film identity / Drop 03",
    liveLabel: "Live",
    directoryClose: "Resident focus",
    liveListingLabel: "1 live client",
    liveClientsLabel: "Live clients",
    indexKicker: "Client index",
    indexTitle: "Clients referenced in the Lab",
    clientCategoriesTitle: "Categories",
    clientCollectionsTitle: "Collections",
    featuredClientsTitle: "Featured clients",
    clientCategories: [
      "Clothing labels",
      "Graphic studios",
      "Beatmakers",
      "Skaters",
      "Design artists",
      "Photographers",
    ],
    clientCollections: [
      "Just opened",
      "New rooms",
      "Collab drops",
      "Studio profiles",
      "Local picks",
      "Archive projects",
    ],
    featuredClients: [
      "ARW Studio",
      "NewGbonhi Collective",
      "Graphic artists",
      "Beatmakers",
      "Skaters",
      "Designers",
    ],
  },
  fr: {
    heroKicker: "Plateforme collective",
    heroTitle: "NewGbonhi Lab",
    heroSub:
      "Une vitrine digitale pour le collectif NewGbonhi : un espace pour referencer, presenter et promouvoir vetements, graphisme, musique, skate, design et projets creatifs independants.",
    primaryCta: "Voir les clients",
    secondaryCta: "Ouvrir ARW Studio",
    systemKicker: "Logique plateforme",
    systemTitle: "Le Lab fonctionne comme un concept-store digital",
    systemItems: [
      {
        number: "01",
        title: "Referencer",
        text: "Chaque client a une room claire avec identite, discipline, projet en cours et acces direct a son univers.",
      },
      {
        number: "02",
        title: "Presenter",
        text: "Les drops gardent leur univers visuel complet, pas seulement une miniature produit.",
      },
      {
        number: "03",
        title: "Connecter",
        text: "Les visiteurs peuvent decouvrir le talent puis aller vers une commande, un contact ou une collaboration.",
      },
    ],
    residentKicker: "Resident 001",
    residentTitle: "ARW Studio",
    residentText:
      "ARW Studio ouvre le Lab avec la collaboration Drop 03. La room rassemble la capsule, l'identite graphique et l'energie film pour presenter le projet comme un vrai univers.",
    residentFacts: [
      { label: "Discipline", value: "Direction graphique / identite film" },
      { label: "Projet actuel", value: "Drop 03 ARW Film collab" },
      { label: "Base", value: "Abidjan" },
    ],
    residentPrimary: "Ouvrir la room ARW",
    residentSecondary: "Contact",
    arwMeta: "Direction graphique / identite film / Drop 03",
    liveLabel: "Live",
    directoryClose: "Focus resident",
    liveListingLabel: "1 client live",
    liveClientsLabel: "Clients live",
    indexKicker: "Index clients",
    indexTitle: "Clients references dans le Lab",
    clientCategoriesTitle: "Categories",
    clientCollectionsTitle: "Collections",
    featuredClientsTitle: "Clients en avant",
    clientCategories: [
      "Marques vetement",
      "Studios graphiques",
      "Beatmakers",
      "Skaters",
      "Design artists",
      "Photographes",
    ],
    clientCollections: [
      "Just opened",
      "Nouvelles rooms",
      "Collab drops",
      "Profils studio",
      "Local picks",
      "Archives projets",
    ],
    featuredClients: [
      "ARW Studio",
      "NewGbonhi Collective",
      "Graphistes",
      "Beatmakers",
      "Skaters",
      "Designers",
    ],
  },
};

export default {
  name: "LabPage",
  components: {
    SiteHeader,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      arwLogo,
      newgbonhiOval,
      cityWhiteTee,
      cupSticker,
      cartOpen: false,
      activeDiscipline: "all",
      openCall: {
        name: "",
        email: "",
        discipline: "",
        city: "Abidjan",
        link: "",
        pitch: "",
        company: "",
      },
      openCallMessage: "",
      openCallError: false,
      isSubmittingOpenCall: false,
    };
  },
  computed: {
    labContent() {
      const fr = i18nState.language === "fr";
      return {
        directoryKicker: fr ? "Repertoire creatif / Abidjan" : "Creative directory / Abidjan",
        directoryTitle: fr ? "Les residents du Lab" : "Lab residents",
        openResident: fr ? "Ouvrir la room 001" : "Open room 001",
        filters: [
          { id: "all", label: fr ? "Tous" : "All" }, { id: "fashion", label: fr ? "Mode" : "Fashion" },
          { id: "graphic", label: fr ? "Graphisme" : "Graphics" }, { id: "film", label: "Film" },
          { id: "music", label: fr ? "Musique" : "Music" }, { id: "skate", label: "Skate" },
          { id: "photo", label: fr ? "Photographie" : "Photography" },
          { id: "design", label: "Design" },
          { id: "archive", label: "Archive" },
        ],
        projectKicker: fr ? "Projets recents" : "Recent projects",
        projectTitle: fr ? "Le travail avant les discours" : "Work before words",
        projectText: fr ? "Chaque room rassemble une identite, un processus, des objets et les personnes qui construisent le projet." : "Every room brings together an identity, a process, objects and the people building the project.",
        joinTitle: fr ? "Propose ton projet au Lab" : "Submit your project to the Lab",
        joinText: fr ? "Marque, graphiste, musicien, skater, realisateur ou designer : envoie une presentation courte, un lien et quelques visuels." : "Label, graphic artist, musician, skater, filmmaker or designer: send a short presentation, one link and a few visuals.",
        joinCta: fr ? "Candidater par email" : "Apply by email",
        formName: fr ? "Nom / projet" : "Name / project",
        formEmail: "Email",
        formDiscipline: "Discipline",
        formChoose: fr ? "Choisir" : "Choose",
        formCity: fr ? "Ville" : "City",
        formLink: "Instagram / portfolio",
        formPitch: fr ? "Presentation courte" : "Short presentation",
        formSending: fr ? "Envoi en cours..." : "Sending...",
        formReady: fr ? "Candidature envoyee. Nous te repondrons par email." : "Application sent. We will reply by email.",
        formError: fr ? "L'envoi a echoue. Reessaie dans un instant." : "Unable to send. Please try again shortly.",
        agendaKicker: fr ? "Agenda du collectif" : "Collective agenda",
        agendaTitle: fr ? "Prochainement a Abidjan" : "Coming up in Abidjan",
        agendaEvent: fr ? "Pop-up NewGbonhi Lab" : "NewGbonhi Lab pop-up",
        soon: fr ? "Date a annoncer" : "Date to be announced",
        shopTitle: fr ? "Les objets issus du Lab" : "Objects from the Lab",
        shopCta: fr ? "Voir toute la collection" : "View the full collection",
      };
    },
    residents() {
      return [
        { code: "001", name: "ARW Studio", discipline: "Graphic direction / Film", city: "Abidjan", status: "LIVE", category: ["graphic", "film", "fashion"], color: "#e10600", image: this.cityWhiteTee, to: "/lab/arw-studio" },
        { code: "002", name: "NewGbonhi Collective", discipline: "Fashion / Culture", city: "Abidjan", status: "INDEX", category: ["fashion"], color: "#c7ff00", image: this.newgbonhiOval },
        { code: "003", name: "Open Residency", discipline: "Music / Skate / Visual arts", city: "Abidjan", status: "OPEN CALL", category: ["music", "skate", "graphic", "photo", "design", "archive"], color: "#5b61ff", image: this.arwLogo },
      ];
    },
    filteredResidents() {
      if (this.activeDiscipline === "all") return this.residents;
      return this.residents.filter((resident) => resident.category.includes(this.activeDiscipline));
    },
    labProjects() {
      const fr = i18nState.language === "fr";
      return [
        { number: "P001", status: "LIVE", title: "ARW Film x NewGbonhi", credit: fr ? "Direction ARW Studio · Capsule Drop 03" : "ARW Studio direction · Drop 03 capsule", image: this.cityWhiteTee, to: "/lab/arw-studio" },
        { number: "P002", status: "ARCHIVE", title: "NewGbonhi Visual Index", credit: fr ? "Identite · objets · archives" : "Identity · objects · archives", image: this.newgbonhiOval, to: "/lookbook" },
      ];
    },
    labProducts() {
      return products
        .filter((product) => product.creatorName === "ARW Studio")
        .slice(0, 4);
    },
    agendaEntries() {
      const fr = i18nState.language === "fr";
      return [
        {
          code: "A001",
          type: "DROP",
          date: fr ? "EN COURS" : "NOW",
          datetime: "2026",
          title: fr ? "Précommandes Drop 03 / ARW Film" : "Drop 03 / ARW Film preorders",
          place: "ONLINE / ABIDJAN",
          status: fr ? "OUVERT" : "OPEN",
          cta: fr ? "Voir le drop" : "View drop",
          to: "/#products",
        },
        {
          code: "A002",
          type: "OPEN CALL",
          date: "2026",
          datetime: "2026",
          title: fr ? "Résidence NewGbonhi Lab" : "NewGbonhi Lab residency",
          place: "ABIDJAN",
          status: fr ? "CANDIDATURES OUVERTES" : "APPLICATIONS OPEN",
          cta: fr ? "Candidater" : "Apply",
          to: "/lab#lab-join-title",
        },
        {
          code: "A003",
          type: "POP-UP",
          date: "TBA",
          datetime: "2026",
          title: fr ? "Rencontre NewGbonhi Lab" : "NewGbonhi Lab gathering",
          place: "ABIDJAN",
          status: fr ? "DATE À ANNONCER" : "DATE TO BE ANNOUNCED",
          cta: fr ? "Suivre le Journal" : "Follow the Journal",
          to: "/lookbook",
        },
      ];
    },
    pageCopy() {
      return pageCopies[i18nState.language] || pageCopies.en;
    },
    cartCount() {
      return cartStore.cartCount.value;
    },
    clients() {
      return [
        {
          name: "ARW Studio",
          kicker: this.pageCopy.residentKicker,
          meta: this.pageCopy.arwMeta,
          status: this.pageCopy.liveLabel,
          to: "/lab/arw-studio",
        },
      ];
    },
  },
  methods: {
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    formatPrice(value) {
      return new Intl.NumberFormat("fr-CI", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    },
    async submitOpenCall() {
      if (this.isSubmittingOpenCall) return;

      this.isSubmittingOpenCall = true;
      this.openCallMessage = "";
      this.openCallError = false;

      try {
        const response = await fetch("/api/lab-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.openCall),
        });

        if (!response.ok) throw new Error("Lab application rejected");

        this.openCall = {
          name: "",
          email: "",
          discipline: "",
          city: "Abidjan",
          link: "",
          pitch: "",
          company: "",
        };
        this.openCallMessage = this.labContent.formReady;
      } catch {
        this.openCallError = true;
        this.openCallMessage = this.labContent.formError;
      } finally {
        this.isSubmittingOpenCall = false;
      }
    },
  },
};
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Space Grotesk", Arial, sans-serif;
  background: #f5f5f5;
  color: #0b0b0b;
}

.lab-page {
  --text: #0b0b0b;
  --muted: #646464;
  --accent: #e10600;
  --line: #0b0b0b;

  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  position: relative;
  z-index: 0;
}

.lab-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.045),
      rgba(0, 0, 0, 0.045) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.045),
      rgba(0, 0, 0, 0.045) 1px,
      transparent 1px,
      transparent 48px
    );
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  animation: rise 0.55s ease both;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.brand-name {
  margin: 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-tagline {
  margin: 2px 0 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--muted);
}

.shop-nav {
  display: flex;
  gap: 18px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

.shop-nav::-webkit-scrollbar {
  display: none;
}

.shop-nav a {
  color: inherit;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.shop-nav a.is-active {
  border-color: var(--accent);
}

.shop-cta {
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 16px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shop-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

main {
  display: grid;
  gap: 26px;
  margin-top: 32px;
}

.lab-hero,
.lab-system,
.client-directory {
  animation: rise 0.65s ease both;
}

.lab-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 18px;
  min-height: 560px;
}

.hero-copy,
.hero-showcase,
.lab-system {
  border: 1px solid var(--line);
  border-radius: var(--ng-radius);
  background: #fff;
}

.lab-index {
  margin-bottom: 30px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid rgba(11, 11, 11, 0.2);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font: 700 9px/1.2 monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-copy {
  padding: clamp(26px, 5vw, 52px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 10px;
  font-weight: 800;
}

.hero-copy h1 {
  margin: 14px 0 16px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(46px, 7vw, 88px);
  line-height: 0.9;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero-sub {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.lab-button {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 12px 18px;
  min-height: 44px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ng-radius);
  transition: background-color 0.18s ease, color 0.18s ease;
}

.lab-button:hover {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.lab-button-light {
  background: #fff;
  color: #0b0b0b;
}

.hero-showcase {
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.12), transparent 32%),
    #0b0b0b;
  color: #fff;
}

.showcase-meta,
.showcase-footer {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
}

.showcase-meta {
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.showcase-meta strong {
  color: #fff;
}

.showcase-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}

.showcase-stage {
  min-height: 430px;
  position: relative;
  overflow: hidden;
}

.showcase-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.08) 1px,
      transparent 1px,
      transparent 46px
    );
}

.showcase-board {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  width: min(420px, 66%);
  min-height: 150px;
  padding: clamp(18px, 3vw, 28px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: var(--ng-radius);
  background: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(12px, 2vw, 24px);
  overflow: hidden;
  box-shadow: 0 28px 40px rgba(0, 0, 0, 0.26);
}

.showcase-logo {
  position: static;
  z-index: 2;
  width: 100%;
  max-height: 88px;
  object-fit: contain;
  filter: none;
}

.showcase-logo-arw {
  justify-self: end;
}

.showcase-logo-newgbonhi {
  justify-self: start;
}

.showcase-cross {
  position: static;
  z-index: 3;
  color: #0b0b0b;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(16px, 2vw, 24px);
  line-height: 1;
  text-transform: uppercase;
}

.showcase-shirt {
  position: absolute;
  right: -2%;
  bottom: -8%;
  z-index: 2;
  width: min(450px, 66%);
  filter: drop-shadow(0 26px 32px rgba(0, 0, 0, 0.42));
}

.showcase-cup {
  position: absolute;
  right: 8%;
  top: 12%;
  z-index: 4;
  width: min(88px, 16%);
  transform: rotate(8deg);
  filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.28));
}

.lab-system {
  padding: 24px;
}

.section-heading {
  display: grid;
  gap: 9px;
}

.section-heading h2 {
  margin: 0;
  max-width: 760px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(22px, 3vw, 34px);
  line-height: 1.05;
}

.system-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid rgba(0, 0, 0, 0.16);
}

.system-grid article {
  min-height: 190px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

.system-grid article + article {
  border-left: 1px solid rgba(0, 0, 0, 0.16);
}

.system-grid span {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.system-grid h3 {
  margin: auto 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 13px;
}

.system-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.client-directory {
  border: 1px solid #0b0b0b;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 6, 0, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 34%),
    #050505;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.directory-topline {
  min-height: 58px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.directory-topline span,
.directory-topline a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
  font-weight: 800;
}

.directory-topline a {
  color: rgba(255, 255, 255, 0.62);
}

.directory-body {
  padding: clamp(20px, 4vw, 34px);
  display: grid;
  gap: 30px;
}

.directory-lead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.directory-lead .eyebrow {
  color: rgba(255, 255, 255, 0.54);
}

.directory-lead h2 {
  margin: 10px 0 0;
  max-width: 760px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(28px, 5vw, 56px);
  line-height: 0.95;
}

.directory-total {
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.directory-total span {
  font-size: 18px;
}

.directory-block,
.directory-columns section {
  display: grid;
  gap: 18px;
}

.directory-label,
.directory-columns h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  font-weight: 700;
}

.client-listing {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.client-row {
  min-height: 132px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  padding: 18px;
  color: #fff;
  text-decoration: none;
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.18), transparent 40%),
    rgba(255, 255, 255, 0.035);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 14px;
  align-content: space-between;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.client-row:hover,
.client-row:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.42);
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.25), transparent 42%),
    rgba(255, 255, 255, 0.07);
}

.client-row span,
.client-row b {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 800;
}

.client-row span {
  color: rgba(255, 255, 255, 0.54);
}

.client-row strong {
  grid-column: 1 / -1;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: clamp(22px, 3vw, 34px);
}

.client-row em {
  grid-column: 1 / -1;
  color: rgba(255, 255, 255, 0.68);
  font-style: normal;
  font-size: 13px;
}

.client-row b {
  color: #fff;
  justify-self: end;
}

.directory-columns {
  padding-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(24px, 5vw, 58px);
}

.directory-columns ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 34px;
}

.directory-columns li {
  min-width: 0;
}

.directory-columns span {
  display: inline-flex;
  color: #fff;
  font-size: 17px;
  line-height: 1.25;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.lab-explorer,
.lab-projects,
.lab-join,
.lab-agenda {
  border: 1px solid var(--line);
  background: #fff;
}

.lab-explorer,
.lab-projects { padding: clamp(20px, 4vw, 34px); }

.explorer-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}

.explorer-head h2,
.project-intro h2,
.lab-join h2,
.lab-agenda h2 {
  margin: 10px 0 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(30px, 5vw, 58px);
  line-height: .94;
  text-transform: uppercase;
}

.discipline-filters {
  margin: 28px 0 18px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.discipline-filters button {
  border: 1px solid #0b0b0b;
  background: transparent;
  padding: 9px 13px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: .14em;
  font: 700 10px/1 "Space Grotesk", sans-serif;
  cursor: pointer;
}

.discipline-filters button.active { background: #0b0b0b; color: #fff; }
.discipline-filters button { transition: background-color .2s ease, color .2s ease, border-color .2s ease; }
.discipline-filters button:hover { border-color: #e10600; }

.resident-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.resident-card { color: inherit; text-decoration: none; border: 1px solid rgba(0,0,0,.18); min-width: 0; }
.resident-card { transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease; }
.resident-card:hover { transform: translateY(-5px); box-shadow: 0 18px 38px rgba(0,0,0,.1); }
.resident-visual { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--resident-color); }
.resident-visual::after { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, transparent, rgba(0,0,0,.18)); }
.resident-visual img { width: 100%; height: 100%; object-fit: contain; padding: 14px; filter: drop-shadow(0 16px 18px rgba(0,0,0,.2)); transition: transform .25s ease; }
.resident-card:hover img { transform: scale(1.05) rotate(-2deg); }
.resident-visual span { position: absolute; z-index: 2; top: 12px; left: 12px; color: #fff; font-weight: 800; letter-spacing: .18em; }
.resident-info { padding: 16px; }
.resident-info h3 { margin: 18px 0 6px; text-transform: uppercase; font-size: 18px; }
.resident-info p { margin: 0; color: var(--muted); font-size: 12px; }
.status-dot { font: 800 9px/1 monospace; letter-spacing: .16em; color: var(--accent); }
.status-dot::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: currentColor; }

.lab-projects { background: #0b0b0b; color: #fff; }
.project-intro { max-width: 760px; }
.project-intro > p:last-child { color: rgba(255,255,255,.64); line-height: 1.6; }
.project-grid { margin-top: 26px; display: grid; grid-template-columns: 1.25fr .75fr; gap: 12px; }
.project-card { border: 1px solid rgba(255,255,255,.18); color: #fff; text-decoration: none; padding: 14px; }
.project-card > span { font: 700 9px/1 monospace; letter-spacing: .16em; color: rgba(255,255,255,.55); }
.project-card img { width: 100%; height: 320px; object-fit: contain; margin: 10px 0; }
.project-card h3 { margin: 0; text-transform: uppercase; font-size: clamp(18px, 3vw, 30px); }
.project-card p { margin: 7px 0 0; color: rgba(255,255,255,.58); font-size: 12px; }
.lab-shop {
  padding: clamp(28px, 5vw, 56px);
  border: 1px solid var(--line);
  background: #f5f5f1;
}
.lab-shop-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.lab-shop-head h2 {
  margin: 10px 0 0;
  max-width: 700px;
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  font-size: clamp(34px, 6vw, 72px);
  line-height: .92;
  text-transform: uppercase;
}
.lab-product-grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}
.lab-product {
  min-width: 0;
  padding: 14px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  color: inherit;
  text-decoration: none;
  transition: background-color .2s ease, color .2s ease;
}
.lab-product > span {
  font: 700 8px/1.2 monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.lab-product img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: contain;
  transition: transform .25s ease;
}
.lab-product div {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
}
.lab-product strong {
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.lab-product em {
  white-space: nowrap;
  font: 700 10px/1 monospace;
  font-style: normal;
}
.lab-product:hover {
  background: var(--accent);
  color: #fff;
}
.lab-product:hover img { transform: scale(1.04); }

.lab-join { padding: clamp(24px, 5vw, 48px); display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(30px, 6vw, 80px); align-items: start; background: #c7ff00; }
.join-intro > p:last-child { margin: 20px 0 0; line-height: 1.6; }
.join-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.join-form label { display: grid; gap: 7px; }
.join-form label > span { text-transform: uppercase; letter-spacing: .14em; font: 800 9px/1 monospace; }
.join-form input,
.join-form select,
.join-form textarea { width: 100%; border: 1px solid #0b0b0b; border-radius: 0; background: rgba(255,255,255,.48); padding: 12px; color: #0b0b0b; font: inherit; }
.join-form textarea { resize: vertical; }
.join-form-wide,
.join-form .lab-button,
.join-message { grid-column: 1 / -1; }
.join-form .lab-button { width: 100%; }
.join-message { margin: 0; font: 700 11px/1.5 monospace; }
.join-message.is-error { color: #8a0000; }
.join-form .lab-button:disabled { cursor: wait; opacity: .65; }
.join-honeypot {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.lab-agenda { padding: clamp(24px, 5vw, 56px); }
.agenda-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.agenda-heading > span {
  font: 700 9px/1.2 monospace;
  letter-spacing: .16em;
}
.agenda-list { margin-top: 28px; border-bottom: 1px solid; }
.agenda-row {
  padding: 18px 0;
  border-top: 1px solid;
  display: grid;
  grid-template-columns: 90px minmax(220px, 1fr) minmax(180px, auto) auto;
  gap: 18px;
  align-items: center;
}
.agenda-row div { display: grid; gap: 6px; }
.agenda-row strong { text-transform: uppercase; }
.agenda-row time,
.agenda-row span {
  font: 700 9px/1.3 monospace;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.agenda-row div span { color: var(--accent); }
.agenda-row > span { text-align: right; }
.agenda-row a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid;
  padding-bottom: 4px;
  font: 700 9px/1.2 monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.agenda-row a:hover { color: var(--accent); }

@media (max-width: 800px) {
  .resident-grid { grid-template-columns: 1fr 1fr; }
  .project-grid { grid-template-columns: 1fr; }
  .lab-join { grid-template-columns: 1fr; align-items: start; }
}

@media (max-width: 560px) {
  .explorer-head { align-items: start; flex-direction: column; }
  .resident-grid { grid-template-columns: 1fr; }
  .project-card img { height: 260px; }
  .agenda-heading { align-items: flex-start; flex-direction: column; }
  .agenda-row { grid-template-columns: 1fr; }
  .agenda-row > span { text-align: left; }
  .join-form { grid-template-columns: 1fr; }
  .join-form label,
  .join-form-wide,
  .join-form .lab-button,
  .join-message { grid-column: 1; }
}
@media (max-width: 980px) {
  .lab-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .shop-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .brand {
    min-width: 0;
  }

  .shop-nav {
    grid-column: 1 / -1;
    padding-bottom: 4px;
  }

  .shop-cta {
    justify-self: end;
  }

  .lab-hero {
    grid-template-columns: 1fr;
  }

  .lab-hero {
    min-height: 0;
  }

  .system-grid {
    grid-template-columns: 1fr;
  }

  .system-grid article + article {
    border-left: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.16);
  }

  .showcase-stage {
    min-height: 360px;
  }

  .showcase-shirt {
    right: -2%;
    bottom: -6%;
    width: min(400px, 70%);
  }

  .showcase-cup {
    right: 6%;
    top: 11%;
    width: min(82px, 14%);
  }

  .directory-lead,
  .directory-columns {
    grid-template-columns: 1fr;
  }

  .directory-total {
    justify-self: start;
  }
}

@media (max-width: 700px) {
  .discipline-filters { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x proximity; scrollbar-width: none; }
  .discipline-filters button { flex: 0 0 auto; scroll-snap-align: start; }
  .lab-page {
    width: 100%;
    max-width: 100%;
    padding: 20px 14px 36px;
    overflow-x: clip;
  }

  .lab-page main,
  .lab-page main > section,
  .lab-page main > section > *,
  .explorer-head > *,
  .lab-shop-head > *,
  .agenda-heading > * {
    min-width: 0;
    max-width: 100%;
  }

  .lab-shop {
    padding: 24px 18px;
  }

  .lab-shop-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .lab-shop-head > div {
    width: 100%;
  }

  .lab-shop-head .eyebrow {
    max-width: 100%;
    line-height: 1.5;
  }

  .lab-shop-head .lab-button {
    width: auto;
    max-width: 100%;
    align-self: flex-start;
    text-align: left;
    line-height: 1.35;
  }

  .lab-product-grid {
    grid-template-columns: minmax(0, 1fr);
    margin-top: 26px;
  }

  .lab-product {
    display: grid;
    grid-template-rows: auto minmax(250px, auto) auto;
    gap: 12px;
    padding: 18px;
  }

  .lab-product > span {
    max-width: 100%;
    font-size: 9px;
    line-height: 1.4;
    letter-spacing: .1em;
    overflow-wrap: normal;
  }

  .lab-product img {
    min-height: 260px;
    aspect-ratio: 4 / 3;
  }

  .lab-product div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 16px;
  }

  .lab-product strong {
    max-width: 24ch;
    font-size: 14px;
    line-height: 1.25;
    letter-spacing: .04em;
    overflow-wrap: normal;
  }

  .lab-product em {
    align-self: end;
    font-size: 11px;
  }

  .shop-header {
    gap: 14px;
    align-items: start;
  }

  .brand {
    width: 100%;
  }

  .brand-logo {
    width: 52px;
    height: 52px;
  }

  .brand-name {
    font-size: 18px;
  }

  .brand-tagline {
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  .shop-nav {
    gap: 14px;
    font-size: 11px;
    padding-bottom: 2px;
  }

  .shop-cta {
    width: 100%;
    min-height: 44px;
  }

  main {
    gap: 18px;
    margin-top: 24px;
  }

  .hero-copy,
  .lab-system {
    padding: 18px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .lab-button {
    width: 100%;
  }

  .hero-copy h1 {
    max-width: 100%;
    font-size: clamp(32px, 11vw, 44px);
    line-height: .98;
    letter-spacing: -.025em;
    overflow-wrap: break-word;
    text-wrap: balance;
  }

  .hero-sub {
    font-size: 14px;
    line-height: 1.6;
  }

  .showcase-stage {
    min-height: 330px;
  }

  .showcase-meta,
  .showcase-footer {
    padding: 14px;
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .showcase-board {
    top: 14px;
    left: 14px;
    width: calc(100% - 28px);
    min-height: 118px;
    padding: 16px;
    gap: 12px;
  }

  .showcase-logo-arw {
    width: 100%;
    max-height: 62px;
  }

  .showcase-logo-newgbonhi {
    width: 100%;
    max-height: 62px;
  }

  .showcase-cross {
    font-size: 16px;
  }

  .showcase-shirt {
    right: 2%;
    bottom: -5%;
    width: 66%;
  }

  .showcase-cup {
    right: 12px;
    top: 142px;
    width: 13%;
  }

  .system-grid article {
    min-height: 0;
    gap: 10px;
    padding: 16px;
  }

  .directory-topline {
    min-height: 50px;
    padding: 0 14px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
  }

  .directory-topline span,
  .directory-topline a {
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  .directory-body {
    padding: 16px;
    gap: 20px;
  }

  .directory-lead {
    gap: 12px;
    padding-bottom: 18px;
  }

  .directory-lead h2 {
    font-size: clamp(25px, 8.5vw, 36px);
    line-height: 1;
    letter-spacing: -.02em;
  }

  .directory-total {
    white-space: normal;
  }

  .client-listing {
    grid-template-columns: 1fr;
  }

  .client-row {
    min-height: 110px;
    padding: 16px;
  }

  .client-row strong {
    font-size: clamp(18px, 6vw, 25px);
    letter-spacing: .04em;
  }

  .client-row em {
    font-size: 12px;
    line-height: 1.5;
  }

  .directory-columns {
    gap: 18px;
  }

  .directory-columns ul {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .directory-columns span {
    font-size: 13px;
    line-height: 1.4;
  }

  .explorer-head h2,
  .project-intro h2,
  .lab-shop-head h2,
  .section-heading h2,
  .lab-join h2,
  .lab-agenda h2 {
    max-width: 100%;
    font-size: clamp(26px, 8.5vw, 38px) !important;
    line-height: 1 !important;
    letter-spacing: -.02em !important;
    overflow-wrap: normal;
    word-break: normal;
    text-wrap: balance;
  }

  .project-card h3 {
    font-size: clamp(18px, 6vw, 25px);
    line-height: 1.05;
  }
}

@media (max-width: 700px) {
  .shop-nav .nav-contact {
    display: none;
  }
}

@media (max-width: 430px) {
  .lab-page {
    padding-inline: 12px;
  }

  .shop-nav {
    gap: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
  }

  .showcase-stage {
    min-height: 300px;
  }

  .showcase-board {
    width: calc(100% - 28px);
    min-height: 110px;
  }

  .showcase-logo-arw {
    width: 100%;
  }

  .showcase-logo-newgbonhi {
    width: 100%;
  }

  .showcase-cross {
    font-size: 15px;
  }

  .showcase-shirt {
    right: 1%;
    width: 68%;
  }

  .showcase-cup {
    top: 134px;
    width: 14%;
  }

}
</style>
