// src/component/PostListItem.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Image from "./Image";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; // optional, for client delete-by-token

const CATEGORY_FALLBACKS = {
  programming: "/featured1.jpeg",
  "data-science": "/featured3.jpeg",
  business: "/featured5.jpeg",
  technology: "/featured6.jpeg",
  development: "/featured2.jpeg",
  travel: "/featured4.jpeg",
  general: "/featured2.jpeg",
};

function thumbSrcFor(post) {
  const cover = (post?.cover_image_url || "").trim();
  if (cover) return cover;
  const key = (post?.category || "general").toLowerCase();
  return CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
}

/**
 * Try Cloudinary client-side deletion using a short-lived delete token.
 * Works only if the upload preset had `return_delete_token: true` AND within ~10 minutes of upload.
 */
async function tryCloudinaryDeleteByToken(deleteToken) {
  if (!CLOUD_NAME || !deleteToken) return false;
  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`;
    const fd = new FormData();
    fd.append("token", deleteToken);
    const res = await fetch(url, { method: "POST", body: fd });
    // 200 even when token expired sometimes returns an error JSON; we just attempt best-effort
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Optional server-side fallback (if you implemented it):
 * POST /cloudinary/destroy { url: string }
 * Your FastAPI route would safely parse public_id and delete with Admin API.
 */
async function tryServerDestroy(url) {
  if (!url) return false;
  try {
    const res = await fetch(`${API}/cloudinary/destroy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function PostListItem({ post, onDeleted }) {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [deleting, setDeleting] = useState(false);
  const [gone, setGone] = useState(false); // local collapse if parent doesn't remove fast

  const title = post?.title || "Untitled";
  const author = post?.author || "anonymous";
  const category = post?.category || "general";

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAdmin || !post?.id) return;
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeleting(true);

      // 1) Optimistically update DOM
      onDeleted?.(post.id);
      setGone(true);

      // 2) Best-effort Cloudinary cleanup for cover image
      // Prefer client delete-by-token if you stored it in DB as post.cover_delete_token
      const coverUrl = (post?.cover_image_url || "").trim();
      const coverDeleteToken = post?.cover_delete_token || null;

      if (coverDeleteToken) {
        await tryCloudinaryDeleteByToken(coverDeleteToken);
      } else if (coverUrl) {
        // If you implemented the server endpoint, this will delete by URL (public_id parsed server-side)
        await tryServerDestroy(coverUrl);
      }

      // 3) Delete the post in your API (your backend may also do its own cleanup)
      const res = await fetch(`${API}/posts/${post.id}`, { method: "DELETE" });
      if (!(res.ok || res.status === 204 || res.status === 404)) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      alert("Could not delete the post. Please try again.");
      // revert local collapse if parent didn't remove
      setGone(false);
    } finally {
      setDeleting(false);
    }
  }

  if (gone) return null;

  return (
    <article
      className={`p-4 border rounded-lg bg-white flex items-center gap-4 transition
                  ${deleting ? "opacity-60 pointer-events-none" : "hover:-translate-y-1 hover:shadow-lg"}`}
    >
      {/* Thumbnail */}
      <Link to={`/posts/${post.id}`} className="shrink-0 w-28 h-20 overflow-hidden rounded-md">
        <Image
          src={thumbSrcFor(post)}
          alt={title}
          className="w-28 h-20 object-cover"
          width={112}
          height={80}
          onError={(e) => {
            const key = (post?.category || "general").toLowerCase();
            e.currentTarget.src = CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
          }}
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/posts/${post.id}`}
          className="block text-base md:text-lg font-semibold text-indigo-700 hover:underline truncate"
          title={title}
        >
          {title}
        </Link>

        {/* Meta: Author • Category */}
        <div className="mt-1 text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>By</span>
          {/* Route to About page when clicking author */}
          <Link to="/about" className="font-medium text-indigo-700 hover:underline">
            {author}
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to={`/category/${encodeURIComponent(category.toLowerCase())}`}
            className="text-indigo-700 hover:underline"
          >
            {category}
          </Link>
        </div>

        {/* Excerpt */}
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post?.excerpt || ""}</p>
      </div>

      {/* Admin-only delete */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </article>
  );
}
