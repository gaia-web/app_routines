import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/routines",
      },
      {
        path: "routines",
        component: () => import("@/views/RoutinesPage.vue"),
      },
      {
        path: "stats",
        component: () => import("@/views/StatsPage.vue"),
      },
      {
        path: "settings",
        component: () => import("@/views/SettingsPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
