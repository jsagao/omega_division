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

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-6 space-y-6">
        <div className="h-[380px] rounded-3xl bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
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
          <h2 className="mt-0 text-2xl md:text-[26px] lg:text-3xl font-bold text-white hover:underline">
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
                  className="w-full h-full object-cover"
                  width={298}
                  height={160}
                />
              </div>

              <div className="p-3">
                {/* Category */}
                <div className="text-xs text-gray-600">
                  <Link
                    to={`/category/${(it.category || "general").toLowerCase()}`}
                    className="text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {it.category}
                  </Link>
                </div>

                {/* 🔹 Title (new) */}
                <h3 className="mt-1 font-semibold text-sm text-gray-900 line-clamp-2 hover:underline">
                  {it.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">{previewFrom(it) || "—"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
