import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const SYMBOLS = "^GSPC,BTC-USD,^VIX,GC=F";

const LABEL_MAP: Record<string, string> = {
  "^GSPC": "S&P 500",
  "BTC-USD": "BTC",
  "^VIX": "VIX",
  "GC=F": "GOLD",
};

interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  percent: number;
  exchange: string;
  currency: string;
}

function fmtPrice(symbol: string, price: number): string {
  if (symbol === "BTC-USD") {
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    return price.toFixed(1);
  }
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MarketPulse(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${SYMBOLS}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { quotes: Quote[] } = await res.json();
        if (alive) {
          setQuotes(json.quotes);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface border border-white/5 p-3 space-y-2">
            <div className="h-3 w-12 rounded bg-surface-raised animate-pulse" />
            <div className="h-4 w-16 rounded bg-surface-raised animate-pulse" />
            <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {quotes.map((q) => {
        const label = LABEL_MAP[q.symbol] ?? q.symbol;
        const pct = q.percent;
        const up = pct >= 0;
        const color = up ? "text-emerald-400" : "text-red-400";
        const arrow = up ? "\u25B2" : "\u25BC";
        const sign = up ? "+" : "";

        return (
          <div
            key={q.symbol}
            className="rounded-xl bg-surface border border-white/5 p-3 flex flex-col gap-1"
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-sm font-mono text-white font-semibold">
              {fmtPrice(q.symbol, q.price)}
            </span>
            <span className={`text-xs font-mono ${color}`}>
              {arrow} {sign}{pct.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
