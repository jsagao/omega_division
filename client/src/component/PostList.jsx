// src/component/PostList.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useUser, SignedIn } from "@clerk/clerk-react";
import PostListItem from "./PostListItem";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function PostList() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const cat = params.get("cat") || "";
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      try {
        setStatus("loading");
        const url = new URL(`${API}/posts`);
        if (q) url.searchParams.set("q", q);
        if (cat) url.searchParams.set("cat", cat);
        url.searchParams.set("limit", "10");
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") setStatus("error");
      }
    }
    load();
    return () => ctrl.abort();
  }, [q, cat]);

  async function handleDelete(id) {
    if (!isAdmin) {
      alert("You do not have permission to delete posts.");
      return;
    }
    const prev = posts;
    setPosts((list) => list.filter((p) => p.id !== id));
    try {
      const res = await fetch(`${API}/posts/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error(err);
      alert("Could not delete. Restoring list.");
      setPosts(prev);
    }
  }

  return (
    <section className="py-6 space-y-6">
      <h2 className="text-xl font-semibold">Recent Posts</h2>

      {status === "loading" && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-red-600">
          Couldn’t load posts.{" "}
          <button onClick={() => location.reload()} className="underline">
            Retry
          </button>
        </p>
      )}

      {status === "ok" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-600">
              No posts yet.
              <SignedIn>
                {isAdmin && (
                  <>
                    {" "}
                    <Link to="/write" className="text-indigo-700 underline">
                      Write one
                    </Link>
                    ?
                  </>
                )}
              </SignedIn>
            </p>
          ) : (
            posts.map((p) => (
              <PostListItem
                key={p.id}
                post={p}
                onDelete={isAdmin ? () => handleDelete(p.id) : null}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
