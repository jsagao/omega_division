// src/component/Search.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SearchProps {
  placeholder?: string;
  initial?: string;
}

export default function Search({ placeholder = "Search posts…", initial = "" }: SearchProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState<string>(initial);

  function go(): void {
    const trimmed = q.trim();
    // Send to the posts list with ?q=... (PostList already handles this)
    navigate(`/posts${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    go();
  }

  return (
    <form onSubmit={onSubmit} className="flex items-stretch gap-2">
      <input
        type="search"
        value={q}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Search posts"
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        aria-label="Search"
      >
        Search
      </button>

      {/* Optional clear button appears only when there's text */}
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="px-2 py-2 rounded-lg border text-sm hover:bg-gray-50"
          aria-label="Clear search"
          title="Clear"
        >
          ✕
        </button>
      )}
    </form>
  );
}
