// src/component/Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prev || "";
      };
    }
  }, [open]);

  return (
    <>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 w-full h-16 md:h-20 flex items-center justify-between px-4
                   bg-white/70 dark:bg-gray-950/70 backdrop-blur
                   text-gray-900 dark:text-gray-100 transition-colors"
        role="navigation"
        aria-label="Main"
      >
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-mono">
          <img src="/image.png" alt="Omega Division logo" className="w-8 h-8 inline-block" />
          <span>Omega Division</span>
        </Link>

        {/* Right: Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-lg font-semibold font-mono text-gray-700 dark:text-gray-200">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            HOME
          </Link>
          <Link to="/news" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            NEWS
          </Link>
          <Link to="/shop" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            SHOP
          </Link>
          <Link
            to="/portfolio"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            PORTFOLIO
          </Link>
          <Link to="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            ABOUT
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/20
                           hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                LOGIN
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {isAdmin && (
              <Link to="/write" title="Write a post" className="group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-blue-700 dark:text-blue-400
                             group-hover:text-blue-900 dark:group-hover:text-blue-300 transition-colors"
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

            {/* Logout */}
            <SignOutButton>
              <button
                className="ml-3 px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/20
                           hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                LOGOUT
              </button>
            </SignOutButton>
          </SignedIn>
        </div>

        {/* Right: Mobile toggle */}
        <button
          className="md:hidden cursor-pointer text-4xl"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <img src="/list.png" alt="menu" className="w-8 h-8 inline-block" />
        </button>
      </nav>

      {/* ===== Mobile Overlay Menu ===== */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300
                    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        className={`md:hidden fixed top-0 right-0 z-[70] h-screen w-[85%] max-w-[420px]
                    bg-white text-gray-900 dark:bg-black dark:text-white
                    shadow-xl border-l border-gray-200 dark:border-white/10
                    transform transition-transform duration-300 ease-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Mobile menu"
      >
        {/* Header row */}
        <div className="h-16 md:h-20 px-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 font-mono">
            <img src="/image.png" alt="Omega Division logo" className="w-7 h-7" />
            <span className="text-lg">Omega Division</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <img src="/close.png" alt="close" className="w-7 h-7" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col items-start gap-6 px-6 py-8 text-xl font-mono">
          <Link to="/" onClick={() => setOpen(false)} className="hover:opacity-80">
            HOME
          </Link>
          <Link to="/news" onClick={() => setOpen(false)} className="hover:opacity-80">
            NEWS
          </Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="hover:opacity-80">
            SHOP
          </Link>
          <Link to="/portfolio" onClick={() => setOpen(false)} className="hover:opacity-80">
            PORTFOLIO
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className="hover:opacity-80">
            ABOUT
          </Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 rounded-md border
                           border-gray-300 dark:border-white/30
                           hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md
                           bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                title="Write a post"
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
                Write
              </Link>
            )}

            {/* Logout for mobile */}
            <SignOutButton>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 rounded-md border
                           border-gray-300 dark:border-white/30
                           hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                LOGOUT
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      </aside>
    </>
  );
}
