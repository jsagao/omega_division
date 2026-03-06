// src/component/SideMenu.tsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Search from "./Search";

interface CategoryOption {
  name: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
}

// Keep in sync with MainCategories
const CATEGORIES: CategoryOption[] = [
  { name: "All", value: "" },
  { name: "Programming", value: "Programming" },
  { name: "Data Science", value: "Data-science" },
  { name: "Business", value: "Business" },
  { name: "Technology", value: "Technology" },
  { name: "Development", value: "Development" },
  { name: "Travel", value: "Travel" },
];

// Optional sorts (query param: ?sort=...)
const SORTS: SortOption[] = [
  { label: "Newest", value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Trending", value: "trending" },
  { label: "Oldest", value: "oldest" },
];

export default function SideMenu(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeCat: string = searchParams.get("cat") || "";
  const activeSort: string = (searchParams.get("sort") || "newest").toLowerCase();

  function onChangeSort(e: React.ChangeEvent<HTMLInputElement>): void {
    const next = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set("sort", next);
    navigate(`/posts?${params.toString()}`);
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
              checked={activeSort === s.value}
              onChange={onChangeSort}
              className="appearance-none w-4 h-4 border-[1.5px] border-blue-800 cursor-pointer rounded-sm checked:bg-blue-800"
            />
            {s.label}
          </label>
        ))}
      </div>

      <h2 className="mb-4 mt-6 text-sm font-medium">Categories</h2>
      <nav className="flex flex-col gap-2 text-sm">
        {CATEGORIES.map((c) => {
          const params = new URLSearchParams(searchParams);
          if (c.value) params.set("cat", c.value);
          else params.delete("cat");
          const href = `/posts${params.toString() ? `?${params.toString()}` : ""}`;

          const isActive = activeCat === c.value;

          return (
            <Link
              key={c.name}
              to={href}
              className={[
                "px-3 py-1.5 rounded-md transition",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-700 underline hover:no-underline hover:bg-indigo-50",
              ].join(" ")}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
