// SeriesNav.tsx
import { Link } from "react-router-dom";

interface SeriesItem {
  id: number;
  title: string;
  part?: number;
  series_part?: number;
  created_at?: string;
}

interface NormalizedItem {
  id: number;
  title: string;
  part: number | null;
  created_at: string;
}

interface SeriesPrevNext {
  id: number;
  title: string;
  part?: number;
  series_part?: number;
}

interface SeriesData {
  items?: SeriesItem[];
  all?: SeriesItem[];
  prev?: SeriesPrevNext | null;
  next?: SeriesPrevNext | null;
  series_key?: string;
}

interface SeriesNavProps {
  series: SeriesData | null | undefined;
  currentId: string | number;
}

export default function SeriesNav({ series, currentId }: SeriesNavProps): React.ReactElement | null {
  if (!series) return null;

  // normalize data to a common shape
  const items: SeriesItem[] = Array.isArray(series.items)
    ? series.items
    : Array.isArray(series.all)
      ? series.all
      : [];
  if (items.length < 2) return null;

  const normalized: NormalizedItem[] = items.map((it) => ({
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

  const current: number = Number(currentId);

  return (
    <section className="rounded-xl border border-white/5 bg-surface p-4 shadow-sm">
      <h3 className="text-base font-semibold text-white">This post is part of a series</h3>

      {series.series_key && (
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-medium text-gold">Series:</span> {series.series_key}
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
                  ? "bg-gold text-navy-900 border-gold"
                  : "bg-surface-raised text-slate-300 border-white/10 hover:bg-gold/10 hover:text-gold",
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
            className="text-sm rounded-lg border border-gold/30 text-gold px-3 py-1.5 hover:bg-gold/10"
          >
            ← Prev{typeof prev.part === "number" ? ` (Part ${prev.part})` : ""}
          </Link>
        ) : (
          <button disabled className="text-sm rounded-lg border border-white/10 text-slate-500 px-3 py-1.5 opacity-50">
            ← Prev
          </button>
        )}

        {next ? (
          <Link
            to={`/posts/${next.id}`}
            className="text-sm rounded-lg border border-gold/30 text-gold px-3 py-1.5 hover:bg-gold/10"
          >
            Next{typeof next.part === "number" ? ` (Part ${next.part})` : ""} →
          </Link>
        ) : (
          <button disabled className="text-sm rounded-lg border border-white/10 text-slate-500 px-3 py-1.5 opacity-50">
            Next →
          </button>
        )}
      </div>
    </section>
  );
}
