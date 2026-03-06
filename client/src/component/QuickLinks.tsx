import { Link } from "react-router-dom";

const LINKS = [
  { label: "Portfolio", to: "/portfolio", icon: "M3 3h18v18H3z" },
  { label: "Research", to: "/posts", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "News Feed", to: "/news", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" },
  { label: "Write Article", to: "/write", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { label: "About", to: "/about", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function QuickLinks(): React.ReactElement {
  return (
    <div>
      <h4 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-2">
        Quick Links
      </h4>
      <div className="space-y-1">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-2 py-1 px-1 -mx-1 rounded text-xs font-mono text-slate-400 hover:text-gold hover:bg-white/[0.03] transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-gold/40 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d={link.icon} />
            </svg>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
