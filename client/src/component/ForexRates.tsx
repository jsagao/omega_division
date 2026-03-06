import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const PAIRS = "EURUSD=X,GBPUSD=X,JPY=X,CADUSD=X";

const LABELS: Record<string, string> = {
  "EURUSD=X": "EUR/USD",
  "GBPUSD=X": "GBP/USD",
  "JPY=X": "USD/JPY",
  "CADUSD=X": "USD/CAD",
};

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

export default function ForexRates(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${PAIRS}`);
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
        Forex
      </h4>
      <div className="space-y-1.5">
        {quotes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-14 rounded bg-surface-raised animate-pulse" />
                <div className="h-3 w-12 rounded bg-surface-raised animate-pulse" />
              </div>
            ))
          : quotes.map((q) => {
              const label = LABELS[q.symbol] ?? q.symbol;
              const color = q.percent >= 0 ? "text-emerald-400" : "text-red-400";
              const sign = q.percent >= 0 ? "+" : "";
              return (
                <div key={q.symbol} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gold/70 font-semibold">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">
                      {q.price.toFixed(4)}
                    </span>
                    <span className={`${color} text-[10px]`}>
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
