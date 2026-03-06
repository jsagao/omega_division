import { useEffect, useRef, useMemo } from "react";
import { useCity } from "../context/CityContext";

/** Map Yahoo Finance symbols → TradingView symbols */
const TV_SYMBOL_MAP: Record<string, string> = {
  "^GSPC": "SP:SPX",
  "^DJI": "DJ:DJI",
  "^IXIC": "NASDAQ:IXIC",
  "^FTSE": "LSE:UKX",
  "^N225": "TVC:NI225",
  "^HSI": "HSI:HSI",
  "^STI": "SGX:STI",
  "^GDAXI": "XETR:DAX",
  "^AXJO": "ASX:XJO",
  "^BSESN": "BSE:SENSEX",
  "^BVSP": "BMFBOVESPA:IBOV",
  "^DFMGI": "DFM:DFMGI",
};

function toTvSymbol(yf: string): string {
  return TV_SYMBOL_MAP[yf] ?? yf.replace(/^\^/, "");
}

export default function TradingViewChart(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { city } = useCity();

  const tvSymbol = useMemo(() => toTvSymbol(city.primaryIndex), [city.primaryIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "AAPL",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 15, 30, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [tvSymbol]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
          {city.primaryLabel}
        </h4>
        <span className="text-[9px] font-mono text-slate-600">{tvSymbol}</span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] md:min-h-[480px] rounded-lg overflow-hidden"
      />
    </div>
  );
}
