import { useEffect, useState } from "react";
import { useCity } from "../context/CityContext";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

export default function TrendingTickers(): React.ReactElement {
  const { city } = useCity();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${city.trendingSymbols}`);
        if (!res.ok) return;
        const json: { quotes: Quote[] } = await res.json();
        if (alive) setQuotes(json.quotes);
      } catch { /* non-critical */ }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [city.trendingSymbols]);

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Trending — {city.short}
      </h4>
      <div className="space-y-1.5">
        {quotes.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
                <div className="h-3 w-14 rounded bg-surface-raised animate-pulse" />
              </div>
            ))
          : quotes.map((q) => {
              const color = q.percent >= 0 ? "text-emerald-400" : "text-red-400";
              const sign = q.percent >= 0 ? "+" : "";
              return (
                <div key={q.symbol} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-semibold">{q.symbol.split(".")[0]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">
                      {q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`${color} w-14 text-right`}>
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
