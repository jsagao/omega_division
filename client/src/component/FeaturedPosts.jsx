// src/component/FeaturedPosts.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Image from "./Image";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const CATEGORY_FALLBACKS = {
  programming: "/featured1.jpeg",
  "data-science": "/featured3.jpeg",
  business: "/featured5.jpeg",
  technology: "/featured6.jpeg",
  development: "/featured2.jpeg",
  travel: "/featured4.jpeg",
  general: "/featured2.jpeg",
};

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function previewFrom(post) {
  if (!post) return "";
  if (post.excerpt && post.excerpt.trim()) return post.excerpt.trim();
  return stripHtml(post.content).slice(0, 220);
}

export default function FeaturedPosts() {
  const navigate = useNavigate();
  const [data, setData] = useState({ main: null, minis: [] });
  const [status, setStatus] = useState("loading"); // loading|ok|error

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/featured?limit_minis=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) {
          setData(json);
          setStatus("ok");
        }
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const main = data.main;
  const mainPreview = useMemo(() => previewFrom(main), [main]);
  const heroSrc = useMemo(() => {
    const catKey = (main?.category || "general").toLowerCase();
    return main?.cover_image_url && main.cover_image_url.trim()
      ? main.cover_image_url
      : CATEGORY_FALLBACKS[catKey] || CATEGORY_FALLBACKS.general;
  }, [main]);

  const go = (id) => navigate(`/posts/${id}`);

  // --- Shimmer CSS (scoped) ---
  const ShimmerCSS = (
    <style>{`
      .shimmer {
        position: relative;
        overflow: hidden;
        background-color: #e5e7eb; /* Tailwind gray-200 */
      }
      .shimmer::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(229,231,235,0) 0%,
          rgba(255,255,255,0.6) 50%,
          rgba(229,231,235,0) 100%
        );
        animation: shimmer-move 1.25s infinite;
      }
      @keyframes shimmer-move {
        100% { transform: translateX(100%); }
      }
    `}</style>
  );

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-6 space-y-6">
        {ShimmerCSS}
        {/* Hero skeleton */}
        <div className="md:flex md:items-start md:gap-6">
          <div className="md:w-2/3 space-y-3">
            <div className="rounded-3xl shimmer h-52 sm:h-64 md:h-[380px]" />
            <div className="flex items-center gap-3 text-sm">
              <div className="h-4 w-24 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
            </div>
          </div>
          <div className="md:w-1/3 space-y-3 mt-4 md:mt-0">
            <div className="h-7 w-11/12 rounded shimmer" />
            <div className="h-7 w-9/12 rounded shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-4 w-5/6 rounded shimmer" />
            <div className="h-4 w-4/6 rounded shimmer" />
          </div>
        </div>
        {/* Minis skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow overflow-hidden">
              <div className="w-full h-36 sm:h-40 shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-4 w-5/6 rounded shimmer" />
                <div className="h-3 w-full rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "error" || !main) return null;
  const minis = data.minis ?? [];

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 space-y-6">
      {/* Row 1: hero (2/3) + text (1/3) */}
      <div className="md:flex md:items-start md:gap-6">
        {/* Left: image + meta */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => go(main.id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(main.id)}
          className="md:w-2/3 space-y-3 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="rounded-3xl overflow-hidden">
            <Image
              src={heroSrc}
              alt={main?.title || "Featured image"}
              onError={(e) => {
                const key = (main?.category || "general").toLowerCase();
                e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
              }}
              className="w-full object-cover transition-transform duration-300 hover:scale-105 h-52 sm:h-64 md:h-[380px]"
              width={1100}
              height={380}
            />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold">FEATURED</span>
            <Link
              to={`/category/${(main?.category || "general").toLowerCase()}`}
              className="text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {main?.category}
            </Link>
            {/* Author → About */}
            <span className="text-gray-400">•</span>
            <Link
              to="/about"
              className="text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {main?.author || "anonymous"}
            </Link>
          </div>
        </div>

        {/* Right: title + excerpt */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => go(main.id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(main.id)}
          className="md:w-1/3 self-start cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <h2 className="mt-0 text-2xl md:text-[26px] lg:text-3xl font-bold text-black hover:underline">
            {main.title}
          </h2>
          <p className="mt-2 text-gray-600 text-sm md:text-base leading-relaxed">
            {mainPreview || "—"}
          </p>
        </div>
      </div>

      {/* Row 2: minis full width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {minis.map((it) => {
          const catKey = (it.category || "general").toLowerCase();
          const miniSrc =
            it.cover_image_url && it.cover_image_url.trim()
              ? it.cover_image_url
              : CATEGORY_FALLBACKS[catKey] || CATEGORY_FALLBACKS.general;

          return (
            <div
              key={it.id}
              role="button"
              tabIndex={0}
              onClick={() => go(it.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(it.id)}
              className="rounded-2xl bg-white shadow hover:shadow-md transition overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="w-full h-36 sm:h-40 overflow-hidden">
                <Image
                  src={miniSrc}
                  alt={it.title}
                  onError={(e) => {
                    const key = (it.category || "general").toLowerCase();
                    e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                  }}
                  className="w-full h-full object-cover"
                  width={298}
                  height={160}
                />
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-600 flex gap-2 items-center">
                  <Link
                    to={`/category/${(it.category || "general").toLowerCase()}`}
                    className="text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {it.category}
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link
                    to="/about"
                    className="text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {it.author || "anonymous"}
                  </Link>
                </div>
                <h3 className="mt-1 font-semibold text-sm text-gray-900 line-clamp-2 hover:underline">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">{previewFrom(it) || "—"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
