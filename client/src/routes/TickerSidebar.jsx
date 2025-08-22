import { useEffect, useMemo, useState } from "react";

export default function TickerSidebar({
  apiBase = "http://127.0.0.1:8000",
  symbols = [
    "^GSPC",
    "^NDX",
    "^DJI",
    "^RUT",
    "^VIX",
    "^N225",
    "^HSI",
    "^FTSE",
    "^GDAXI",
    "^FCHI",
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "GOOGL",
    "TSLA",
    "META",
    "AMD",
    "BTC-USD",
    "ETH-USD",
    "XAUUSD=X",
    "CL=F",
    "NG=F",
  ],
  refreshMs = 30000,
}) {
  const qs = useMemo(() => encodeURIComponent(symbols.join(",")), [symbols]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/quotes?symbols=${qs}`);
      const json = await res.json();
      setQuotes(json?.quotes ?? []);
    } catch (e) {
      console.error("Failed to load quotes", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [qs, apiBase, refreshMs]);

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto border-l border-gray-200 p-3 bg-white/60 backdrop-blur rounded-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">Markets</h3>
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="text-xs text-gray-500">Loading…</div>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => {
            const up = (q?.change ?? 0) >= 0;
            return (
              <li
                key={q.symbol}
                className="flex items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-sm truncate">{q.symbol}</span>
                  <span className="text-[11px] text-gray-500">
                    {q.exchange || q.currency || ""}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm tabular-nums">{q.price ?? "—"}</div>
                  <div
                    className={`text-[11px] font-medium tabular-nums ${
                      up ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {q.change?.toFixed?.(2) ?? "—"} ({q.percent?.toFixed?.(2) ?? "—"}%)
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
