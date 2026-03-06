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
import TrendingTickers from "../component/TrendingTickers";
import EconomicCalendar from "../component/EconomicCalendar";
import ForexRates from "../component/ForexRates";
import YieldRates from "../component/YieldRates";
import GainersLosers from "../component/GainersLosers";
import Watchlist from "../component/Watchlist";
import QuickLinks from "../component/QuickLinks";
import SocialFeed from "../component/SocialFeed";
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

/* ---------- sidebar panel wrapper ---------- */

function SidePanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`rounded-xl bg-surface border border-white/5 p-3 transition-all hover:border-gold/10 ${className}`}
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
        /* non-critical */
      }
    })();
    return () => { alive = false; };
  }, []);

  /*
   * FT-style staggered grid:
   * - "island" rich cards = blog posts with images (positions 0, 3, 4)
   * - dense headline links = news items filling the rest
   * Layout (2-col main area):
   *   Row A: [Blog card span-2] [news headlines col]
   *   Row B: [news headlines col] [Blog card]
   *   Row C: [Blog card] [news headlines col]
   */
  const islandPosts = posts.slice(0, 3);
  const extraPosts = posts.slice(3);
  const headlineNews = newsItems.slice(0, 12);

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

      {/* Market Ticker — full width */}
      <MarketTicker />

      {/* MAIN CONTAINER — 3-column: left sidebar | main | right sidebar */}
      <div className="relative mx-auto max-w-[1600px] px-4 md:px-6 py-6">
        {/* Heading */}
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-bold md:text-4xl lg:text-5xl text-white font-mono tracking-tight">
            Omega <span className="text-gold">Division</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-mono">
            Engineering the Future, One Line at a Time
          </p>
        </div>

        <div className="flex gap-4">
          {/* ========== LEFT SIDEBAR ========== */}
          <aside className="hidden xl:flex flex-col gap-3 w-[220px] shrink-0">
            <SidePanel>
              <TrendingTickers />
            </SidePanel>
            <SidePanel>
              <EconomicCalendar />
            </SidePanel>
            <SidePanel>
              <ForexRates />
            </SidePanel>
            <SidePanel>
              <YieldRates />
            </SidePanel>
          </aside>

          {/* ========== MAIN CONTENT ========== */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Hero row: featured article + clocks/pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Hero featured article */}
              <BentoBox className="lg:col-span-2 relative">
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

              {/* Clocks + Market Pulse */}
              <div className="flex flex-col gap-4">
                <BentoBox className="p-4">
                  <WorldClocks />
                </BentoBox>
                <BentoBox className="p-4">
                  <MarketPulse />
                </BentoBox>
              </div>
            </div>

            {/* FT-style staggered content: islands + headline links */}
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
                <div className="flex flex-col gap-4">
                  {/* Row A: Blog island (span 2) + news headline stack */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {islandPosts[0] && (
                      <BentoBox className="lg:col-span-2">
                        <Link to={`/posts/${islandPosts[0].id}`} className="block group">
                          <div className="w-full h-48 overflow-hidden">
                            <Image
                              src={coverSrc(islandPosts[0])}
                              alt={islandPosts[0].title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const key = (islandPosts[0].category || "general").toLowerCase();
                                e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                              }}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              width={700}
                              height={192}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              {islandPosts[0].category && (
                                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-mono text-[10px] tracking-wider uppercase">
                                  {islandPosts[0].category}
                                </span>
                              )}
                              <span className="text-slate-500 font-mono text-[10px]">
                                {islandPosts[0].author || "anonymous"}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                              {islandPosts[0].title}
                            </h4>
                            <p className="text-sm text-slate-400 line-clamp-2">
                              {previewFrom(islandPosts[0]) || "\u2014"}
                            </p>
                          </div>
                        </Link>
                      </BentoBox>
                    )}
                    {/* News headline stack */}
                    <div className="rounded-xl bg-surface border border-white/5 p-4 flex flex-col gap-0">
                      <h5 className="text-[10px] font-mono text-red-400/70 tracking-[0.15em] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Live Wire
                      </h5>
                      {headlineNews.slice(0, 5).map((news, i) => (
                        <a
                          key={news.id || news.url || i}
                          href={news.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="block py-2 border-b border-white/5 last:border-0 group"
                        >
                          <p className="text-xs font-mono text-white leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                            {news.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {news.source && (
                              <span className="text-[9px] font-mono text-slate-500 uppercase">{news.source}</span>
                            )}
                            {news.age && (
                              <span className="text-[9px] font-mono text-slate-600">{news.age}</span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Row B: News headline stack + blog island */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* News headline stack */}
                    <div className="rounded-xl bg-surface border border-white/5 p-4 flex flex-col gap-0">
                      <h5 className="text-[10px] font-mono text-gold/50 tracking-[0.15em] uppercase mb-2">
                        Market Headlines
                      </h5>
                      {headlineNews.slice(5, 9).map((news, i) => (
                        <a
                          key={news.id || news.url || i}
                          href={news.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="block py-2 border-b border-white/5 last:border-0 group"
                        >
                          <p className="text-xs font-mono text-white leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                            {news.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {news.source && (
                              <span className="text-[9px] font-mono text-slate-500 uppercase">{news.source}</span>
                            )}
                            {news.age && (
                              <span className="text-[9px] font-mono text-slate-600">{news.age}</span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                    {/* Blog island */}
                    {islandPosts[1] && (
                      <BentoBox className="lg:col-span-2">
                        <Link to={`/posts/${islandPosts[1].id}`} className="block group">
                          <div className="w-full h-48 overflow-hidden">
                            <Image
                              src={coverSrc(islandPosts[1])}
                              alt={islandPosts[1].title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const key = (islandPosts[1].category || "general").toLowerCase();
                                e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                              }}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              width={700}
                              height={192}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              {islandPosts[1].category && (
                                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-mono text-[10px] tracking-wider uppercase">
                                  {islandPosts[1].category}
                                </span>
                              )}
                              <span className="text-slate-500 font-mono text-[10px]">
                                {islandPosts[1].author || "anonymous"}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-white group-hover:text-gold transition-colors">
                              {islandPosts[1].title}
                            </h4>
                            <p className="text-sm text-slate-400 line-clamp-2">
                              {previewFrom(islandPosts[1]) || "\u2014"}
                            </p>
                          </div>
                        </Link>
                      </BentoBox>
                    )}
                  </div>

                  {/* Row C: Blog island + news headlines + extra posts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {islandPosts[2] && (
                      <BentoBox>
                        <Link to={`/posts/${islandPosts[2].id}`} className="block group">
                          <div className="w-full h-40 overflow-hidden">
                            <Image
                              src={coverSrc(islandPosts[2])}
                              alt={islandPosts[2].title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const key = (islandPosts[2].category || "general").toLowerCase();
                                e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                              }}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              width={460}
                              height={160}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              {islandPosts[2].category && (
                                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold font-mono text-[10px] tracking-wider uppercase">
                                  {islandPosts[2].category}
                                </span>
                              )}
                              <span className="text-slate-500 font-mono text-[10px]">
                                {islandPosts[2].author || "anonymous"}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-gold transition-colors">
                              {islandPosts[2].title}
                            </h4>
                          </div>
                        </Link>
                      </BentoBox>
                    )}
                    {/* More news headlines */}
                    <div className="rounded-xl bg-surface border border-white/5 p-4 flex flex-col gap-0">
                      <h5 className="text-[10px] font-mono text-gold/50 tracking-[0.15em] uppercase mb-2">
                        More Headlines
                      </h5>
                      {headlineNews.slice(9, 12).map((news, i) => (
                        <a
                          key={news.id || news.url || i}
                          href={news.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="block py-2 border-b border-white/5 last:border-0 group"
                        >
                          <p className="text-xs font-mono text-white leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                            {news.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {news.source && (
                              <span className="text-[9px] font-mono text-slate-500 uppercase">{news.source}</span>
                            )}
                            {news.age && (
                              <span className="text-[9px] font-mono text-slate-600">{news.age}</span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                    {/* Extra blog posts as compact cards */}
                    {extraPosts.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {extraPosts.slice(0, 3).map((post) => (
                          <Link
                            key={post.id}
                            to={`/posts/${post.id}`}
                            className="flex gap-3 items-start rounded-xl bg-surface border border-white/5 p-3 group hover:border-gold/20 transition-all"
                          >
                            <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={coverSrc(post)}
                                alt={post.title}
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  const key = (post.category || "general").toLowerCase();
                                  e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
                                }}
                                className="w-full h-full object-cover"
                                width={80}
                                height={56}
                              />
                            </div>
                            <div className="min-w-0">
                              {post.category && (
                                <span className="text-[9px] font-mono text-gold/60 tracking-wider uppercase">
                                  {post.category}
                                </span>
                              )}
                              <p className="text-xs font-semibold text-white line-clamp-2 group-hover:text-gold transition-colors leading-snug">
                                {post.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gauges row */}
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

            {/* Categories */}
            <MainCategories />
          </div>

          {/* ========== RIGHT SIDEBAR ========== */}
          <aside className="hidden xl:flex flex-col gap-3 w-[220px] shrink-0">
            <SidePanel>
              <GainersLosers />
            </SidePanel>
            <SidePanel>
              <Watchlist />
            </SidePanel>
            <SidePanel>
              <QuickLinks />
            </SidePanel>
            <SidePanel>
              <SocialFeed />
            </SidePanel>
          </aside>
        </div>

        {/* Footer strip */}
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
  );
};

export default HomePage;
