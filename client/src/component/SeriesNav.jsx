// Drop-in: SeriesNav.jsx (or inline above your component)
import { Link } from "react-router-dom";

export default function SeriesNav({ series, currentId }) {
  if (!series) return null;

  // normalize data to a common shape
  const items = Array.isArray(series.items)
    ? series.items
    : Array.isArray(series.all)
      ? series.all
      : [];
  if (items.length < 2) return null;

  const normalized = items.map((it) => ({
    id: it.id,
    title: it.title,
    part: (typeof it.part === "number" ? it.part : it.series_part) ?? null,
    created_at: it.created_at || "",
  }));

  // sort by part, then created_at as fallback
  normalized.sort((a, b) => {
    const ap = a.part ?? 999999;
    const bp = b.part ?? 999999;
    if (ap !== bp) return ap - bp;
    return a.created_at.localeCompare(b.created_at);
  });

  const prev = series.prev && {
    id: series.prev.id,
    title: series.prev.title,
    part:
      (typeof series.prev.part === "number" ? series.prev.part : series.prev.series_part) ?? null,
  };
  const next = series.next && {
    id: series.next.id,
    title: series.next.title,
    part:
      (typeof series.next.part === "number" ? series.next.part : series.next.series_part) ?? null,
  };

  const current = Number(currentId);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-800">This post is part of a series</h3>

      {series.series_key && (
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium">Series:</span> {series.series_key}
        </p>
      )}

      {/* pill list */}
      <div className="mt-3 flex flex-wrap gap-2">
        {normalized.map((it) => {
          const isCurrent = it.id === current;
          const label = typeof it.part === "number" ? `Part ${it.part}: ${it.title}` : it.title;
          return (
            <Link
              key={it.id}
              to={`/posts/${it.id}`}
              className={[
                "text-xs sm:text-sm px-3 py-1.5 rounded-full border transition",
                isCurrent
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-indigo-50",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* prev / next */}
      <div className="mt-3 flex items-center gap-2">
        {prev ? (
          <Link
            to={`/posts/${prev.id}`}
            className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-50"
          >
            ← Prev{typeof prev.part === "number" ? ` (Part ${prev.part})` : ""}
          </Link>
        ) : (
          <button disabled className="text-sm rounded-lg border px-3 py-1.5 opacity-50">
            ← Prev
          </button>
        )}

        {next ? (
          <Link
            to={`/posts/${next.id}`}
            className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-50"
          >
            Next{typeof next.part === "number" ? ` (Part ${next.part})` : ""} →
          </Link>
        ) : (
          <button disabled className="text-sm rounded-lg border px-3 py-1.5 opacity-50">
            Next →
          </button>
        )}
      </div>
    </section>
  );
}
