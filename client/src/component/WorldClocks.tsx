import { useEffect, useState } from "react";

interface ClockCity {
  label: string;
  tz: string;
  marketOpen: number; // minutes from midnight
  marketClose: number;
}

const CITIES: ClockCity[] = [
  { label: "NY",  tz: "America/New_York",   marketOpen: 570,  marketClose: 960  }, // 9:30-16:00
  { label: "LDN", tz: "Europe/London",      marketOpen: 480,  marketClose: 990  }, // 8:00-16:30
  { label: "TKY", tz: "Asia/Tokyo",         marketOpen: 540,  marketClose: 900  }, // 9:00-15:00
  { label: "HK",  tz: "Asia/Hong_Kong",     marketOpen: 570,  marketClose: 960  }, // 9:30-16:00
  { label: "SGP", tz: "Asia/Singapore",     marketOpen: 540,  marketClose: 1020 }, // 9:00-17:00
];

function formatTime(tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());
}

function isMarketOpen(tz: string, openMin: number, closeMin: number): boolean {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  if (["Sat", "Sun"].includes(weekday)) return false;

  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const mins = h * 60 + m;

  return mins >= openMin && mins < closeMin;
}

export default function WorldClocks(): React.ReactElement {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {CITIES.map((c) => {
        const open = isMarketOpen(c.tz, c.marketOpen, c.marketClose);
        return (
          <div key={c.label} className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-400" : "bg-red-400"}`}
              title={open ? "Market open" : "Market closed"}
            />
            <span className="text-gold text-xs font-mono font-semibold">{c.label}</span>
            <span className="text-white text-xs font-mono">{formatTime(c.tz)}</span>
          </div>
        );
      })}
    </div>
  );
}
