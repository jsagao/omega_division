// src/main.tsx
import "./index.css";
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./routes/HomePage";
import PostListPage from "./routes/PostListPage";
import Write from "./routes/Write";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import PrimarySinglePost from "./routes/PrimarySinglePost";
import About from "./routes/About";
import { ClerkProvider } from "@clerk/clerk-react";
import Portfolio from "./routes/Portfolio";
import Shop from "./routes/Shop";
import NewsHome from "./routes/NewsHome";

// Lazy load EditPost instead of top-level await
const EditPost = lazy(() => import("./routes/EditPost"));

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Publishable Key");

const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "posts", Component: PostListPage },
      { path: "posts/:id", Component: PrimarySinglePost },
      {
        path: "posts/:id/edit",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <EditPost />
          </Suspense>
        ),
      },
      { path: "write", Component: Write },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "portfolio", Component: Portfolio },
      { path: "shop", Component: Shop },
      { path: "news", Component: NewsHome },
      { path: "about", Component: About },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
