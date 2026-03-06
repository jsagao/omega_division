// src/routes/EditPost.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Quill
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

// Cloudinary
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import { withTransform } from "../utils/withTransform";

const API: string = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CLOUD_NAME: string | undefined = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET: string | undefined = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// limits
const TITLE_MAX = 100;
const EXCERPT_MAX = 250;
const CONTENT_MAX = 5000;

interface CategoryOption {
  name: string;
  value: string;
}

const categories: CategoryOption[] = [
  { name: "Programming", value: "Programming" },
  { name: "Data Science", value: "Data-science" },
  { name: "Business", value: "Business" },
  { name: "Technology", value: "Technology" },
  { name: "Development", value: "Development" },
  { name: "Travel", value: "Travel" },
];

function stripHtml(html: string = ""): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
}

interface PostData {
  title?: string;
  category?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  featured_slot?: string;
  featured_rank?: number;
  cover_image_url?: string;
  author_image_url?: string;
  series_key?: string;
  series_part?: number;
  [key: string]: unknown;
}

type PageStatus = "loading" | "ok" | "notfound" | "error";

export default function EditPost(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  // ---------- ADMIN GUARD ----------
  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }
  const role = (user?.publicMetadata?.role || "public").toString().toLowerCase();
  if (!isSignedIn || role !== "admin") {
    return <Navigate to={`/posts/${id}`} replace />;
  }
  // ---------------------------------

  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // form state
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0].value);
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [featuredSlot, setFeaturedSlot] = useState<string>("none");
  const [featuredRank, setFeaturedRank] = useState<string>("");

  // Series
  const [seriesKey, setSeriesKey] = useState<string>("");
  const [seriesPart, setSeriesPart] = useState<string>("");

  // cover image (preview + lightbox)
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverUploading, setCoverUploading] = useState<boolean>(false);
  const [showCoverPreview, setShowCoverPreview] = useState<boolean>(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // NEW: author avatar
  const [authorUrl, setAuthorUrl] = useState<string>("");
  const [authorUploading, setAuthorUploading] = useState<boolean>(false);
  const authorInputRef = useRef<HTMLInputElement>(null);

  // prefill
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setStatus("loading");
        const res: Response = await fetch(`${API}/posts/${id}`, { signal: ctrl.signal });
        if (res.status === 404) return setStatus("notfound");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PostData = await res.json();

        setTitle(data.title || "");
        setCategory(data.category || categories[0].value);
        setContent(data.content || data.description || "");
        setExcerpt(data.excerpt || stripHtml(data.content || data.description || "").slice(0, 220));
        setFeaturedSlot(data.featured_slot || "none");
        setFeaturedRank(typeof data.featured_rank === "number" ? String(data.featured_rank) : "");
        setCoverUrl(data.cover_image_url || "");
        setAuthorUrl(data.author_image_url || "");
        setSeriesKey(data.series_key || "");
        setSeriesPart(typeof data.series_part === "number" ? String(data.series_part) : "");

        setStatus("ok");
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") {
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
    function onKey(e: KeyboardEvent): void {
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
  function onTitle(v: string): void {
    setTitle(v.slice(0, TITLE_MAX));
  }
  function onExcerpt(v: string): void {
    setExcerpt(v.slice(0, EXCERPT_MAX));
  }
  function onQuillChange(html: string): void {
    const nextPlain = stripHtml(html);
    if (nextPlain.length <= CONTENT_MAX) setContent(html);
  }

  // cover handlers
  function pickCover(): void {
    coverInputRef.current?.click();
  }
  async function onSelectCover(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
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

      // RETURNS AN OBJECT
      const up = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "blog",
        context: { via: "edit-cover" },
      });

      const url = withTransform(up.secure_url, { width: 1600, quality: 85, crop: "limit" });
      setCoverUrl(url);

      setShowCoverPreview(true);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }
  function removeCover(): void {
    setCoverUrl("");
  }

  // NEW: author avatar handlers
  function pickAuthor(): void {
    authorInputRef.current?.click();
  }
  async function onSelectAuthor(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
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
      setAuthorUploading(true);
      const raw = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
      });
      // Friendly avatar size
      const url = withTransform(raw.secure_url, {
        width: 256,
        height: 256,
        crop: "fill",
        gravity: "face",
        quality: 85,
      });
      setAuthorUrl(url);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Avatar upload failed.");
    } finally {
      setAuthorUploading(false);
      e.target.value = "";
    }
  }
  function removeAuthor(): void {
    setAuthorUrl("");
  }
  function normalizeCover(x: unknown): string {
    if (typeof x === "string") return x;
    if (x && typeof x === "object" && (x as Record<string, unknown>).secure_url) {
      return withTransform((x as Record<string, unknown>).secure_url as string, { width: 1600, quality: 85, crop: "limit" });
    }
    return "";
  }
  async function handleSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
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
    if (!seriesKey.trim() && seriesPart) {
      setErrorMsg("If you set a Part #, please provide a Series key.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: (content || "").trim(),
        description: (excerpt || "").trim(),
        featured_slot: featuredSlot,
        featured_rank: featuredRank ? Number(featuredRank) : null,
        cover_image_url: normalizeCover(coverUrl),
        author_image_url: authorUrl || "",
        series_key: seriesKey.trim() || null,
        series_part: seriesPart ? Number(seriesPart) : null,
      };

      const res: Response = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to save (HTTP ${res.status}) ${txt}`);
      }
      const updated: { id: string | number } = await res.json();
      navigate(`/posts/${updated.id}`);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <div className="h-6 w-40 bg-surface-raised rounded animate-pulse mb-4" />
        <div className="h-8 w-3/4 bg-surface-raised rounded animate-pulse mb-6" />
        <div className="h-64 w-full bg-surface-raised rounded animate-pulse" />
      </div>
    );
  }
  if (status === "notfound") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-slate-400">Post not found.</p>
        <Link to="/posts" className="text-gold hover:text-gold-light underline">
          ← Back to posts
        </Link>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-8">
        <p className="text-red-400">Couldn't load this post.</p>
        <Link to="/posts" className="text-gold hover:text-gold-light underline">
          ← Back to posts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-12 flex flex-col gap-10">
      {/* keep Quill images responsive inside editor + dark overrides */}
      <style>{`
        .ql-editor img{max-width:100%;height:auto;display:block;margin:1rem auto;}
        .ql-toolbar.ql-snow { border-color: rgba(255,255,255,0.1) !important; background: #111827; }
        .ql-toolbar .ql-stroke { stroke: #94a3b8 !important; }
        .ql-toolbar .ql-fill { fill: #94a3b8 !important; }
        .ql-toolbar .ql-picker-label { color: #94a3b8 !important; }
        .ql-toolbar .ql-picker-options { background: #1a2236 !important; border-color: rgba(255,255,255,0.1) !important; }
        .ql-toolbar .ql-picker-item { color: #cbd5e1 !important; }
        .ql-toolbar button:hover .ql-stroke { stroke: #c9a84c !important; }
        .ql-toolbar button:hover .ql-fill { fill: #c9a84c !important; }
        .ql-toolbar button.ql-active .ql-stroke { stroke: #c9a84c !important; }
        .ql-toolbar button.ql-active .ql-fill { fill: #c9a84c !important; }
        .ql-container.ql-snow { border-color: rgba(255,255,255,0.1) !important; }
        .ql-editor { color: #cbd5e1; }
        .ql-editor.ql-blank::before { color: #475569 !important; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-light text-white">Edit Post</h1>
        <Link to={`/posts/${id}`} className="text-gold hover:text-gold-light hover:underline text-sm">
          ← Back to post
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-md bg-red-900/20 text-red-400 text-sm border border-red-800/30">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Cover controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pickCover}
            className="w-max p-2 rounded-xl text-sm border border-gold/30 text-gold hover:bg-gold/10"
            disabled={coverUploading}
          >
            {coverUploading ? "Uploading…" : coverUrl ? "Change Cover Image" : "Add a Cover Image"}
          </button>

          {coverUrl && (
            <>
              <img
                src={coverUrl}
                alt="Cover preview"
                className="h-24 w-40 md:h-28 md:w-48 object-cover rounded-lg border border-white/10 cursor-zoom-in"
                onClick={() => setShowCoverPreview(true)}
              />
              <button
                type="button"
                onClick={removeCover}
                className="text-xs px-2 py-1 rounded border border-white/10 text-slate-400 hover:bg-surface-raised"
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitle(e.target.value)}
              className="w-full text-4xl font-semibold bg-navy-800 border border-white/10 p-4 rounded-xl outline-none text-white placeholder-slate-600"
            />
            <div className="mt-1 text-xs text-slate-500 text-right">
              {titleLen}/{TITLE_MAX}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-sm font-medium">Category</label>
            <select
              name="cat"
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="p-3 rounded-xl bg-navy-800 border border-white/10 text-slate-300"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Series (optional) */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm font-medium">Series key</label>
              <input
                type="text"
                value={seriesKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeriesKey(e.target.value)}
                placeholder='e.g. "My Journey"'
                className="p-2 rounded-xl bg-navy-800 border border-white/10 text-slate-300 placeholder-slate-600 w-64"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm font-medium">Part #</label>
              <input
                type="number"
                min="1"
                value={seriesPart}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeriesPart(e.target.value)}
                placeholder="1"
                className="p-2 rounded-xl bg-navy-800 border border-white/10 text-slate-300 placeholder-slate-600 w-28"
              />
            </div>
            <p className="text-xs text-slate-500">
              Leave empty if this post is not part of a series.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-sm font-medium">Short description (excerpt)</label>
            <textarea
              name="excerpt"
              placeholder="A short description shown in lists and previews…"
              value={excerpt}
              maxLength={EXCERPT_MAX}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onExcerpt(e.target.value)}
              className="w-full bg-navy-800 border border-white/10 p-4 rounded-xl outline-none min-h-[160px] text-slate-300 placeholder-slate-600"
            />
            <div className="text-xs text-slate-500 text-right">
              {excerptLen}/{EXCERPT_MAX}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-400 text-sm font-medium">Body</label>
          <ReactQuill
            theme="snow"
            className="w-full p-2 rounded-xl bg-navy-800 border border-white/10 min-h-[420px]"
            value={content}
            onChange={onQuillChange}
          />
          <div className="mt-1 text-xs text-slate-500 text-right">
            {contentLen}/{CONTENT_MAX} (plain text)
          </div>
        </div>

        {/* NEW: Author avatar controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pickAuthor}
            className="w-max p-2 rounded-xl text-sm border border-gold/30 text-gold hover:bg-gold/10"
            disabled={authorUploading}
            title="Upload/Change author avatar"
          >
            {authorUploading
              ? "Uploading…"
              : authorUrl
                ? "Change Author Avatar"
                : "Add Author Avatar"}
          </button>

          {authorUrl && (
            <>
              <img
                src={authorUrl}
                alt="Author avatar preview"
                className="h-16 w-16 object-cover rounded-full border border-white/10"
              />
              <button
                type="button"
                onClick={removeAuthor}
                className="text-xs px-2 py-1 rounded border border-white/10 text-slate-400 hover:bg-surface-raised"
              >
                Remove
              </button>
            </>
          )}

          <input
            ref={authorInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectAuthor}
          />
        </div>

        {/* Featured (now includes "portfolio") */}
        <fieldset className="flex flex-wrap items-center gap-4">
          <legend className="text-slate-400 font-medium">Feature:</legend>
          {[
            { value: "none", label: "None" },
            { value: "main", label: "Main" },
            { value: "mini", label: "Mini" },
            { value: "portfolio", label: "Portfolio" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name="featured_slot"
                value={opt.value}
                checked={featuredSlot === opt.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturedSlot(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
          <input
            type="number"
            min="1"
            placeholder="Rank (optional)"
            className="p-2 rounded-xl bg-navy-800 border border-white/10 text-slate-300 placeholder-slate-600 w-36"
            value={featuredRank}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeaturedRank(e.target.value)}
          />
        </fieldset>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving || overLimits}
            className="bg-gold disabled:opacity-60 disabled:cursor-not-allowed text-navy-900 px-6 py-3 rounded-xl font-medium text-lg hover:bg-gold-light"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link
            to={`/posts/${id}`}
            className="px-6 py-3 rounded-xl border border-gold/30 text-gold text-lg hover:bg-gold/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
