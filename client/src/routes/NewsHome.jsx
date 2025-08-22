
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function HeadlineLink({ item }) {
  return (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noreferrer"
      className="block leading-snug hover:underline"
    >
      <span className="font-semibold">{item.title}</span>
      {item.source || item.age ? (
        <span className="ml-2 text-[11px] tracking-wide text-gray-500 uppercase">
          {item.source}
          {item.source && item.age ? " • " : ""}
          {item.age}
        </span>
      ) : null}
    </a>
  );
}

export default function NewsHome() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [payload, setPayload] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/rss/finance-home`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setPayload(json);
        setStatus("ok");
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- Always run hooks (no early returns above this line) ----
  const normalized = useMemo(() => {
    const hero = payload?.hero || null;
    const arrays = [
      ...(payload?.topRight || []),
      ...(payload?.subCards || []),
      ...(payload?.latest || []),
    ];
    const seen = new Set();
    const rest = [];
    for (const it of arrays) {
      const key = (it.url || it.title || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      rest.push(it);
    }
    return { hero, rest };
  }, [payload]);

  const columns = useMemo(() => {
    const buckets = [[], [], []];
    normalized.rest.forEach((item, i) => {
      buckets[i % 3].push(item);
    });
    return buckets;
  }, [normalized.rest]);

  const hero = normalized.hero;
  const [colLeft, colMid, colRight] = columns;

  // ---- Loading ----
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8 space-y-6">
        {/* Loading banner */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" className="opacity-30" />
            <path d="M21 12a9 9 0 0 1-9 9" strokeWidth="2" className="opacity-80" />
          </svg>
          <span>Loading feeds…</span>
        </div>

        {/* Masthead placeholder */}
        <div className="h-8 w-72 bg-gray-100 animate-pulse mx-auto rounded" />

        {/* Hero image placeholder */}
        <div className="h-48 md:h-56 bg-gray-100 animate-pulse rounded mx-auto max-w-3xl" />

        {/* 3-column skeleton list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((col) => (
            <div key={col} className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="border-b pb-3">
                  <div className="h-4 w-5/6 bg-gray-100 animate-pulse rounded mb-2" />
                  <div className="h-3 w-1/3 bg-gray-100 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (status === "error" || !hero) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <p className="text-red-600">
          Couldn’t load news.{" "}
          <button className="underline" onClick={() => location.reload()}>
            Retry
          </button>
        </p>
      </div>
    );
  }

  // ---- Ready ----
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] mb-6 text-gray-600">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span>›</span>
        <span>News</span>
      </div>

      {/* Masthead */}
      <div className="text-center mb-6">
        <Link to="/" className="inline-block">
          <h1 className="font-black tracking-wide text-3xl md:text-4xl">
            OMEGA&nbsp;DIVISION&nbsp;REPORT
          </h1>
        </Link>
      </div>

      {/* Top image (optional) */}
      {hero?.image && (
        <div className="max-w-3xl mx-auto mb-4">
          <img
            src={hero.image}
            alt={hero.title || "Top image"}
            className="w-full max-h-[360px] object-cover border"
          />
        </div>
      )}

      {/* Screaming headline */}
      {hero?.title && (
        <div className="max-w-3xl mx-auto text-center mb-8">
          <a
            href={hero.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="block leading-tight hover:underline"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold">{hero.title}</h2>
          </a>
          {hero.kicker && <p className="mt-2 text-sm text-gray-600">{hero.kicker}</p>}
          {(hero.source || hero.age) && (
            <div className="mt-1 text-[11px] tracking-wide text-gray-500 uppercase">
              {hero.source}
              {hero.source && hero.age ? " • " : ""}
              {hero.age}
            </div>
          )}
          {isAdmin && (
            <div className="mt-3 flex justify-center gap-2">
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">Edit</button>
              <button className="px-3 py-1 text-xs bg-red-600 text-white rounded">Delete</button>
            </div>
          )}
        </div>
      )}

      {/* Three filled columns */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6">
        {[...columns].map((col, idx) => (
          <div key={idx} className="space-y-3">
            {col.map((item, i) => (
              <div
                key={(item.id || item.url || item.title || i) + "-" + idx}
                className="border-b pb-3 hover:bg-gray-50"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full max-h-40 object-cover mb-2 border"
                  />
                )}
                <HeadlineLink item={item} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/posts" className="text-[13px] hover:underline">
          View All Posts →
        </Link>
      </div>
    </div>
  );
}
