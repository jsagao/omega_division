import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";
import { useCity } from "../context/CityContext";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type Period = "1mo" | "3mo" | "6mo" | "1y" | "2y";

const PERIODS: { label: string; value: Period }[] = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
];

export default function TradingViewChart(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { city } = useCity();
  const [period, setPeriod] = useState<Period>("6mo");
  const [loading, setLoading] = useState(true);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0f1e" },
        textColor: "#64748b",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.05)",
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.05)",
      },
      crosshair: {
        vertLine: { color: "rgba(201,168,76,0.3)", labelBackgroundColor: "#c9a84c" },
        horzLine: { color: "rgba(201,168,76,0.3)", labelBackgroundColor: "#c9a84c" },
      },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Fetch data when city or period changes
  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/chart?symbol=${encodeURIComponent(city.primaryIndex)}&period=${period}&interval=1d`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { bars: CandlestickData<Time>[] } = await res.json();

        if (alive && seriesRef.current && json.bars.length > 0) {
          seriesRef.current.setData(json.bars);
          chartRef.current?.timeScale().fitContent();
        }
      } catch {
        // silently fail
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [city.primaryIndex, period]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
            {city.primaryLabel}
          </h4>
          <span className="text-[9px] font-mono text-slate-600">{city.primaryIndex}</span>
          {loading && (
            <span className="text-[9px] font-mono text-gold/50 animate-pulse">Loading...</span>
          )}
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider transition-all ${
                period === p.value
                  ? "bg-gold text-navy-900"
                  : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-gold"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] md:min-h-[380px] rounded-lg overflow-hidden"
      />
    </div>
  );
}
