import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function HeroStrip(): React.ReactElement {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-700 via-navy-800 to-navy-700 border border-white/5">
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 h-64 w-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="h-full w-full text-gold">
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="8" />
          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="6" />
          <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative p-6 md:p-8">
        <p className="text-xs tracking-[0.2em] uppercase text-gold font-mono">
          Code &middot; Capital &middot; Creativity
        </p>
        <h2 className="mt-2 text-2xl md:text-4xl font-extrabold text-white">
          Ideas worth shipping.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400 md:text-lg">
          Exploring the edge of technology, data, business, and ideas worth building. Discover
          insights, projects, and stories shaping the digital future.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-medium text-navy-900 hover:bg-gold-light transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
            Browse Research
          </Link>

          {isAdmin && (
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-lg border border-gold/30 px-5 py-2.5 font-medium text-gold hover:bg-gold/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.563 4.5 19.5l.937-3.75L16.862 3.487z"
                />
              </svg>
              Write a Post
            </Link>
          )}

          <span className="ml-1 text-sm text-slate-500 font-mono">No fluff. Just alpha.</span>
        </div>
      </div>
    </section>
  );
}
