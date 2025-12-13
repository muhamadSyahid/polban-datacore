import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import JobRunnerView from "../views/JobRunnerView.vue";
import DataInspectorView from "../views/DataInspectorView.vue";
import SettingsView from "../views/SettingsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: "/",
      component: () => import("../layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", name: "Dashboard", component: DashboardView },
        { path: "jobs", name: "JobRunner", component: JobRunnerView },
        {
          path: "inspector",
          name: "DataInspector",
          component: DataInspectorView,
        },
        { path: "settings", name: "Settings", component: SettingsView },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
