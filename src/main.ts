import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { updateTheme } from "./utils/theme";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { createI18n } from "vue-i18n";
import { EN_MESSAGE, ZH_MESSAGE } from "./messages.ts";

const app = createApp(App).use(IonicVue).use(router);

const i18n = createI18n({
  // locale: navigator.language ?? "zh",
  locale: "zh",
  fallbackLocale: "en",
  messages: {
    en: EN_MESSAGE,
    zh: ZH_MESSAGE,
  },
});

router.isReady().then(() => {
  app.use(i18n);
  app.mount("#app");
});

updateTheme();
