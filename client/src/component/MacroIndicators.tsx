import { useCity } from "../context/CityContext";

export default function MacroIndicators(): React.ReactElement {
  const { city } = useCity();

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Macro — {city.short}
      </h4>
      <div className="space-y-1.5">
        {city.macroIndicators.map((ind) => {
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
