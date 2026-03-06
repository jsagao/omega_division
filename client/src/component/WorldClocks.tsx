import { useEffect, useState } from "react";
import { useCity } from "../context/CityContext";
import { CITIES } from "../lib/cityData";

interface ClockCity {
  label: string;
  tz: string;
  marketOpen: number;
  marketClose: number;
}

const MARKET_HOURS: Record<string, { open: number; close: number }> = {
  "America/New_York": { open: 570, close: 960 },
  "Europe/London": { open: 480, close: 990 },
  "Asia/Tokyo": { open: 540, close: 900 },
  "Asia/Hong_Kong": { open: 570, close: 960 },
  "Asia/Singapore": { open: 540, close: 1020 },
  "Europe/Berlin": { open: 540, close: 1050 },
  "Australia/Sydney": { open: 600, close: 960 },
  "Asia/Dubai": { open: 600, close: 840 },
  "Asia/Kolkata": { open: 555, close: 930 },
  "America/Sao_Paulo": { open: 600, close: 1020 },
};

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
  const { city: selectedCity } = useCity();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Show selected city first, then 4 others
  const ordered: ClockCity[] = [];
  const selectedConfig = CITIES.find((c) => c.id === selectedCity.id);
  if (selectedConfig) {
    const hours = MARKET_HOURS[selectedConfig.timezone] ?? { open: 540, close: 960 };
    ordered.push({ label: selectedConfig.short, tz: selectedConfig.timezone, marketOpen: hours.open, marketClose: hours.close });
  }
  for (const c of CITIES) {
    if (c.id === selectedCity.id) continue;
    if (ordered.length >= 5) break;
    const hours = MARKET_HOURS[c.timezone] ?? { open: 540, close: 960 };
    ordered.push({ label: c.short, tz: c.timezone, marketOpen: hours.open, marketClose: hours.close });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {ordered.map((c) => {
        const open = isMarketOpen(c.tz, c.marketOpen, c.marketClose);
        const isSelected = c.label === selectedCity.short;
        return (
          <div key={c.label} className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-400" : "bg-red-400"}`}
              title={open ? "Market open" : "Market closed"}
            />
            <span className={`text-xs font-mono font-semibold ${isSelected ? "text-gold" : "text-gold/50"}`}>
              {c.label}
            </span>
            <span className="text-white text-xs font-mono">{formatTime(c.tz)}</span>
          </div>
        );
      })}
    </div>
  );
}
