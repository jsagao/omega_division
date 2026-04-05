import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://widgets.coingecko.com/gecko-coin-list-widget.js";
const SCALE = 0.64;

const CoinGeckoCoinList: React.FC = () => {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    const el = innerRef.current;
    if (el && !el.querySelector("gecko-coin-list-widget")) {
      const widget = document.createElement("gecko-coin-list-widget");
      widget.setAttribute("locale", "en");
      widget.setAttribute("outlined", "true");
      widget.setAttribute("coin-ids", "ripple,bitcoin,world-liberty-financial");
      widget.setAttribute("initial-currency", "usd");
      el.appendChild(widget);
    }

    // Observe size changes to adjust outer wrapper height
    const ro = new ResizeObserver(() => {
      if (el) setHeight(el.scrollHeight * SCALE);
    });
    if (el) ro.observe(el);
    // Also poll briefly since widget may load asynchronously
    const t = setInterval(() => {
      if (el) setHeight(el.scrollHeight * SCALE);
    }, 500);
    const cleanup = setTimeout(() => clearInterval(t), 8000);

    return () => {
      ro.disconnect();
      clearInterval(t);
      clearTimeout(cleanup);
    };
  }, []);

  return (
    <div>
      <h4 className="text-[10px] font-mono text-gold/50 tracking-[0.15em] uppercase mb-2">
        Crypto Watchlist
      </h4>
      <div className="overflow-hidden" style={{ height }}>
        <div
          ref={innerRef}
          style={{
            width: `${Math.round(100 / SCALE)}%`,
            transformOrigin: "top left",
            transform: `scale(${SCALE})`,
          }}
        />
      </div>
    </div>
  );
};

export default CoinGeckoCoinList;
