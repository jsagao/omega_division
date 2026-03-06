import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";

interface Category {
  name: string;
  value: string;
}

export default function MainCategories(): React.ReactElement {
  const categories: Category[] = [
    { name: "All Posts", value: "" },
    { name: "Programming", value: "Programming" },
    { name: "Data Science", value: "Data-science" },
    { name: "Business", value: "Business" },
    { name: "Technology", value: "Technology" },
    { name: "Development", value: "Development" },
    { name: "Travel", value: "Travel" },
  ];

  const [params] = useSearchParams();
  const active: string = params.get("cat") || "";
  const [q, setQ] = useState<string>("");
  const navigate = useNavigate();

  const catPills = useMemo(
    () =>
      categories.map((c) => {
        const to = c.value ? `/posts?cat=${encodeURIComponent(c.value)}` : "/posts";
        const isActive = (c.value || "") === active;
        return (
          <Link
            key={c.name}
            to={to}
            className={[
              "px-4 py-2 rounded-lg border text-sm font-mono tracking-wide transition-all",
              isActive
                ? "bg-gold/15 text-gold border-gold/30"
                : "bg-transparent text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/20 hover:bg-white/5",
            ].join(" ")}
          >
            {c.name}
          </Link>
        );
      }),
    [categories, active]
  );

  function onSearch(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/posts?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="p-4 md:p-5 rounded-xl bg-surface border border-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">{catPills}</div>

        <form onSubmit={onSearch} className="w-full md:w-auto">
          <div className="flex items-center gap-2 bg-navy-800 px-3 py-2 rounded-lg border border-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
              type="text"
              placeholder="Search posts..."
              className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 md:w-48"
            />
            <button
              type="submit"
              className="text-sm rounded-md bg-gold/15 px-3 py-1 text-gold hover:bg-gold/25 transition-colors font-mono"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
