// src/routes/Write.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Quill
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

// Cloudinary
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import { withTransform } from "../utils/withTransform";

// API + Cloudinary env
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Cloudinary transform defaults (editor-embedded images)
const EDITOR_IMG_WIDTH = 900; // change if you want smaller/larger
const EDITOR_IMG_QUALITY = 80; // 1..100
const EDITOR_IMG_CROP = "limit"; // don't upscale

const categories = [
  { name: "Programming", value: "Programming" },
  { name: "Data Science", value: "Data-science" },
  { name: "Business", value: "Business" },
  { name: "Technology", value: "Technology" },
  { name: "Development", value: "Development" },
  { name: "Travel", value: "Travel" },
];

const TITLE_MAX = 100;
const EXCERPT_MAX = 250;
const CONTENT_MAX = 5000;

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

export default function Write() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0].value);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredSlot, setFeaturedSlot] = useState("none");
  const [featuredRank, setFeaturedRank] = useState("");

  // cover image
  const [coverUrl, setCoverUrl] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [showCoverPreview, setShowCoverPreview] = useState(false);

  // errors / submit
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ReactQuill ref & safe editor acquisition
  const rqRef = useRef(null);
  const [quill, setQuill] = useState(null);

  const setRQ = useCallback((instance) => {
    rqRef.current = instance || null;
  }, []);

  useEffect(() => {
    let done = false;
    let retries = 0;

    function tryGet() {
      if (done) return;
      const rq = rqRef.current;
      if (!rq || typeof rq.getEditor !== "function") {
        if (retries++ < 30) requestAnimationFrame(tryGet);
        return;
      }
      try {
        const editor = rq.getEditor();
        if (editor) {
          setQuill(editor);
          done = true;
          return;
        }
      } catch {
        // not ready yet
      }
      if (retries++ < 30) requestAnimationFrame(tryGet);
    }

    requestAnimationFrame(tryGet);
    return () => {
      done = true;
    };
  }, []);

  // live lengths
  const titleLen = title.length;
  const excerptLen = excerpt.length;
  const contentPlain = useMemo(() => stripHtml(content), [content]);
  const contentLen = contentPlain.length;

  const derivedPreview = useMemo(() => {
    if (excerpt.trim()) return excerpt.trim();
    return contentPlain.slice(0, 180);
  }, [excerpt, contentPlain]);

  const overLimits = titleLen > TITLE_MAX || excerptLen > EXCERPT_MAX || contentLen > CONTENT_MAX;

  function handleTitleChange(v) {
    setTitle(v.slice(0, TITLE_MAX));
  }
  function handleExcerptChange(v) {
    setExcerpt(v.slice(0, EXCERPT_MAX));
  }
  function handleQuillChange(html) {
    const nextPlain = stripHtml(html);
    if (nextPlain.length <= CONTENT_MAX) setContent(html);
  }

  // COVER IMAGE
  const coverInputRef = useRef(null);
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
      const rawUrl = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
      });
      // optional: also transform cover to a friendly width for previews
      const url = withTransform(rawUrl, {
        width: 1600,
        quality: 85,
        crop: "limit",
      });
      setCoverUrl(url);
    } catch (err) {
      setErrorMsg(err.message || "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

  // EMBED IMAGE (toolbar, paste, drag&drop) — ALWAYS transformed
  const embedInputRef = useRef(null);
  function pickEmbedImage() {
    embedInputRef.current?.click();
  }

  async function uploadAndInsertIntoEditor(file) {
    if (!file.type.startsWith("image/")) throw new Error("Please drop an image file.");
    if (!CLOUD_NAME || !UPLOAD_PRESET)
      throw new Error("Missing Cloudinary config. Add VITE_CLOUDINARY_* env vars.");
    if (!quill) throw new Error("Editor not ready yet. Try again in a moment.");

    const rawUrl = await uploadToCloudinary(file, {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
    });

    const url = withTransform(rawUrl, {
      width: EDITOR_IMG_WIDTH,
      quality: EDITOR_IMG_QUALITY,
      crop: EDITOR_IMG_CROP,
    });

    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
    quill.insertEmbed(range.index, "image", url, "user");
    quill.setSelection(range.index + 1, 0);
  }

  async function onSelectEmbed(e) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadAndInsertIntoEditor(file);
    } catch (err) {
      setErrorMsg(err.message || "Image upload failed.");
    } finally {
      e.target.value = "";
    }
  }

  // drag & drop / paste
  // After useUser() and before the form, prefill coverUrl once
  useEffect(() => {
    if (!coverUrl && user?.imageUrl) {
      setCoverUrl(user.imageUrl);
    }
  }, [user, coverUrl]);
  useEffect(() => {
    if (!quill) return;
    const root = quill.root;
    if (!root) return;

    function handleDrop(e) {
      const dt = e.dataTransfer;
      if (!dt || !dt.files || dt.files.length === 0) return;
      const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      uploadAndInsertIntoEditor(file).catch((err) => setErrorMsg(err.message || "Upload failed."));
    }

    function handlePaste(e) {
      const file = Array.from(e.clipboardData?.files || []).find((f) =>
        f.type.startsWith("image/")
      );
      if (!file) return;
      e.preventDefault();
      uploadAndInsertIntoEditor(file).catch((err) => setErrorMsg(err.message || "Upload failed."));
    }

    root.addEventListener("drop", handleDrop);
    root.addEventListener("paste", handlePaste);
    return () => {
      root.removeEventListener("drop", handleDrop);
      root.removeEventListener("paste", handlePaste);
    };
  }, [quill]);

  // Quill modules
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          [{ align: [] }],
          ["clean"],
        ],
        handlers: {
          image: () => pickEmbedImage(),
        },
      },
    }),
    []
  );

  // submit
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">You need to be signed in to write a post.</p>
      </div>
    );
  }

  async function handlePublish(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a title.");
      return;
    }
    if (overLimits) {
      setErrorMsg("Please shorten fields that exceed their limits before publishing.");
      return;
    }

    try {
      setSubmitting(true);
      const authorName =
        user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "anonymous";

      const payload = {
        title: title.trim(),
        category,
        author: authorName,
        excerpt: excerpt.trim(),
        content: (content || "").trim(),
        description: (excerpt || "").trim(),
        cover_image_url: coverUrl,
        author_image_url: user?.imageUrl || "",
        featured_slot: featuredSlot, // 👈 includes "portfolio" now
        featured_rank: featuredRank ? Number(featuredRank) : null,
      };

      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to publish (HTTP ${res.status}) ${txt}`);
      }
      const data = await res.json();
      navigate(`/posts/${data.id}`);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong while publishing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6 m-11">
      {/* Keep editor images responsive within Quill */}
      <style>{`.ql-editor img{max-width:100%;height:auto;display:block;margin:1rem auto;}`}</style>

      <h1 className="text-xl font-light">Create a New Post</h1>

      {errorMsg && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <form className="flex flex-col gap-6 flex-1 mb-6" onSubmit={handlePublish}>
        {/* Cover image */}
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
                onClick={() => setCoverUrl("")}
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

        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="My Awesome Story"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-4xl font-semibold bg-transparent outline-none w-full"
          />
          <div className="mt-1 text-xs text-gray-500">
            {titleLen}/{TITLE_MAX}
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-4">
          <label className="text-gray-500 font-medium">Category:</label>
          <select
            name="cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 rounded-xl bg-white shadow-md"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt (bigger) */}
        <div>
          <textarea
            name="desc"
            placeholder="A short description (optional)"
            value={excerpt}
            maxLength={EXCERPT_MAX}
            onChange={(e) => handleExcerptChange(e.target.value)}
            className="w-full bg-white shadow-md p-4 rounded-xl outline-none min-h-[260px] text-lg leading-relaxed"
            rows="6"
          />
          <div className="mt-1 text-xs text-gray-500">
            {excerptLen}/{EXCERPT_MAX}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Preview:&nbsp;
            <span className="italic">
              {derivedPreview || "Start typing above or in the editor…"}
            </span>
          </div>
        </div>

        {/* Editor (larger) + toolbar image picker input */}
        <div>
          <ReactQuill
            ref={setRQ}
            theme="snow"
            modules={quillModules}
            className="flex-1 p-2 rounded-xl bg-white shadow-md min-h-[520px] text-base md:text-lg"
            value={content}
            onChange={handleQuillChange}
          />
          <div className="mt-1 text-xs text-gray-500">
            {contentLen}/{CONTENT_MAX} (plain text)
          </div>
          <input
            ref={embedInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectEmbed}
          />
        </div>

        {/* Featured controls (now includes "portfolio") */}
        <fieldset className="flex flex-wrap gap-4 items-center">
          <legend className="text-gray-500 font-medium">Feature:</legend>
          {["none", "main", "mini", "portfolio"].map((opt) => (
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

        <button
          type="submit"
          disabled={submitting || overLimits}
          className="bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl mt-2 font-medium w-max"
        >
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
