// src/component/Comments.jsx
import { useEffect, useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import Image from "./Image";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Comments({ postId }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading|ok|error
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // load comments
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/posts/${postId}/comments?limit=50`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") {
          setStatus("error");
        }
      }
    })();
    return () => ctrl.abort();
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const text = body.trim();
    if (!text) {
      setErr("Please enter a comment.");
      return;
    }
    try {
      setSubmitting(true);

      const authorName =
        user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "anonymous";

      // Optimistic add
      const optimistic = {
        id: `tmp-${Date.now()}`,
        post_id: Number(postId),
        author: authorName,
        body: text,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [optimistic, ...prev]);

      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: Number(postId), author: authorName, body: text }),
      });

      if (!res.ok) {
        // rollback on failure
        setItems((prev) => prev.filter((c) => c.id !== optimistic.id));
        const msg = await res.text().catch(() => "");
        throw new Error(`Failed to comment (HTTP ${res.status}) ${msg}`);
      }

      const saved = await res.json();
      // replace optimistic with saved
      setItems((prev) => [saved, ...prev.filter((c) => c.id !== optimistic.id)]);
      setBody("");
    } catch (e) {
      setErr(e.message || "Could not post your comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Write box */}
      <SignedIn>
        <form onSubmit={handleSubmit} className="mb-6">
          {err && (
            <div className="mb-2 p-2 rounded bg-red-50 text-red-700 text-sm border border-red-200">
              {err}
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment…"
            className="w-full bg-white shadow-md p-4 rounded-xl outline-none min-h-[120px]"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Signed in as{" "}
              <span className="font-medium">
                {user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </form>
      </SignedIn>

      <SignedOut>
        <div className="mb-6 p-4 rounded-xl border bg-white flex items-center justify-between">
          <span className="text-sm text-gray-700">Sign in to join the discussion.</span>
          <SignInButton mode="modal">
            <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* List */}
      {status === "loading" && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-red-600">Couldn’t load comments. Try refreshing.</p>
      )}

      {status === "ok" && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-600">No comments yet.</p>
          ) : (
            items.map((c) => (
              <div key={c.id} className="flex gap-4 rounded-xl p-4 bg-gray-50">
                <Image
                  src="/userImg.jpeg"
                  className="w-10 h-10 rounded-full object-cover"
                  alt="User"
                  w="40"
                  h="40"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-gray-800">
                      {c.author || "anonymous"}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
