import { useCity } from "../context/CityContext";

interface CalendarEvent {
  date: string;
  time: string;
  name: string;
  impact: string;
}

const CITY_EVENTS: Record<string, CalendarEvent[]> = {
  nyc: [
    { date: "Mar 7", time: "08:30", name: "Non-Farm Payrolls", impact: "high" },
    { date: "Mar 12", time: "08:30", name: "CPI (YoY)", impact: "high" },
    { date: "Mar 18-19", time: "14:00", name: "FOMC Decision", impact: "high" },
    { date: "Mar 20", time: "08:30", name: "Jobless Claims", impact: "med" },
    { date: "Mar 28", time: "08:30", name: "GDP (Q4 Final)", impact: "med" },
  ],
  ldn: [
    { date: "Mar 13", time: "07:00", name: "UK GDP (MoM)", impact: "high" },
    { date: "Mar 20", time: "07:00", name: "UK CPI (YoY)", impact: "high" },
    { date: "Mar 21", time: "12:00", name: "BoE Rate Decision", impact: "high" },
    { date: "Mar 22", time: "09:30", name: "UK Retail Sales", impact: "med" },
    { date: "Mar 27", time: "07:00", name: "UK PMI", impact: "med" },
  ],
  tky: [
    { date: "Mar 8", time: "08:50", name: "Japan GDP (QoQ)", impact: "high" },
    { date: "Mar 15", time: "—", name: "BoJ Rate Decision", impact: "high" },
    { date: "Mar 19", time: "08:30", name: "Japan Trade Balance", impact: "med" },
    { date: "Mar 22", time: "08:30", name: "Japan CPI (YoY)", impact: "high" },
    { date: "Mar 29", time: "08:50", name: "Industrial Production", impact: "med" },
  ],
  hkg: [
    { date: "Mar 11", time: "09:30", name: "China CPI (YoY)", impact: "high" },
    { date: "Mar 15", time: "10:00", name: "China Industrial Output", impact: "high" },
    { date: "Mar 18", time: "09:15", name: "PBoC LPR", impact: "high" },
    { date: "Mar 20", time: "08:30", name: "HK Unemployment", impact: "med" },
    { date: "Mar 29", time: "09:00", name: "China PMI", impact: "high" },
  ],
  sgp: [
    { date: "Mar 11", time: "08:00", name: "SG GDP (QoQ)", impact: "high" },
    { date: "Mar 15", time: "13:00", name: "MAS Policy", impact: "high" },
    { date: "Mar 18", time: "08:00", name: "Non-Oil Exports", impact: "med" },
    { date: "Mar 22", time: "08:00", name: "CPI (YoY)", impact: "med" },
    { date: "Mar 29", time: "08:00", name: "PMI", impact: "med" },
  ],
  fra: [
    { date: "Mar 7", time: "10:00", name: "ECB Rate Decision", impact: "high" },
    { date: "Mar 11", time: "07:00", name: "Germany CPI", impact: "high" },
    { date: "Mar 15", time: "10:00", name: "EZ Industrial Output", impact: "med" },
    { date: "Mar 22", time: "09:30", name: "Germany PMI", impact: "high" },
    { date: "Mar 25", time: "09:00", name: "Ifo Business Climate", impact: "med" },
  ],
  syd: [
    { date: "Mar 5", time: "11:30", name: "RBA Rate Decision", impact: "high" },
    { date: "Mar 7", time: "11:30", name: "AU GDP (QoQ)", impact: "high" },
    { date: "Mar 14", time: "11:30", name: "AU Employment", impact: "high" },
    { date: "Mar 20", time: "11:30", name: "AU CPI Monthly", impact: "med" },
    { date: "Mar 28", time: "11:30", name: "Retail Sales", impact: "med" },
  ],
  dxb: [
    { date: "Mar 5", time: "—", name: "UAE PMI", impact: "med" },
    { date: "Mar 10", time: "—", name: "OPEC Monthly Report", impact: "high" },
    { date: "Mar 15", time: "—", name: "UAE CPI", impact: "med" },
    { date: "Mar 18", time: "—", name: "UAE Trade Balance", impact: "med" },
    { date: "Mar 25", time: "—", name: "Saudi GDP", impact: "med" },
  ],
  mum: [
    { date: "Mar 8", time: "14:00", name: "RBI Rate Decision", impact: "high" },
    { date: "Mar 12", time: "17:30", name: "India CPI (YoY)", impact: "high" },
    { date: "Mar 15", time: "17:30", name: "India WPI", impact: "med" },
    { date: "Mar 20", time: "17:30", name: "Trade Balance", impact: "med" },
    { date: "Mar 29", time: "17:30", name: "India GDP (QoQ)", impact: "high" },
  ],
  sao: [
    { date: "Mar 8", time: "—", name: "Brazil IPCA (MoM)", impact: "high" },
    { date: "Mar 12", time: "—", name: "Brazil Retail Sales", impact: "med" },
    { date: "Mar 19-20", time: "18:30", name: "Copom Decision", impact: "high" },
    { date: "Mar 22", time: "—", name: "Brazil Unemployment", impact: "med" },
    { date: "Mar 28", time: "—", name: "Brazil GDP (QoQ)", impact: "high" },
  ],
};

const IMPACT_COLOR: Record<string, string> = {
  high: "bg-red-500",
  med: "bg-gold",
  low: "bg-emerald-500",
};

export default function EconomicCalendar(): React.ReactElement {
  const { city } = useCity();
  const events = CITY_EVENTS[city.id] ?? CITY_EVENTS.nyc;

  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Econ Calendar — {city.short}
      </h4>
      <div className="space-y-2">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${IMPACT_COLOR[ev.impact]}`} />
            <div className="min-w-0">
              <p className="text-xs font-mono text-white leading-tight truncate">{ev.name}</p>
              <p className="text-[10px] font-mono text-slate-500">
                {ev.date} &middot; {ev.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
