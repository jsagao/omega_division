const FEED = [
  {
    handle: "@OmegaDivision",
    text: "Markets pricing in 75bps of cuts by year-end. Our models see 50bps max. Positioning accordingly.",
    time: "2h",
  },
  {
    handle: "@QuantDesk",
    text: "VIX term structure inversion signals near-term volatility. Hedging gamma exposure into FOMC.",
    time: "4h",
  },
  {
    handle: "@MacroAlpha",
    text: "China PMI beat expectations at 51.2. Watch copper and AUD/USD for confirmation of reflation trade.",
    time: "6h",
  },
  {
    handle: "@GeoRiskMonitor",
    text: "Strait of Hormuz traffic down 12% WoW. Oil vol surface steepening on geopolitical premium.",
    time: "8h",
  },
];

export default function SocialFeed(): React.ReactElement {
  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Signal Feed
      </h4>
      <div className="space-y-2.5">
        {FEED.map((item, i) => (
          <div key={i} className="border-b border-white/5 pb-2 last:border-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-mono text-gold/70 font-semibold">{item.handle}</span>
              <span className="text-[10px] font-mono text-slate-600">{item.time}</span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
