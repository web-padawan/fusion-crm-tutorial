import { Commands, Context, Route, Router } from "@vaadin/router";
import "./main-layout.ts";
import "./views/list/list-view";
import "./views/login/login-view";
import { autorun } from "mobx";

import { uiStore } from "./stores/app-store";

const authGuard = async (context: Context, commands: Commands) => {
  if (!uiStore.loggedIn) {
    // Save requested path
    sessionStorage.setItem("login-redirect-path", context.pathname);
    return commands.redirect("/login");
  }
  return undefined;
};

export type ViewRoute = Route & { title?: string; children?: ViewRoute[] };

export const views: ViewRoute[] = [
  {
    path: "",
    component: "list-view",
    title: "Contacts",
  },
  {
    path: "dashboard",
    component: "dashboard-view",
    title: "Dashboard",
    action: async () => {
      await import("./views/dashboard/dashboard-view");
    },
  },
];

export const routes: ViewRoute[] = [
  { path: "login", component: "login-view" },
  {
    path: "logout",
    action: (_: Context, commands: Commands) => {
      uiStore.logout();
      return commands.redirect("/login");
    },
  },
  {
    path: "",
    component: "main-layout",
    children: views,
    action: authGuard,
  },
];

// Catch logins and logouts, redirect appropriately
autorun(() => {
  if (uiStore.loggedIn) {
    Router.go(sessionStorage.getItem("login-redirect-path") || "/");
  } else {
    if (location.pathname !== "/login") {
      sessionStorage.setItem("login-redirect-path", location.pathname);
    }
    Router.go("/login");
  }
});
