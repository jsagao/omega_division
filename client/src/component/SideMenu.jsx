// src/component/SideMenu.jsx
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useCallback } from "react";
import Search from "./Search";

// Keep these in sync with your app-wide categories
const CATEGORIES = [
  { label: "All", value: "all" }, // special: shows everything
  { label: "Programming", value: "programming" },
  { label: "Data Science", value: "data-science" },
  { label: "Business", value: "business" },
  { label: "Technology", value: "technology" },
  { label: "Development", value: "development" },
  { label: "Travel", value: "travel" },
];

const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Most Popular", value: "most-popular" },
  { label: "Trending", value: "trending" },
  { label: "Oldest", value: "oldest" },
];

export default function SideMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeSort = (searchParams.get("sort") || "newest").toLowerCase();
  const activeCat = pathname.startsWith("/category/")
    ? pathname.replace(/^\/category\//, "").toLowerCase()
    : (searchParams.get("cat") || "all").toLowerCase();

  // Helper to update a single query param while preserving others
  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value === null || value === undefined || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // When changing sort, stay on the same page/route and only update ?sort=
  function onChangeSort(e) {
    updateParam("sort", e.target.value);
  }

  // Build category hrefs; prefer pretty /category/:slug routes like the rest of the app
  const categoryLinks = useMemo(() => {
    return CATEGORIES.map((c) => {
      if (c.value === "all") {
        // go to /posts and drop cat param
        const next = new URLSearchParams(searchParams);
        next.delete("cat");
        return { ...c, href: `/posts${next.toString() ? `?${next.toString()}` : ""}` };
      }
      // pretty route, preserve existing params but remove conflicting cat query if present
      const next = new URLSearchParams(searchParams);
      next.delete("cat");
      const qs = next.toString();
      return { ...c, href: `/category/${c.value}${qs ? `?${qs}` : ""}` };
    });
  }, [searchParams]);

  return (
    <aside className="px-4 h-max sticky top-8">
      {/* Search */}
      <h2 className="mb-4 text-sm font-medium">Search</h2>
      <Search />

      {/* Filter / Sort */}
      <h2 className="mb-4 mt-6 text-sm font-medium">Filter</h2>
      <div className="flex flex-col gap-2 text-sm">
        {SORTS.map((s) => (
          <label key={s.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={s.value}
              onChange={onChangeSort}
              checked={activeSort === s.value}
              className="appearance-none w-4 h-4 border-[1.5px] border-blue-800 cursor-pointer rounded-sm checked:bg-blue-800"
            />
            {s.label}
          </label>
        ))}
      </div>

      {/* Categories */}
      <h2 className="mb-4 mt-6 text-sm font-medium">Categories</h2>
      <nav className="flex flex-col gap-2 text-sm">
        {categoryLinks.map((c) => {
          const isActive = (c.value === "all" && activeCat === "all") || activeCat === c.value;
          return (
            <Link
              key={c.value}
              className={`underline ${isActive ? "text-blue-800 font-medium" : ""}`}
              to={c.href}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
