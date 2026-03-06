const INDICATORS = [
  { label: "Fed Funds Rate", value: "5.33%", change: 0, note: "Held" },
  { label: "CPI (YoY)", value: "3.1%", change: -0.2, note: "Feb" },
  { label: "Unemployment", value: "3.7%", change: 0.1, note: "Feb" },
  { label: "GDP (QoQ)", value: "3.2%", change: 0.4, note: "Q4" },
  { label: "PCE (YoY)", value: "2.8%", change: -0.1, note: "Jan" },
  { label: "10Y Real Yield", value: "2.05%", change: 0.03, note: "Mar" },
];

export default function MacroIndicators(): React.ReactElement {
  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Macro Dashboard
      </h4>
      <div className="space-y-1.5">
        {INDICATORS.map((ind) => {
          const color = ind.change > 0 ? "text-emerald-400" : ind.change < 0 ? "text-red-400" : "text-slate-400";
          const arrow = ind.change > 0 ? "\u25B2" : ind.change < 0 ? "\u25BC" : "\u25C6";
          return (
            <div key={ind.label} className="flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[9px] ${color}`}>{arrow}</span>
                <span className="text-slate-300 truncate">{ind.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white font-semibold">{ind.value}</span>
                <span className="text-[9px] text-slate-600">{ind.note}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
