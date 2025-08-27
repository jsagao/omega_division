// src/component/SeriesNav.jsx
import { Link } from "react-router-dom";

export default function SeriesNav({ series }) {
  if (!series || !series.all || series.all.length <= 1) return null;

  return (
    <div className="mt-8 p-4 rounded-xl border bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          This post is part of: <span className="font-bold">{series.series_key}</span>
        </h4>
        <div className="flex gap-2">
          {series.prev && (
            <Link
              to={`/posts/${series.prev.id}`}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
            >
              ← Part {series.prev.part}
            </Link>
          )}
          {series.next && (
            <Link
              to={`/posts/${series.next.id}`}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
            >
              Part {series.next.part} →
            </Link>
          )}
        </div>
      </div>

      <ol className="space-y-1 text-sm">
        {series.all.map((it) => (
          <li key={it.id}>
            <Link to={`/posts/${it.id}`} className="text-indigo-700 hover:underline">
              Part {it.part}: {it.title}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
