import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const DEFAULT_SYMBOLS = ["SPY", "QQQ", "BTC-USD", "GLD", "TLT"];

interface Quote {
  symbol: string;
  price: number;
  percent: number;
  change: number;
}

export default function Watchlist(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    const syms = DEFAULT_SYMBOLS.join(",");
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${syms}`);
        if (!res.ok) return;
        const json: { quotes: Quote[] } = await res.json();
        if (alive) setQuotes(json.quotes);
      } catch { /* non-critical */ }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Watchlist
      </h4>
      <div className="space-y-1.5">
        {quotes.length === 0
          ? DEFAULT_SYMBOLS.map((s) => (
              <div key={s} className="flex justify-between">
                <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-raised animate-pulse" />
              </div>
            ))
          : quotes.map((q) => {
              const color = q.percent >= 0 ? "text-emerald-400" : "text-red-400";
              const sign = q.percent >= 0 ? "+" : "";
              return (
                <div key={q.symbol} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gold font-semibold">{q.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">
                      {q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`${color} text-[10px] w-14 text-right`}>
                      {sign}{q.percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
