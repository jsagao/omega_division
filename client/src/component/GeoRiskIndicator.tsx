import { useCity } from "../context/CityContext";

function statusLabel(score: number): { text: string; color: string } {
  if (score < 20) return { text: "LOW", color: "text-emerald-400" };
  if (score < 40) return { text: "MODERATE", color: "text-emerald-300" };
  if (score < 60) return { text: "ELEVATED", color: "text-yellow-400" };
  if (score < 80) return { text: "HIGH", color: "text-orange-400" };
  return { text: "CRITICAL", color: "text-red-400" };
}

function barGradientPosition(score: number): string {
  if (score < 50) {
    const r = Math.round((score / 50) * 255);
    return `rgb(${r}, 200, 50)`;
  }
  const g = Math.round(200 - ((score - 50) / 50) * 160);
  return `rgb(255, ${g}, 50)`;
}

export default function GeoRiskIndicator(): React.ReactElement {
  const { city } = useCity();
  const score = city.geoRiskScore;
  const { text, color } = statusLabel(score);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
        Geo-Risk — {city.short}
      </span>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-mono font-bold text-white">{score}</span>
        <span className="text-xs font-mono text-slate-500">/100</span>
        <span className={`text-xs font-mono font-semibold ${color}`}>{text}</span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-navy-800 overflow-hidden">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(to right, #22c55e, #eab308, #ef4444)" }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-navy-900 shadow-md"
          style={{
            left: `${score}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: barGradientPosition(score),
          }}
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {city.geoRiskItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500">{item.label}:</span>
            <span className="text-[10px] font-mono text-white font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
