import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainCategories from "../component/MainCategories";
import MarketTicker from "../component/MarketTicker";
import WorldClocks from "../component/WorldClocks";
import MarketPulse from "../component/MarketPulse";
import SentimentGauge from "../component/SentimentGauge";
import GeoRiskIndicator from "../component/GeoRiskIndicator";
import NewsletterSignup from "../component/NewsletterSignup";
import ParticleField from "../component/ParticleField";
import Image from "../component/Image";
import type { NewsItem, NewsPayload } from "../types";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/* ---------- types ---------- */

interface FeaturedPost {
  id: number;
  title: string;
  category?: string;
  author?: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
}

interface FeaturedData {
  main: FeaturedPost | null;
  minis: FeaturedPost[];
}

interface BlogPost {
  id: number;
  title: string;
  category?: string;
  author?: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
}

/* ---------- helpers ---------- */

const CATEGORY_FALLBACKS: Record<string, string> = {
  programming: "/featured1.jpeg",
  "data-science": "/featured3.jpeg",
  business: "/featured5.jpeg",
  technology: "/featured6.jpeg",
  development: "/featured2.jpeg",
  travel: "/featured4.jpeg",
  general: "/featured2.jpeg",
};

function stripHtml(html: string = ""): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
}

function previewFrom(post: { excerpt?: string; content?: string } | null): string {
  if (!post) return "";
  if (post.excerpt?.trim()) return post.excerpt.trim();
  return stripHtml(post.content).slice(0, 220);
}

function coverSrc(post: { cover_image_url?: string; category?: string } | null): string {
  if (!post) return CATEGORY_FALLBACKS.general;
  const key = (post.category || "general").toLowerCase();
  return post.cover_image_url?.trim()
    ? post.cover_image_url
    : CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
}

/* ---------- bento wrapper ---------- */

function BentoBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`rounded-2xl bg-surface border border-white/5 overflow-hidden transition-all hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5 ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- main component ---------- */

const HomePage: React.FC = () => {
  /* featured article */
  const [featured, setFeatured] = useState<FeaturedData>({ main: null, minis: [] });
  const [featuredStatus, setFeaturedStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/featured?limit_minis=0`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: FeaturedData = await res.json();
        if (alive) {
          setFeatured(json);
          setFeaturedStatus("ok");
        }
      } catch {
        if (alive) setFeaturedStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const main = featured.main;
  const mainPreview = useMemo(() => previewFrom(main), [main]);
  const heroSrc = useMemo(() => coverSrc(main), [main]);

  /* blog posts */
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/posts?limit=6`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Handle both array and { posts: [...] } shapes
        const list: BlogPost[] = Array.isArray(json) ? json : json.posts ?? [];
        if (alive) {
          setPosts(list);
          setPostsLoading(false);
        }
      } catch {
        if (alive) setPostsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* RSS news headlines */
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/rss/finance-home`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: NewsPayload = await res.json();
        const all: NewsItem[] = [
          ...(json.hero ? [json.hero] : []),
          ...(json.topRight || []),
          ...(json.subCards || []),
          ...(json.latest || []),
        ];
        // Deduplicate by url/title
        const seen = new Set<string>();
        const unique: NewsItem[] = [];
        for (const item of all) {
          const key = (item.url || item.title || "").trim().toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          unique.push(item);
        }
        if (alive) setNewsItems(unique);
      } catch {
        // News feed is non-critical — silently fail
      }
    })();
    return () => { alive = false; };
  }, []);

  /* Interleave: blog posts at positions 0,2,4 — news at 1,3,5 */
  const hybridGrid = useMemo(() => {
    const grid: { type: "blog"; data: BlogPost }[] | { type: "news"; data: NewsItem }[] = [];
    const maxPairs = Math.max(posts.length, newsItems.length, 3);
    for (let i = 0; i < maxPairs && grid.length < 6; i++) {
      if (i < posts.length) (grid as any[]).push({ type: "blog", data: posts[i] });
      if (i < newsItems.length && grid.length < 6) (grid as any[]).push({ type: "news", data: newsItems[i] });
    }
    return grid as ({ type: "blog"; data: BlogPost } | { type: "news"; data: NewsItem })[];
  }, [posts, newsItems]);

  return (
    <div className="min-h-screen bg-navy-900 relative">
      {/* Subtle gradient accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gold/[0.03] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-3xl" />
      </div>

      {/* Decorative omega */}
      <div className="absolute left-0 top-0 pl-4 pt-8 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-[200px] md:w-[280px] h-auto text-gold opacity-[0.04]"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          aria-hidden="true"
        >
          <text
            x="50%"
            y="70%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="180"
            fontFamily="serif"
            fill="currentColor"
          >
            {"\u03A9"}
          </text>
        </svg>
      </div>

      {/* ROW 0: Market Ticker — full width */}
      <MarketTicker />

      {/* MAIN CONTAINER */}
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8 py-6">
        <div className="flex flex-col gap-4">
          {/* Heading — compact */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold md:text-4xl lg:text-5xl text-white font-mono tracking-tight">
              Omega <span className="text-gold">Division</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-mono">
              Engineering the Future, One Line at a Time
            </p>
          </div>

          {/* ROW 1: Hero + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT 2/3: Hero featured article */}
            <BentoBox className="lg:col-span-2 relative">
              {/* Particle field background */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <ParticleField />
              </div>

              {featuredStatus === "loading" ? (
                <div className="relative z-10 p-6 space-y-4">
                  <div className="w-full h-52 md:h-[340px] rounded-xl bg-surface-raised animate-pulse" />
                  <div className="h-6 w-2/3 rounded bg-surface-raised animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-surface-raised animate-pulse" />
                </div>
              ) : main ? (
                <Link to={`/posts/${main.id}`} className="block relative z-10 group">
                  <div className="w-full h-52 md:h-[340px] overflow-hidden">
                    <Image
                      src={heroSrc}
                      alt={main.title}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const key = (main.category || "general").toLowerCase();
                        e.currentTarget.src =
                          CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      width={900}
                      height={340}
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-3 text-xs">
                      {main.category && (
                        <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-mono text-[10px] tracking-wider uppercase">
                          {main.category}
                        </span>
                      )}
                      <span className="text-slate-500 font-mono">
                        {main.author || "anonymous"}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-gold transition-colors">
                      {main.title}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {mainPreview || "\u2014"}
                    </p>
                  </div>
                </Link>
              ) : null}
            </BentoBox>

            {/* RIGHT 1/3: Clocks + Market Pulse */}
            <div className="flex flex-col gap-4">
              <BentoBox className="p-4">
                <WorldClocks />
              </BentoBox>
              <BentoBox className="p-4">
                <MarketPulse />
              </BentoBox>
            </div>
          </div>

          {/* ROW 2: Hybrid content feed — blog posts + live news */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-slate-500 tracking-[0.15em] uppercase">
                Latest Research &amp; News
              </h3>
              <Link
                to="/news"
                className="text-[11px] font-mono text-gold/60 hover:text-gold transition-colors tracking-wider uppercase"
              >
                All News →
              </Link>
            </div>
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BentoBox key={i}>
                    <div className="w-full h-40 bg-surface-raised animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-16 rounded bg-surface-raised animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-surface-raised animate-pulse" />
                      <div className="h-3 w-full rounded bg-surface-raised animate-pulse" />
                    </div>
                  </BentoBox>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hybridGrid.map((item, idx) => {
                  if (item.type === "blog") {
                    const post = item.data;
                    const src = coverSrc(post);
                    return (
                      <BentoBox key={`blog-${post.id}`}>
                        <Link to={`/posts/${post.id}`} className="block group">
                          <div className="w-full h-40 overflow-hidden">
                            <Image
                              src={src}
                              alt={post.title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const key = (post.category || "general").toLowerCase();
                                e.currentTarget.src =
                                  CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                              }}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              width={460}
                              height={160}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              {post.category && (
                                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-mono text-[10px] tracking-wider uppercase">
                                  {post.category}
                                </span>
                              )}
                              <span className="text-slate-500 font-mono text-[10px]">
                                {post.author || "anonymous"}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-gold transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {previewFrom(post) || "\u2014"}
                            </p>
                          </div>
                        </Link>
                      </BentoBox>
                    );
                  }

                  /* News card */
                  const news = item.data;
                  return (
                    <BentoBox key={`news-${news.id || news.url || idx}`}>
                      <a
                        href={news.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block group"
                      >
                        {news.image ? (
                          <div className="w-full h-40 overflow-hidden relative">
                            <img
                              src={news.image}
                              alt={news.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-widest uppercase bg-red-500 text-white">
                              LIVE
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-navy-900 to-surface-raised flex items-center justify-center relative">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-8 h-8 text-gold/20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                            </svg>
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-widest uppercase bg-red-500 text-white">
                              LIVE
                            </span>
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-mono text-[10px] tracking-wider uppercase">
                              News
                            </span>
                            {news.source && (
                              <span className="text-slate-500 font-mono text-[10px] uppercase">
                                {news.source}
                              </span>
                            )}
                            {news.age && (
                              <span className="text-slate-600 font-mono text-[10px]">
                                {news.age}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-gold transition-colors">
                            {news.title}
                          </h4>
                          {news.kicker && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {news.kicker}
                            </p>
                          )}
                        </div>
                      </a>
                    </BentoBox>
                  );
                })}
              </div>
            )}
          </div>

          {/* ROW 3: Three equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoBox className="p-4">
              <SentimentGauge />
            </BentoBox>
            <BentoBox className="p-4">
              <GeoRiskIndicator />
            </BentoBox>
            <BentoBox className="p-4">
              <NewsletterSignup />
            </BentoBox>
          </div>

          {/* ROW 4: Categories */}
          <MainCategories />

          {/* ROW 5: Footer strip */}
          <div className="text-center py-6 space-y-1">
            <p className="text-xs font-mono text-slate-500 tracking-[0.15em]">
              Quantitative Research &middot; Technology &middot; Capital Markets
            </p>
            <p className="text-xs font-mono text-slate-600">
              Engineering the Future, One Line at a Time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
