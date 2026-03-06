import { useCity } from "../context/CityContext";

function sentimentLabel(v: number): string {
  if (v <= 20) return "EXTREME FEAR";
  if (v <= 40) return "FEAR";
  if (v <= 60) return "NEUTRAL";
  if (v <= 80) return "GREED";
  return "EXTREME GREED";
}

export default function SentimentGauge(): React.ReactElement {
  const { city } = useCity();
  const pct = Math.max(0, Math.min(100, city.sentimentScore));
  const label = sentimentLabel(pct);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
        Sentiment — {city.short}
      </span>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-mono font-bold text-white">{pct}</span>
        <span className="text-xs font-mono text-gold">{label}</span>
      </div>

      <div className="relative h-2 w-full rounded-full overflow-hidden">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #ef4444, #f59e0b, #eab308, #22c55e, #16a34a)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold border-2 border-navy-900 shadow-md"
          style={{ left: `${pct}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      <div className="flex justify-between text-[9px] font-mono text-slate-600">
        <span>EXTREME FEAR</span>
        <span>NEUTRAL</span>
        <span>EXTREME GREED</span>
      </div>
    </div>
  );
}
