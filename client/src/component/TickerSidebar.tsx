import { useEffect, useMemo, useState } from "react";

const DEFAULT_SYMBOLS: string[] = [
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
  "CL=F",
  "NG=F",
  "^N225",
  "^HSI",
  "^FTSE",
  "^GDAXI",
  "^FCHI",
];

interface QuoteData {
  symbol: string;
  price?: number;
  change?: number;
  percent?: number;
  exchange?: string;
  currency?: string;
}

interface QuotesResponse {
  quotes?: QuoteData[];
}

interface TickerSidebarProps {
  apiBase?: string;
  symbols?: string[];
  refreshMs?: number;
  className?: string;
}

export default function TickerSidebar({
  apiBase = "http://127.0.0.1:8000", // your FastAPI base
  symbols = DEFAULT_SYMBOLS, // customize as needed
  refreshMs = 30000, // 30s
  className = "",
}: TickerSidebarProps): React.ReactElement {
  const qs: string = useMemo(() => encodeURIComponent(symbols.join(",")), [symbols]);

  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/quotes?symbols=${qs}`);
      const json: QuotesResponse = await res.json();
      setQuotes(json.quotes ?? []);
    } catch (e) {
      console.error("load quotes failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t: ReturnType<typeof setInterval> = setInterval(load, refreshMs);
    return () => clearInterval(t);
  }, [qs, apiBase, refreshMs]);

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] overflow-auto border-l
                  border-white/5 bg-surface p-3 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white">Markets</h3>
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded border border-gold/30 text-gold hover:bg-gold/10"
        >
          Refresh
        </button>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="text-xs text-slate-500">Loading…</div>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => {
            const up: boolean = (q.change ?? 0) >= 0;
            return (
              <li
                key={q.symbol}
                className="flex items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-sm truncate text-slate-300">{q.symbol}</span>
                  <span className="text-[11px] text-slate-500">
                    {q.exchange || q.currency || ""}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm tabular-nums text-white">
                    {q.price?.toLocaleString?.() ?? "—"}
                  </div>
                  <div
                    className={`text-[11px] font-medium tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}
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
