import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://widgets.coingecko.com/gecko-coin-list-widget.js";

const CoinGeckoCoinList: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load script once globally
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    // Insert the custom element
    const el = containerRef.current;
    if (el && !el.querySelector("gecko-coin-list-widget")) {
      const widget = document.createElement("gecko-coin-list-widget");
      widget.setAttribute("locale", "en");
      widget.setAttribute("outlined", "true");
      widget.setAttribute("coin-ids", "ripple,bitcoin,world-liberty-financial");
      widget.setAttribute("initial-currency", "usd");
      el.appendChild(widget);
    }
  }, []);

  return (
    <div>
      <h4 className="text-[10px] font-mono text-gold/50 tracking-[0.15em] uppercase mb-2">
        Crypto Watchlist
      </h4>
      <div ref={containerRef} className="[&>gecko-coin-list-widget]:!bg-transparent" />
    </div>
  );
};

export default CoinGeckoCoinList;
