import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function HeroStrip() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin"; // 👈 check role

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
      <div className="absolute -right-10 -top-10 h-64 w-64 opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="8" />
          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="6" />
          <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      <div className="p-6 md:p-8">
        <p className="text-sm tracking-wide uppercase text-white/90">Code. Capital. Creativity.</p>
        <h2 className="mt-1 text-2xl md:text-4xl font-extrabold">Ideas worth shipping.</h2>
        <p className="mt-3 max-w-2xl text-white/90 md:text-lg">
          Exploring the edge of technology, data, business, and ideas worth building. Discover
          insights, projects, and stories shaping the digital future.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-indigo-700 hover:bg-white/90"
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
            Browse Posts
          </Link>

          {/* Admin-only */}
          {isAdmin && (
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 font-medium hover:bg-white/10"
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

          <span className="ml-1 text-sm text-white/80">No fluff. Just useful content.</span>
        </div>
      </div>
    </section>
  );
}
