import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Feed } from "./components/Feed";
import { ArticleDetail } from "./components/ArticleDetail";
import { Profile } from "./components/Profile";
import { AdminPanel } from "./components/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Feed },
      { path: "article/:id", Component: ArticleDetail },
      { path: "profile", Component: Profile },
      { path: "admin", Component: AdminPanel },
    ],
  },
]);
