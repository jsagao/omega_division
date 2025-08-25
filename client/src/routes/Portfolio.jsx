// src/routes/Portfolio.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// tiny helpers
function toPlain(html = "") {
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").trim();
}
function firstNonEmpty(...vals) {
  return vals.find((v) => typeof v === "string" && v.trim().length) || "";
}

export default function Portfolio() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [workingId, setWorkingId] = useState(null); // track which post is being updated

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/portfolio?limit=20`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
        setStatus("ok");
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const mapped = useMemo(() => {
    return (items || []).map((p) => {
      const title = p.title || "Untitled";
      const imageUrl = p.cover_image_url || "";
      const desc = firstNonEmpty(p.excerpt, toPlain(p.content), p.description);
      const authorName = p.author || "anonymous";
      return {
        id: p.id,
        title,
        href: `/posts/${p.id}`,
        description: desc,
        imageUrl,
        date: new Date(p.created_at || Date.now()).toLocaleDateString(),
        datetime: p.created_at || "",
        category: {
          title: p.category || "General",
          href: `/posts?cat=${encodeURIComponent(p.category || "general")}`,
        },
        author: {
          name: authorName,
          role: "Contributor",
          href: "/about", // send author clicks to About page
          imageUrl: "/featured1.jpeg",
        },
      };
    });
  }, [items]);

  // 🚫 Do not delete the post; just remove it from portfolio (unset featured_slot / featured_rank)
  async function handleRemoveFromPortfolio(postId, postTitle) {
    if (!isAdmin) return;
    const ok = window.confirm(
      `Remove "${postTitle}" from Portfolio? The post will remain published elsewhere.`
    );
    if (!ok) return;

    try {
      setWorkingId(postId);
      const res = await fetch(`${API}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured_slot: "none", featured_rank: null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Remove from local list so UI updates immediately
      setItems((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Could not update the post. Please try again.");
    } finally {
      setWorkingId(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <div className="h-8 w-56 bg-gray-800 rounded mb-3 animate-pulse" />
            <div className="h-5 w-80 bg-gray-800 rounded animate-pulse" />
            <div className="mt-16 space-y-20 lg:mt-20">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-8">
                  <div className="relative lg:w-64 h-40 rounded-2xl bg-gray-800 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-36 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-3/4 bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-gray-300">Couldn’t load portfolio items.</p>
          <button className="mt-3 text-indigo-300 underline" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
            From the blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-400">Showing Highlighted Projects from Blog</p>

          <div className="mt-16 space-y-20 lg:mt-20">
            {mapped.map((post) => (
              <article key={post.id} className="relative isolate flex flex-col gap-8 lg:flex-row">
                <div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
                  {post.imageUrl ? (
                    <img
                      alt=""
                      src={post.imageUrl}
                      className="absolute inset-0 size-full rounded-2xl bg-gray-800 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 size-full rounded-2xl bg-gray-800" />
                  )}
                  <div className="absolute inset-0 rounded-2xl inset-ring inset-ring-white/10" />
                </div>

                <div>
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.datetime} className="text-gray-400">
                      {post.date}
                    </time>
                    <a
                      href={post.category.href}
                      className="relative z-10 rounded-full bg-gray-800/60 px-3 py-1.5 font-medium text-gray-300 hover:bg-gray-800"
                    >
                      {post.category.title}
                    </a>
                  </div>

                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg/6 font-semibold text-white group-hover:text-gray-300">
                      <a href={post.href} className="hover:underline">
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 text-sm/6 text-gray-400">{post.description}</p>

                    {/* Admin-only action: remove from portfolio (do not delete post) */}
                    {isAdmin && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromPortfolio(post.id, post.title);
                          }}
                          disabled={workingId === post.id}
                          className="text-sm px-3 py-1.5 rounded border border-amber-400/40 text-amber-200 hover:bg-amber-500/10 disabled:opacity-60"
                          title="Remove this post from the Portfolio list only"
                        >
                          {workingId === post.id ? "Updating…" : "Remove from portfolio"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex border-t border-white/10 pt-6">
                    <div className="relative flex items-center gap-x-4">
                      <a href="/about">
                        <img
                          alt=""
                          src={post.author.imageUrl}
                          className="size-10 rounded-full bg-gray-800"
                        />
                      </a>
                      <div className="text-sm/6">
                        <p className="font-semibold text-white">
                          <a href="/about">{post.author.name}</a>
                        </p>
                        <p className="text-gray-400">{post.author.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
