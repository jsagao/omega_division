import React from "react";
import { Link } from "react-router-dom";
import MainCategories from "../component/MainCategories";
import FeaturedPosts from "../component/FeaturedPosts";
import PostList from "../component/PostList";
import HeroStrip from "../component/HeroStrip";

const HomePage: React.FC = () => {
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

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8 py-8">
        <div className="flex flex-col gap-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gold/70 hover:text-gold transition-colors">
              Home
            </Link>
            <span className="text-slate-600">{"\u203A"}</span>
            <span className="text-slate-500">Research & Insights</span>
          </div>

          {/* Hero heading */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold md:text-5xl lg:text-6xl text-white font-mono tracking-tight">
                Omega <span className="text-gold">Division</span>
              </h1>
              <p className="mt-2 md:mt-4 text-base md:text-lg text-slate-400 font-mono max-w-xl">
                Engineering the Future, One Line at a Time
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-px w-12 bg-gold/40" />
                <span className="text-xs font-mono text-gold/60 tracking-[0.2em] uppercase">
                  Quantitative Research &middot; Technology &middot; Capital Markets
                </span>
              </div>
            </div>
          </div>

          {/* Hero strip */}
          <HeroStrip />

          {/* Categories */}
          <MainCategories />

          {/* Featured */}
          <FeaturedPosts />

          {/* Latest posts */}
          <PostList />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
