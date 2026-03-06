import { useEffect, useState } from "react";

interface FGData {
  value: number;
  label: string;
}

function getLabel(v: number): string {
  if (v <= 20) return "Extreme Fear";
  if (v <= 40) return "Fear";
  if (v <= 60) return "Neutral";
  if (v <= 80) return "Greed";
  return "Extreme Greed";
}

function getColor(v: number): string {
  if (v <= 20) return "text-red-500";
  if (v <= 40) return "text-orange-400";
  if (v <= 60) return "text-slate-300";
  if (v <= 80) return "text-emerald-400";
  return "text-emerald-500";
}

export default function CryptoFearGreed(): React.ReactElement {
  const [data, setData] = useState<FGData | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        if (!res.ok) throw new Error();
        const json = await res.json();
        const val = parseInt(json.data?.[0]?.value ?? "50", 10);
        if (alive) setData({ value: val, label: getLabel(val) });
      } catch {
        // Fallback to static
        if (alive) setData({ value: 55, label: "Neutral" });
      }
    })();
    return () => { alive = false; };
  }, []);

  const value = data?.value ?? 50;
  const pct = value + "%";

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Crypto Fear &amp; Greed
      </h4>
      {data ? (
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-mono font-bold ${getColor(value)}`}>{value}</span>
            <span className={`text-xs font-mono mb-0.5 ${getColor(value)}`}>{data.label}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-emerald-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-navy-900 shadow-md"
              style={{ left: `calc(${pct} - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-slate-600">
            <span>Fear</span>
            <span>Neutral</span>
            <span>Greed</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-7 w-16 rounded bg-surface-raised animate-pulse" />
          <div className="h-2 rounded-full bg-surface-raised animate-pulse" />
        </div>
      )}
    </div>
  );
}
