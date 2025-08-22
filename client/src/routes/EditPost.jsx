// src/routes/EditPost.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Quill
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

// Cloudinary
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import { withTransform } from "../utils/withTransform";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// limits
const TITLE_MAX = 100;
const EXCERPT_MAX = 250;
const CONTENT_MAX = 5000;

const categories = [
  { name: "Programming", value: "Programming" },
  { name: "Data Science", value: "Data-science" },
  { name: "Business", value: "Business" },
  { name: "Technology", value: "Technology" },
  { name: "Development", value: "Development" },
  { name: "Travel", value: "Travel" },
];

function stripHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  // ---------- ADMIN GUARD ----------
  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-gray-700">Loading…</p>
      </div>
    );
  }
  const role = (user?.publicMetadata?.role || "public").toString().toLowerCase();
  if (!isSignedIn || role !== "admin") {
    // Not allowed: kick back to the post view
    return <Navigate to={`/posts/${id}`} replace />;
  }
  // ---------------------------------

  const [status, setStatus] = useState("loading"); // loading | ok | notfound | error
  const [errorMsg, setErrorMsg] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0].value);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [featuredSlot, setFeaturedSlot] = useState("none");
  const [featuredRank, setFeaturedRank] = useState("");

  // cover image (preview + lightbox)
  const [coverUrl, setCoverUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [showCoverPreview, setShowCoverPreview] = useState(false);
  const coverInputRef = useRef(null);

  // prefill
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(`${API}/posts/${id}`, { signal: ctrl.signal });
        if (res.status === 404) return setStatus("notfound");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setTitle(data.title || "");
        setCategory(data.category || categories[0].value);
        setContent(data.content || data.description || "");
        setExcerpt(data.excerpt || stripHtml(data.content || data.description || "").slice(0, 220));
        setFeaturedSlot(data.featured_slot || "none");
        setFeaturedRank(typeof data.featured_rank === "number" ? String(data.featured_rank) : "");
        setCoverUrl(data.cover_image_url || ""); // show current cover immediately

        setStatus("ok");
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setStatus("error");
        }
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  // lightbox: close on Escape
  useEffect(() => {
    if (!showCoverPreview) return;
    function onKey(e) {
      if (e.key === "Escape") setShowCoverPreview(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCoverPreview]);

  // lengths
  const titleLen = title.length;
  const excerptLen = excerpt.length;
  const contentPlain = useMemo(() => stripHtml(content), [content]);
  const contentLen = contentPlain.length;
  const overLimits = titleLen > TITLE_MAX || excerptLen > EXCERPT_MAX || contentLen > CONTENT_MAX;

  // limit handlers
  function onTitle(v) {
    setTitle(v.slice(0, TITLE_MAX));
  }
  function onExcerpt(v) {
    setExcerpt(v.slice(0, EXCERPT_MAX));
  }
  function onQuillChange(html) {
    const nextPlain = stripHtml(html);
    if (nextPlain.length <= CONTENT_MAX) setContent(html);
  }

  // cover handlers
  function pickCover() {
    coverInputRef.current?.click();
  }
  async function onSelectCover(e) {
    try {
      setErrorMsg("");
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please choose an image file.");
        return;
      }
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        setErrorMsg("Missing Cloudinary config. Add VITE_CLOUDINARY_* env vars.");
        return;
      }
      setCoverUploading(true);
      const raw = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
      });
      // optional friendly size for covers
      const url = withTransform(raw, { width: 1600, quality: 85, crop: "limit" });
      setCoverUrl(url);
      setShowCoverPreview(true); // open big preview
    } catch (err) {
      setErrorMsg(err.message || "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = ""; // reset file input
    }
  }
  function removeCover() {
    setCoverUrl("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a title.");
      return;
    }
    if (overLimits) {
      setErrorMsg("Please shorten fields that exceed their limits before saving.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: (content || "").trim(),
        description: (excerpt || "").trim(), // legacy sync
        featured_slot: featuredSlot,
        featured_rank: featuredRank ? Number(featuredRank) : null,
        cover_image_url: coverUrl, // keep cover updated
      };

      const res = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to save (HTTP ${res.status}) ${txt}`);
      }
      const updated = await res.json();
      navigate(`/posts/${updated.id}`);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
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
        <p className="text-red-600">Couldn’t load this post.</p>
        <Link to="/posts" className="text-indigo-700 underline">
          ← Back to posts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-12 flex flex-col gap-10">
      {/* keep Quill images responsive inside editor */}
      <style>{`.ql-editor img{max-width:100%;height:auto;display:block;margin:1rem auto;}`}</style>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-light">Edit Post</h1>
        <Link to={`/posts/${id}`} className="text-indigo-700 hover:underline text-sm">
          ← Back to post
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Cover controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pickCover}
            className="w-max p-2 shadow-md rounded-xl text-sm text-gray-700 bg-white border"
            disabled={coverUploading}
          >
            {coverUploading ? "Uploading…" : coverUrl ? "Change Cover Image" : "Add a Cover Image"}
          </button>

          {coverUrl && (
            <>
              <img
                src={coverUrl}
                alt="Cover preview"
                className="h-24 w-40 md:h-28 md:w-48 object-cover rounded-lg border cursor-zoom-in"
                onClick={() => setShowCoverPreview(true)}
              />
              <button
                type="button"
                onClick={removeCover}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
              >
                Remove
              </button>
            </>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectCover}
          />
        </div>

        {/* Lightbox */}
        {showCoverPreview && coverUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowCoverPreview(false)}
            role="dialog"
            aria-modal="true"
          >
            <img
              src={coverUrl}
              alt="Cover large preview"
              className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl"
            />
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => onTitle(e.target.value)}
              className="w-full text-4xl font-semibold bg-white p-4 shadow-md rounded-xl outline-none"
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {titleLen}/{TITLE_MAX}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-medium">Category</label>
            <select
              name="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 rounded-xl bg-white shadow-md"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm font-medium">Short description (excerpt)</label>
            <textarea
              name="excerpt"
              placeholder="A short description shown in lists and previews…"
              value={excerpt}
              maxLength={EXCERPT_MAX}
              onChange={(e) => onExcerpt(e.target.value)}
              className="w-full bg-white shadow-md p-4 rounded-xl outline-none min-h-[160px]"
            />
            <div className="text-xs text-gray-500 text-right">
              {excerptLen}/{EXCERPT_MAX}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-medium">Body</label>
          <ReactQuill
            theme="snow"
            className="w-full p-2 rounded-xl bg-white shadow-md min-h-[420px]"
            value={content}
            onChange={onQuillChange}
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {contentLen}/{CONTENT_MAX} (plain text)
          </div>
        </div>

        {/* Featured */}
        <fieldset className="flex flex-wrap items-center gap-4">
          <legend className="text-gray-500 font-medium">Feature:</legend>
          {["none", "main", "mini"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value={opt}
                checked={featuredSlot === opt}
                onChange={(e) => setFeaturedSlot(e.target.value)}
              />
              {opt}
            </label>
          ))}
          <input
            type="number"
            min="1"
            placeholder="Rank (optional)"
            className="p-2 rounded-xl bg-white shadow-md w-36"
            value={featuredRank}
            onChange={(e) => setFeaturedRank(e.target.value)}
          />
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving || overLimits}
            className="bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-lg"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            to={`/posts/${id}`}
            className="px-6 py-3 rounded-xl border text-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
