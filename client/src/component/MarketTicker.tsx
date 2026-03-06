import { useEffect, useState } from "react";

const API: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const SYMBOLS = "^GSPC,^DJI,^IXIC,BTC-USD,ETH-USD,GC=F,CL=F,^VIX,^TNX,EURUSD=X";

const LABEL_MAP: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "DOW",
  "^IXIC": "NASDAQ",
  "BTC-USD": "BTC",
  "ETH-USD": "ETH",
  "GC=F": "GOLD",
  "CL=F": "OIL",
  "^VIX": "VIX",
  "^TNX": "10Y",
  "EURUSD=X": "EUR/USD",
};

interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  percent: number;
  exchange: string;
  currency: string;
}

export default function MarketTicker(): React.ReactElement {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${API}/api/quotes?symbols=${SYMBOLS}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { quotes: Quote[] } = await res.json();
        if (alive) {
          setQuotes(json.quotes);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full border-t border-gold/40 bg-navy-900/80 backdrop-blur overflow-hidden">
        <div className="flex gap-8 px-4 py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className="h-3 w-12 rounded bg-surface-raised animate-pulse" />
              <div className="h-3 w-16 rounded bg-surface-raised animate-pulse" />
              <div className="h-3 w-10 rounded bg-surface-raised animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (quotes.length === 0) return <div />;

  const items = quotes.map((q) => {
    const label = LABEL_MAP[q.symbol] ?? q.symbol;
    const pct = q.percent;
    const color = pct >= 0 ? "text-emerald-400" : "text-red-400";
    const sign = pct >= 0 ? "+" : "";
    return (
      <span key={q.symbol} className="inline-flex items-center gap-2 shrink-0 px-4">
        <span className="text-gold/80 text-xs font-mono font-semibold">{label}</span>
        <span className="text-white text-xs font-mono">
          {q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`text-xs font-mono ${color}`}>
          {sign}{pct.toFixed(2)}%
        </span>
      </span>
    );
  });

  return (
    <div className="w-full border-t border-gold/40 bg-navy-900/80 backdrop-blur overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap py-2">
        <div className="ticker-content flex">{items}</div>
        <div className="ticker-content flex" aria-hidden="true">{items}</div>
      </div>
      <style>{`
        .ticker-track {
          display: flex;
        }
        .ticker-content {
          animation: ticker-scroll 40s linear infinite;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
