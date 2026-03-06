import { useState } from "react";

export default function NewsletterSignup(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <span className="text-emerald-400 font-mono text-sm font-semibold">Subscribed!</span>
        <span className="text-slate-500 font-mono text-xs">Check your inbox for confirmation.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-mono font-semibold text-gold tracking-wide">
        WEEKLY ALPHA
      </span>
      <span className="text-xs font-mono text-slate-400">
        Get our research digest delivered.
      </span>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-navy-800 text-white text-xs font-mono px-3 py-2 rounded-lg border border-white/10 focus:border-gold/50 focus:outline-none transition-colors placeholder-slate-600"
        />
        <button
          type="submit"
          className="w-full bg-gold hover:bg-gold-light text-navy-900 text-xs font-mono font-semibold px-3 py-2 rounded-lg transition-colors tracking-wider"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
}
