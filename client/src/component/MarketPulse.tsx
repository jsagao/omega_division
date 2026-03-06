import { useEffect, useState } from "react";
import { useCity } from "../context/CityContext";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  percent: number;
  exchange: string;
  currency: string;
}

function fmtPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MarketPulse(): React.ReactElement {
  const { city } = useCity();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  // Build symbols from city config: primary index, secondary (if any), currency, plus BTC & VIX as globals
  const symbols = [
    city.primaryIndex,
    city.secondaryIndex,
    city.currencyPair,
    "BTC-USD",
  ]
    .filter(Boolean)
    .join(",");

  const labelMap: Record<string, string> = {
    [city.primaryIndex]: city.primaryLabel,
    ...(city.secondaryIndex ? { [city.secondaryIndex]: city.secondaryLabel! } : {}),
    [city.currencyPair]: city.currencyLabel,
    "BTC-USD": "BTC",
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${symbols}`);
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
    return () => { alive = false; clearInterval(id); };
  }, [symbols]);

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
        const label = labelMap[q.symbol] ?? q.symbol;
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
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
              {label}
            </span>
            <span className="text-sm font-mono text-white font-semibold">
              {fmtPrice(q.price)}
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
