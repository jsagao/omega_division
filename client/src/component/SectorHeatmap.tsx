import { useEffect, useState } from "react";
import { useCity } from "../context/CityContext";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

function heatColor(pct: number): string {
  if (pct >= 2) return "bg-emerald-500";
  if (pct >= 1) return "bg-emerald-600";
  if (pct >= 0.25) return "bg-emerald-700/70";
  if (pct >= -0.25) return "bg-slate-700";
  if (pct >= -1) return "bg-red-700/70";
  if (pct >= -2) return "bg-red-600";
  return "bg-red-500";
}

export default function SectorHeatmap(): React.ReactElement {
  const { city } = useCity();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const symbols = city.sectorSymbols.split(",");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${city.sectorSymbols}`);
        if (!res.ok) return;
        const json: { quotes: Quote[] } = await res.json();
        if (alive) setQuotes(json.quotes);
      } catch { /* non-critical */ }
    })();
    return () => { alive = false; };
  }, [city.sectorSymbols]);

  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Sectors — {city.short}
      </h4>
      <div className="grid grid-cols-3 gap-1">
        {symbols.map((sym) => {
          const q = quoteMap.get(sym);
          const label = city.sectorLabels[sym] ?? sym;
          const pct = q?.percent ?? 0;
          const sign = pct >= 0 ? "+" : "";
          return (
            <div
              key={sym}
              className={`rounded p-1.5 text-center ${q ? heatColor(pct) : "bg-surface-raised animate-pulse"}`}
            >
              <p className="text-[9px] font-mono text-white/80 font-bold truncate">{label}</p>
              {q && (
                <p className="text-[10px] font-mono text-white font-semibold">
                  {sign}{pct.toFixed(1)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
