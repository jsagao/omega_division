import { useEffect, useState } from "react";
import { useCity } from "../context/CityContext";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

export default function GainersLosers(): React.ReactElement {
  const { city } = useCity();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${city.trendingSymbols}`);
        if (!res.ok) return;
        const json: { quotes: Quote[] } = await res.json();
        if (alive) setQuotes(json.quotes);
      } catch { /* non-critical */ }
    })();
    return () => { alive = false; };
  }, [city.trendingSymbols]);

  const sorted = [...quotes].sort((a, b) => b.percent - a.percent);
  const gainers = sorted.filter((q) => q.percent >= 0).slice(0, 5);
  const losers = sorted.filter((q) => q.percent < 0).slice(0, 5);

  const Row = ({ q }: { q: Quote }) => {
    const color = q.percent >= 0 ? "text-emerald-400" : "text-red-400";
    const sign = q.percent >= 0 ? "+" : "";
    return (
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-white">{q.symbol.split(".")[0]}</span>
        <span className={color}>
          {sign}{q.percent.toFixed(2)}%
        </span>
      </div>
    );
  };

  if (quotes.length === 0) {
    return (
      <div>
        <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
          Movers — {city.short}
        </h4>
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
              <div className="h-3 w-12 rounded bg-surface-raised animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Movers — {city.short}
      </h4>
      {gainers.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] font-mono text-emerald-500/70 tracking-wider uppercase mb-1">Gainers</p>
          <div className="space-y-1">
            {gainers.map((q) => <Row key={q.symbol} q={q} />)}
          </div>
        </div>
      )}
      {losers.length > 0 && (
        <div>
          <p className="text-[9px] font-mono text-red-500/70 tracking-wider uppercase mb-1">Losers</p>
          <div className="space-y-1">
            {losers.map((q) => <Row key={q.symbol} q={q} />)}
          </div>
        </div>
      )}
    </div>
  );
}
