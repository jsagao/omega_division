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
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import "react-quill-new/dist/quill.snow.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORY_IMAGES = {
  "web-design": "/featured1.jpeg",
  development: "/featured2.jpeg",
  databases: "/featured3.jpeg",
  "search-engines": "/featured4.jpeg",
  marketing: "/featured5.jpeg",
};

/* ---------------- Helpers ---------------- */

// Extract a YouTube video ID from common URL patterns (watch, shorts, youtu.be)
function getYouTubeId(url) {
  if (!url) return null;
  const s = url.trim();

  // shorts -> capture 11-char ID
  let m = s.match(/youtube\.com\/shorts\/([\w-]{11})/i);
  if (m) return m[1];

  // watch?v=VIDEOID
  m = s.match(/[?&]v=([\w-]{11})/i);
  if (m) return m[1];

  // youtu.be/VIDEOID
  m = s.match(/youtu\.be\/([\w-]{11})/i);
  if (m) return m[1];

  return null;
}

// Vimeo numeric id
function getVimeoId(url) {
  if (!url) return null;
  const m = url.trim().match(/vimeo\.com\/(\d+)/i);
  return m ? m[1] : null;
}

// Direct MP4 or WebM?
function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || "");
}

/* -------------- Component -------------- */

export default function PrimarySinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [open, setOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // Hero: cover → author avatar → category fallback
  const heroSrc = useMemo(() => {
    if (!post) return "/featured2.jpeg";
    const cover = (post.cover_image_url || "").trim();
    if (cover) return cover;
    const authorImg = (post.author_image_url || "").trim();
    if (authorImg) return authorImg;
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

      const payload = {
        content: nextContent,
        excerpt: post.excerpt || "",
        description: post.description || post.excerpt || "",
      };

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 flex flex-col gap-10">
      {/* Reader CSS + video layout */}
      <style>{`
        .post-content { line-height: 1.75; }
        .post-content p { margin: 0.8rem 0; }
        .post-content blockquote {
          border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #374151; margin: 1rem 0;
        }
        .post-content pre, .post-content code {
          background: #f8fafc; border-radius: 0.5rem; padding: 0.25rem 0.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.95em;
        }
        .post-content pre { padding: 0.75rem 1rem; overflow:auto; }
        .post-content ul, .post-content ol { margin: 0.75rem 0 0.75rem 1.5rem; }
        .post-content li { margin: 0.25rem 0; }
        .post-content .ql-indent-1 { margin-left: 1.5rem; }
        .post-content .ql-indent-2 { margin-left: 3rem; }
        .post-content .ql-indent-3 { margin-left: 4.5rem; }
        .post-content .ql-indent-4 { margin-left: 6rem; }
        .post-content .ql-indent-5 { margin-left: 7.5rem; }
        .post-content .ql-indent-6 { margin-left: 9rem; }
        .post-content .ql-indent-7 { margin-left: 10.5rem; }
        .post-content img { max-width: 100%; height: auto; display: block; margin: 1rem auto; }
        .post-update { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; margin: 1.25rem 0; }
        .post-update h3 { font-weight: 600; margin-top: 0; margin-bottom: 0.5rem; }
        .post-update__time { font-weight: 400; color: #6b7280; font-size: 0.9em; }

        /* video layout */
        .video-grid { display: grid; gap: 1rem; }
        @media (min-width: 768px) { .video-grid { grid-template-columns: 1fr 1fr; } }
        .player-wrapper { position: relative; padding-top: 56.25%; border-radius: 0.75rem; overflow: hidden; }
        .player-wrapper .react-player { position: absolute; top:0; left:0; }
      `}</style>

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

        {/* Hero image */}
        <div className="w-full lg:w-2/5 mt-4 lg:mt-0 order-[-1] lg:order-none">
          <Image
            src={heroSrc}
            alt={post.title || "Post Image"}
            w="800"
            h="600"
            className="rounded-xl w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Body + videos + sidebar */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main */}
        <div className="md:flex-1 lg:w-3/4 lg:text-lg flex flex-col gap-6">
          {/* Body */}
          <div
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content || post.description || ""),
            }}
          />

          {/* Videos */}
          {Array.isArray(post.video_urls) && post.video_urls.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-medium text-gray-700">Videos</h2>
              <div className="video-grid">
                {post.video_urls.map((raw, i) => {
                  const url = (raw || "").trim();
                  if (!url) return null;

                  const ytId = getYouTubeId(url);
                  const vmId = getVimeoId(url);

                  if (ytId) {
                    // YouTube → super-light embed
                    return (
                      <div key={`yt-${i}-${ytId}`} className="player-wrapper bg-black/5">
                        <LiteYouTubeEmbed
                          id={ytId}
                          title={`YouTube video ${i + 1}`}
                          poster="hqdefault" // "maxresdefault" if you prefer
                          webp
                        />
                      </div>
                    );
                  }

                  if (vmId) {
                    // Vimeo → simple iframe
                    const src = `https://player.vimeo.com/video/${vmId}`;
                    return (
                      <div key={`vimeo-${i}-${vmId}`} className="player-wrapper bg-black/5">
                        <iframe
                          src={src}
                          className="react-player"
                          title={`Vimeo video ${i + 1}`}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: 0,
                          }}
                        />
                      </div>
                    );
                  }

                  if (isDirectVideo(url)) {
                    // Direct MP4/WebM → native video tag
                    return (
                      <div key={`file-${i}`} className="player-wrapper bg-black/5">
                        <video
                          controls
                          playsInline
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          src={url}
                        />
                      </div>
                    );
                  }

                  // Unknown provider — skip or render the raw link
                  return (
                    <div key={`unknown-${i}`} className="rounded-md p-3 bg-gray-50 border">
                      <p className="text-sm text-gray-600">
                        Unrecognized video link:{" "}
                        <a
                          className="text-indigo-700 underline break-all"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {url}
                        </a>
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="md:w-80 lg:w-50 px-0 md:px-2 lg:px-2">
          <div className="px-4 py-2 h-max sticky top-8 bg-transparent">
            <h2 className="mb-4 text-sm font-medium">Author</h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={(post?.author_image_url || "").trim() || "/default-avatar.png"}
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

              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <Image src="/facebook.svg" alt="Facebook" className="w-5 h-5" w="20" h="20" />
                </a>
                <a href="https://instagram.com/jagoxiii" target="_blank" rel="noreferrer">
                  <Image src="/instagram.svg" alt="Instagram" className="w-5 h-5" w="20" h="20" />
                </a>
              </div>
            </div>

            {/* Admin-only actions */}
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
                  message={`Are you sure you want to delete "${post?.title}"?`}
                  confirmText="Delete"
                  cancelText="Cancel"
                  loading={loadingDelete}
                  onConfirm={handleDelete}
                  onClose={() => setOpen(false)}
                />
              </>
            )}

            <h2 className="mt-8 mb-4 text-sm font-medium">Categories</h2>
            <nav className="flex flex-col gap-2 text-sm">
              <Link className="underline" to="/posts">
                All
              </Link>
              <Link className="underline" to="/posts?cat=programming">
                Programming
              </Link>
              <Link className="underline" to="/posts?cat=development">
                Development
              </Link>
              <Link className="underline" to="/posts?cat=data-science">
                Data Science
              </Link>
              <Link className="underline" to="/posts?cat=business">
                Business
              </Link>
              <Link className="underline" to="/posts?cat=technology">
                Technology
              </Link>
              <Link className="underline" to="/posts?cat=travel">
                Travel
              </Link>
            </nav>

            <h2 className="mt-8 mb-4 text-sm font-medium">Search</h2>
            <Search />
          </div>
        </aside>
      </div>

      <Comments postId={id} />

      {/* Append Update Modal */}
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
                className="px-3 py-1.5 rounded border text-gray-700 disabled:opacity-60"
                onClick={() => setAppendOpen(false)}
                disabled={appending}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60"
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
