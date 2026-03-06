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
        className="flex-1 rounded-lg bg-navy-800 border border-white/10 text-slate-300 placeholder-slate-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold/50"
        aria-label="Search posts"
      />
      <button
        type="submit"
        className="px-3 py-2 rounded-lg bg-gold text-navy-900 text-sm hover:bg-gold-light"
        aria-label="Search"
      >
        Search
      </button>

      {/* Optional clear button appears only when there's text */}
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="px-2 py-2 rounded-lg border border-white/10 text-slate-400 text-sm hover:bg-white/5"
          aria-label="Clear search"
          title="Clear"
        >
          ✕
        </button>
      )}
    </form>
  );
}
