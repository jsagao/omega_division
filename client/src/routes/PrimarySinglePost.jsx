// src/routes/PrimarySinglePost.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Image from "../component/Image.jsx";
import PostMenuActions from "../component/PostMenuActions.jsx";
import Search from "../component/Search.jsx";
import Comments from "../component/Comments.jsx";
import ConfirmModal from "../component/ConfirmModal.jsx";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// category → fallback hero images
const CATEGORY_IMAGES = {
  "web-design": "/featured1.jpeg",
  development: "/featured2.jpeg",
  databases: "/featured3.jpeg",
  "search-engines": "/featured4.jpeg",
  marketing: "/featured5.jpeg",
};

export default function PrimarySinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [open, setOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Append Update modal state
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendHtml, setAppendHtml] = useState("");
  const [appending, setAppending] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/posts/${id}`, { signal: ctrl.signal });
        if (res.status === 404) return setStatus("notfound");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPost(data);
        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") setStatus("error");
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  // Hero image = cover → category fallback
  const heroSrc = useMemo(() => {
    if (!post) return "/featured2.jpeg";
    const cover = (post.cover_image_url || "").trim();
    if (cover) return cover;
    const key = (post.category || "").toLowerCase();
    return CATEGORY_IMAGES[key] || "/featured2.jpeg";
  }, [post]);

  async function handleDelete() {
    try {
      setLoadingDelete(true);
      const res = await fetch(`${API}/posts/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        setOpen(false);
        navigate("/posts");
        return;
      }
      throw new Error(`Delete failed: HTTP ${res.status}`);
    } catch (err) {
      console.error(err);
      alert("Could not delete the post. Please try again.");
    } finally {
      setLoadingDelete(false);
    }
  }

  async function handleAppend() {
    const html = (appendHtml || "").trim();
    if (!html) return;

    try {
      setAppending(true);
      const stamp = new Date().toLocaleString();
      const updateBlock = `
        <hr/>
        <section class="post-update">
          <h3>Update <span class="post-update__time">(${stamp})</span></h3>
          ${html}
        </section>
      `;
      const base = (post.content || post.description || "").trim();
      const nextContent = base ? `${base}\n${updateBlock}` : updateBlock;

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = await res.json();
      setPost(updated);
      setAppendOpen(false);
      setAppendHtml("");
    } catch (err) {
      console.error(err);
      alert("Could not append the update. Please try again.");
    } finally {
      setAppending(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="h-64 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-gray-700">Post not found.</p>
        <Link to="/posts" className="text-indigo-700 underline">
          ← Back to posts
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-red-600">Something went wrong loading the post.</p>
        <Link to="/posts" className="text-indigo-700 underline">
          ← Back to posts
        </Link>
      </div>
    );
  }

  // status === 'ok'
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 flex flex-col gap-10">
      {/* Header + hero */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5 flex flex-col gap-6">
          <h1 className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-black">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-gray-500 text-sm">
            <span>By</span>
            <Link to="/about" className="text-indigo-700 font-semibold hover:underline">
              {post.author || "anonymous"}
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to={`/posts?cat=${encodeURIComponent(post.category || "general")}`}
              className="text-indigo-700 hover:underline"
            >
              {post.category || "general"}
            </Link>
          </div>

          <p className="text-gray-600 leading-relaxed">{post.excerpt || ""}</p>
        </div>

        <div className="hidden lg:block w-full lg:w-2/5">
          <Image
            src={heroSrc}
            alt={post.title || "Post Image"}
            w="800"
            h="600"
            className="rounded-xl w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Body + sidebar */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="md:flex-1 lg:w-3/4 lg:text-lg flex flex-col gap-6">
          <div
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content || post.description || ""),
            }}
          />
        </div>

        {/* Sidebar */}
        <aside className="md:w-80 lg:w-50 px-0 md:px-2 lg:px-2">
          <div className="px-4 py-2 h-max sticky top-8 bg-transparent">
            <h2 className="mb-4 text-sm font-medium">Author</h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/google-avatar.png" // 👈 Always default Google-style avatar
                  alt={`${post?.author || "anonymous"} avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                  w="48"
                  h="48"
                />
                <Link to="/about" className="text-blue-800 hover:underline">
                  {post.author || "anonymous"}
                </Link>
              </div>

              <p className="text-sm text-gray-500">
                Passionate writer about {post.category || "tech"}.
              </p>
            </div>

            {isAdmin && (
              <>
                <PostMenuActions
                  editTo={`/posts/${id}/edit`}
                  resourceName={`"${post?.title || "this post"}"`}
                  onDelete={() => setOpen(true)}
                />
                <div className="mt-3">
                  <button
                    onClick={() => setAppendOpen(true)}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500"
                  >
                    Add Update
                  </button>
                </div>
                <ConfirmModal
                  open={open}
                  title="Delete Post?"
                  message={`Are you sure you want to delete "${post?.title}"? This action cannot be undone.`}
                  confirmText="Delete"
                  cancelText="Cancel"
                  loading={loadingDelete}
                  onConfirm={handleDelete}
                  onClose={() => setOpen(false)}
                />
              </>
            )}

            <h2 className="mt-8 mb-4 text-sm font-medium">Search</h2>
            <Search />
          </div>
        </aside>
      </div>

      <Comments postId={id} />

      {isAdmin && appendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !appending && setAppendOpen(false)}
          />
          <div className="relative z-10 w-[min(95vw,900px)] max-h-[85vh] overflow-auto rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Add Update</h3>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={appendHtml}
              onChange={setAppendHtml}
              placeholder="Write your update..."
              style={{ height: 260, marginBottom: 56 }}
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded border text-gray-700"
                onClick={() => setAppendOpen(false)}
                disabled={appending}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={handleAppend}
                disabled={appending}
              >
                {appending ? "Saving..." : "Save Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
