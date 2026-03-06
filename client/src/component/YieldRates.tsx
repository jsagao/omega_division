import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const YIELDS = "^IRX,^FVX,^TNX,^TYX";

const LABELS: Record<string, string> = {
  "^IRX": "3M T-Bill",
  "^FVX": "5Y Note",
  "^TNX": "10Y Note",
  "^TYX": "30Y Bond",
};

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

export default function YieldRates(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${YIELDS}`);
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
        Yields
      </h4>
      <div className="space-y-1.5">
        {quotes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-16 rounded bg-surface-raised animate-pulse" />
                <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
              </div>
            ))
          : quotes.map((q) => {
              const label = LABELS[q.symbol] ?? q.symbol;
              const color = q.percent >= 0 ? "text-emerald-400" : "text-red-400";
              const sign = q.percent >= 0 ? "+" : "";
              return (
                <div key={q.symbol} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {q.price.toFixed(2)}%
                    </span>
                    <span className={`${color} text-[10px]`}>
                      {sign}{q.percent.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
