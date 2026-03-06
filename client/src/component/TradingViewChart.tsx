import { useEffect, useRef } from "react";
import { useCity } from "../context/CityContext";

// TradingView uses its own symbol format, not Yahoo Finance tickers
const TV_SYMBOL_MAP: Record<string, string> = {
  "^GSPC": "SP:SPX",
  "^DJI": "DJ:DJI",
  "^IXIC": "NASDAQ:IXIC",
  "^FTSE": "FTSE:UKX",
  "^N225": "TVC:NI225",
  "^HSI": "HSI:HSI",
  "^STI": "SGX:STI",
  "^GDAXI": "XETR:DAX",
  "^AXJO": "ASX:XJO",
  "^DFMGI": "DFM:DFMGI",
  "^BSESN": "BSE:SENSEX",
  "^NSEI": "NSE:NIFTY",
  "^BVSP": "BMFBOVESPA:IBOV",
};

function toTvSymbol(yahooSymbol: string): string {
  return TV_SYMBOL_MAP[yahooSymbol] ?? yahooSymbol.replace(/^\^/, "");
}

export default function TradingViewChart(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { city } = useCity();

  const tvSymbol = toTvSymbol(city.primaryIndex);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: city.timezone,
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 15, 30, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_side_toolbar: true,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [tvSymbol, city.timezone]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase">
          {city.primaryLabel} — {city.name}
        </h4>
        <span className="text-[9px] font-mono text-slate-600">{city.primaryIndex}</span>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container flex-1 min-h-[300px] md:min-h-[380px] rounded-lg overflow-hidden"
      />
    </div>
  );
}
