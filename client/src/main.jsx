// src/main.jsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import HomePage from "./routes/HomePage.jsx";
import PostListPage from "./routes/PostListPage.jsx";
import Write from "./routes/Write.jsx";
import LoginPage from "./routes/LoginPage.jsx";
import RegisterPage from "./routes/RegisterPage.jsx";
import PrimarySinglePost from "./routes/PrimarySinglePost.jsx";

import About from "./routes/About.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import Portfolio from "./routes/Portfolio.jsx";
import Shop from "./routes/Shop.jsx";
import NewsHome from "./routes/NewsHome.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Publishable Key");

const router = createBrowserRouter([
  {
    path: "/", // layout route
    Component: MainLayout, // must render <Outlet /> inside
    children: [
      { index: true, Component: HomePage }, // "/"
      { path: "posts", Component: PostListPage }, // "/posts"
      { path: "posts/:id", Component: PrimarySinglePost }, // "/posts/:id"
      { path: "posts/:id/edit", Component: (await import("./routes/EditPost.jsx")).default }, // or a static import if you prefer
      { path: "write", Component: Write }, // "/write"
      { path: "login", Component: LoginPage }, // "/login"
      { path: "register", Component: RegisterPage }, // "/register"
      { path: "portfolio", Component: Portfolio },
      { path: "shop", Component: Shop },
      { path: "news", Component: NewsHome }, // optional demo route
      { path: "about", Component: About }, // "/about"
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
