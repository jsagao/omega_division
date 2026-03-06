import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const SECTORS = [
  { symbol: "XLK", label: "Tech" },
  { symbol: "XLF", label: "Financials" },
  { symbol: "XLV", label: "Health" },
  { symbol: "XLE", label: "Energy" },
  { symbol: "XLY", label: "Consumer" },
  { symbol: "XLI", label: "Industrial" },
  { symbol: "XLC", label: "Comms" },
  { symbol: "XLRE", label: "Real Est" },
  { symbol: "XLU", label: "Utilities" },
  { symbol: "XLP", label: "Staples" },
  { symbol: "XLB", label: "Materials" },
];

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
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const syms = SECTORS.map((s) => s.symbol).join(",");
        const res = await fetch(`${API}/api/quotes?symbols=${syms}`);
        if (!res.ok) return;
        const json: { quotes: Quote[] } = await res.json();
        if (alive) setQuotes(json.quotes);
      } catch { /* non-critical */ }
    })();
    return () => { alive = false; };
  }, []);

  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        S&amp;P Sectors
      </h4>
      <div className="grid grid-cols-3 gap-1">
        {SECTORS.map((s) => {
          const q = quoteMap.get(s.symbol);
          const pct = q?.percent ?? 0;
          const sign = pct >= 0 ? "+" : "";
          return (
            <div
              key={s.symbol}
              className={`rounded p-1.5 text-center ${q ? heatColor(pct) : "bg-surface-raised animate-pulse"}`}
            >
              <p className="text-[9px] font-mono text-white/80 font-bold truncate">{s.label}</p>
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
