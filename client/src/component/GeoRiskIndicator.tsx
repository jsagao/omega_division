const SCORE = 58;

interface MiniItem {
  label: string;
  value: string;
}

const MINI_ITEMS: MiniItem[] = [
  { label: "US-CN", value: "0.72 \u2193" },
  { label: "MIDEAST", value: "HIGH" },
  { label: "RU-UA", value: "CRITICAL" },
];

function statusLabel(score: number): { text: string; color: string } {
  if (score < 20) return { text: "LOW", color: "text-emerald-400" };
  if (score < 40) return { text: "MODERATE", color: "text-emerald-300" };
  if (score < 60) return { text: "ELEVATED", color: "text-yellow-400" };
  if (score < 80) return { text: "HIGH", color: "text-orange-400" };
  return { text: "CRITICAL", color: "text-red-400" };
}

function barGradientPosition(score: number): string {
  // green -> yellow -> red
  if (score < 50) {
    const r = Math.round((score / 50) * 255);
    const g = 200;
    return `rgb(${r}, ${g}, 50)`;
  }
  const g = Math.round(200 - ((score - 50) / 50) * 160);
  return `rgb(255, ${g}, 50)`;
}

export default function GeoRiskIndicator(): React.ReactElement {
  const { text, color } = statusLabel(SCORE);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
        Global Geo-Risk
      </span>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-mono font-bold text-white">{SCORE}</span>
        <span className="text-xs font-mono text-slate-500">/100</span>
        <span className={`text-xs font-mono font-semibold ${color}`}>{text}</span>
      </div>

      {/* Bar */}
      <div className="relative h-2 w-full rounded-full bg-navy-800 overflow-hidden">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(to right, #22c55e, #eab308, #ef4444)",
          }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-navy-900 shadow-md"
          style={{
            left: `${SCORE}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: barGradientPosition(SCORE),
          }}
        />
      </div>

      {/* Mini items */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {MINI_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500">{item.label}:</span>
            <span className="text-[10px] font-mono text-white font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
