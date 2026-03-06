import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

const NAV_LINKS = [
  { to: "/", label: "HOME" },
  { to: "/news", label: "NEWS" },
  { to: "/posts", label: "RESEARCH" },
  { to: "/portfolio", label: "PORTFOLIO" },
  { to: "/about", label: "ABOUT" },
] as const;

export default function Navbar(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const location = useLocation();

  useEffect(() => {
    if (open) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prev || "";
      };
    }
  }, [open]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full h-16 md:h-20 flex items-center justify-between px-4 md:px-8
                   bg-navy-900/80 backdrop-blur-xl border-b border-white/5
                   text-slate-200 transition-colors"
        role="navigation"
        aria-label="Main"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/image.png" alt="Omega Division logo" className="w-8 h-8" />
          <span className="text-xl font-mono font-semibold tracking-wider text-gold group-hover:text-gold-light transition-colors">
            OMEGA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 text-sm font-mono font-medium tracking-wider transition-colors rounded-lg
                  ${isActive
                    ? "text-gold bg-white/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="ml-4 flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-1.5 text-sm font-mono font-medium tracking-wider rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors">
                  LOGIN
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {isAdmin && (
                <Link
                  to="/write"
                  title="Write a post"
                  className="p-2 rounded-lg hover:bg-white/5 text-gold transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.563 4.5 19.5l.937-3.75L16.862 3.487z"
                    />
                  </svg>
                </Link>
              )}
              <UserButton />
              <SignOutButton>
                <button className="px-3 py-1.5 text-sm font-mono tracking-wider rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
                  LOGOUT
                </button>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide-in */}
      <aside
        className={`md:hidden fixed top-0 right-0 z-[70] h-screen w-[85%] max-w-[420px]
          bg-navy-900 border-l border-white/5
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Mobile menu"
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <img src="/image.png" alt="Omega Division logo" className="w-7 h-7" />
            <span className="text-lg font-mono font-semibold text-gold tracking-wider">OMEGA</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-4 py-6">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive =
              to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 text-lg font-mono tracking-wider rounded-lg transition-colors
                  ${isActive
                    ? "text-gold bg-white/5"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full px-4 py-3 text-center font-mono tracking-wider rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  LOGIN
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {isAdmin && (
                <Link
                  to="/write"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 font-mono tracking-wider rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.563 4.5 19.5l.937-3.75L16.862 3.487z"
                    />
                  </svg>
                  WRITE
                </Link>
              )}
              <SignOutButton>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full px-4 py-3 text-center font-mono tracking-wider rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  LOGOUT
                </button>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      </aside>
    </>
  );
}
