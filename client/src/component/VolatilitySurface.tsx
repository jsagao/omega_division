import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

interface Quote {
  symbol: string;
  price: number;
  percent: number;
}

const VOL_SYMBOLS = "^VIX,^VIX9D,^VIX3M,^VIX6M";
const LABELS: Record<string, string> = {
  "^VIX9D": "9-Day",
  "^VIX": "30-Day",
  "^VIX3M": "3-Month",
  "^VIX6M": "6-Month",
};
const ORDER = ["^VIX9D", "^VIX", "^VIX3M", "^VIX6M"];

function barColor(val: number): string {
  if (val >= 30) return "bg-red-500";
  if (val >= 20) return "bg-orange-400";
  if (val >= 15) return "bg-gold";
  return "bg-emerald-500";
}

export default function VolatilitySurface(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${VOL_SYMBOLS}`);
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
        VIX Term Structure
      </h4>
      <div className="space-y-2">
        {ORDER.map((sym) => {
          const q = quoteMap.get(sym);
          const val = q?.price ?? 0;
          const width = Math.min(100, (val / 40) * 100);
          return (
            <div key={sym}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-mono text-slate-400">{LABELS[sym]}</span>
                <span className="text-[11px] font-mono text-white font-semibold">
                  {q ? val.toFixed(1) : "—"}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5">
                {q ? (
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor(val)}`}
                    style={{ width: `${width}%` }}
                  />
                ) : (
                  <div className="h-full w-1/3 rounded-full bg-surface-raised animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {quotes.length > 0 && (
        <p className="text-[9px] font-mono text-slate-600 mt-2">
          {quoteMap.get("^VIX9D") && quoteMap.get("^VIX") &&
           (quoteMap.get("^VIX9D")!.price > quoteMap.get("^VIX")!.price
            ? "Inverted — near-term stress elevated"
            : "Contango — normal term structure")}
        </p>
      )}
    </div>
  );
}
