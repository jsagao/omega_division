// src/component/MainCategories.jsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";

export default function MainCategories() {
  const categories = [
    { name: "All Posts", value: "" }, // -> /posts
    { name: "Programming", value: "Programming" },
    { name: "Data Science", value: "Data-science" },
    { name: "Business", value: "Business" },
    { name: "Technology", value: "Technology" },
    { name: "Development", value: "Development" },
    { name: "Travel", value: "Travel" },
  ];

  const [params] = useSearchParams();
  const active = params.get("cat") || "";
  const [q, setQ] = useState("");
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
              "px-4 py-2 rounded-lg border text-sm md:text-base transition",
              isActive
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-indigo-50",
            ].join(" ")}
          >
            {c.name}
          </Link>
        );
      }),
    [categories, active]
  );

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/posts?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-white p-4 md:p-5 rounded-xl shadow-md border border-gray-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">{catPills}</div>

        {/* Search */}
        <form onSubmit={onSearch} className="w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
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
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search posts…"
              className="bg-transparent outline-none text-sm md:w-64"
            />
            <button
              type="submit"
              className="text-sm rounded-full bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
