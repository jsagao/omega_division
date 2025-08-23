// src/routes/HomePage.jsx
import { Link } from "react-router-dom";
import MainCategories from "../component/MainCategories";
import FeaturedPosts from "../component/FeaturedPosts";
import PostList from "../component/PostList";
import HeroStrip from "../component/HeroStrip.jsx";
// import TickerSidebar from "../component/TickerSidebar.jsx";

// --- Page ---
export default function HomePage() {
  return (
    <div
      className="mt-4 min-h-screen bg-gray-800 relative
                 bg-[radial-gradient(circle_at_top_left,_#e0e7ff_0%,_transparent_40%),radial-gradient(circle_at_bottom_right,_#fce7f3_0%,_transparent_40%)]"
    >
      {/* Decorative Ω at top-left */}
      <div className="absolute left-0 top-0 pl-2 pt-2 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-[260px] md:w-[320px] h-auto text-indigo-900 opacity-10"
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
            Ω
          </text>
        </svg>
      </div>

      {/* Fixed right sidebar (desktop+) */}
      {/* <aside
        className="hidden lg:block fixed right-0 top-16 md:top-20
                   h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]
                   w-[240px]"
      >
        <TickerSidebar apiBase="http://127.0.0.1:8000" />
      </aside> */}

      {/* Main content — remove default right padding and match sidebar width */}
      <div className="relative mx-auto max-w-[1200px] pl-4 pr-0 lg:pr-[60px]">
        <div className="flex flex-col gap-8">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-indigo-700 hover:underline">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-600">Blogs & Articles</span>
          </div>

          {/* intro */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold md:text-5xl lg:text-6xl text-black font-mono">
                Omega Division
              </h1>
              <p className="mt-4 md:mt-6 text-md md:text-xl text-gray-700 font-mono">
                Engineering the Future, One Line at a Time
              </p>
            </div>
          </div>

          {/* categories */}
          <MainCategories />

          {/* hero */}
          <HeroStrip />

          {/* featured */}
          <FeaturedPosts />

          {/* latest posts */}
          <PostList />
        </div>
      </div>
    </div>
  );
}
