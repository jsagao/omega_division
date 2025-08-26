// src/component/SideMenu.jsx
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Search from "./Search";
import { useMemo } from "react";

// Keep in sync with MainCategories / FeaturedPosts
const CATEGORIES = [
  { name: "All", value: "all" }, // special: routes to /posts
  { name: "Programming", value: "programming" },
  { name: "Data Science", value: "data-science" },
  { name: "Business", value: "business" },
  { name: "Technology", value: "technology" },
  { name: "Development", value: "development" },
  { name: "Travel", value: "travel" },
];

// Optional sort values understood by your backend (/posts?sort=…)
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Trending", value: "trending" },
  { label: "Oldest", value: "oldest" },
];

export default function SideMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  // Figure out the active category from pretty route or ?cat=
  const routeCat = pathname.startsWith("/category/")
    ? pathname.replace(/^\/category\//, "").toLowerCase()
    : null;
  const queryCat = (searchParams.get("cat") || "").toLowerCase();
  const activeCat = routeCat || queryCat || "all";

  // Current sort (default to newest)
  const sort = (searchParams.get("sort") || "newest").toLowerCase();

  // Build category links; preserve other params (q, sort, etc.)
  const catLinks = useMemo(() => {
    return CATEGORIES.map((c) => {
      const params = new URLSearchParams(searchParams);
      params.delete("cat"); // prefer pretty /category route
      const qs = params.toString();
      const href =
        c.value === "all"
          ? `/posts${qs ? `?${qs}` : ""}`
          : `/category/${c.value}${qs ? `?${qs}` : ""}`;

      const isActive = activeCat === c.value;

      return (
        <Link
          key={c.value}
          to={href}
          className={[
            "px-3 py-1.5 rounded-md text-sm transition",
            isActive
              ? "bg-indigo-600 text-white"
              : "text-indigo-700 underline hover:no-underline hover:bg-indigo-50",
          ].join(" ")}
        >
          {c.name}
        </Link>
      );
    });
  }, [activeCat, searchParams]);

  // Update sort while preserving current category (route) and other params
  function onChangeSort(e) {
    const next = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("sort", next);

    if (activeCat && activeCat !== "all") {
      params.delete("cat"); // avoid duplicate signals
      navigate(`/category/${activeCat}?${params.toString()}`);
    } else {
      navigate(`/posts?${params.toString()}`);
    }
  }

  return (
    <aside className="px-4 h-max sticky top-8">
      <h2 className="mb-4 text-sm font-medium">Search</h2>
      <Search />

      <h2 className="mb-4 mt-6 text-sm font-medium">Filter</h2>
      <div className="flex flex-col gap-2 text-sm">
        {SORTS.map((s) => (
          <label key={s.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={s.value}
              checked={sort === s.value}
              onChange={onChangeSort}
              className="appearance-none w-4 h-4 border-[1.5px] border-blue-800 cursor-pointer rounded-sm checked:bg-blue-800"
            />
            {s.label}
          </label>
        ))}
      </div>

      <h2 className="mb-4 mt-6 text-sm font-medium">Categories</h2>
      <nav className="flex flex-col gap-2 text-sm">{catLinks}</nav>
    </aside>
  );
}
