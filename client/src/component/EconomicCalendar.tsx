const EVENTS = [
  { date: "Mar 7", time: "08:30", name: "Non-Farm Payrolls", impact: "high" },
  { date: "Mar 12", time: "08:30", name: "CPI (YoY)", impact: "high" },
  { date: "Mar 18-19", time: "14:00", name: "FOMC Decision", impact: "high" },
  { date: "Mar 20", time: "08:30", name: "Jobless Claims", impact: "med" },
  { date: "Mar 28", time: "08:30", name: "GDP (Q4 Final)", impact: "med" },
];

const IMPACT_COLOR: Record<string, string> = {
  high: "bg-red-500",
  med: "bg-gold",
  low: "bg-emerald-500",
};

export default function EconomicCalendar(): React.ReactElement {
  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Econ Calendar
      </h4>
      <div className="space-y-2">
        {EVENTS.map((ev, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${IMPACT_COLOR[ev.impact]}`} />
            <div className="min-w-0">
              <p className="text-xs font-mono text-white leading-tight truncate">{ev.name}</p>
              <p className="text-[10px] font-mono text-slate-500">
                {ev.date} &middot; {ev.time} ET
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
