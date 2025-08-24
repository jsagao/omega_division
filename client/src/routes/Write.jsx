// src/routes/Write.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Quill
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

// Cloudinary helpers
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import { withTransform } from "../utils/withTransform";

// API + Cloudinary env
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Transform defaults for final images
const EDITOR_IMG_WIDTH = 900;
const EDITOR_IMG_QUALITY = 80;
const EDITOR_IMG_CROP = "limit";

// Categories
const categories = [
  { name: "Programming", value: "Programming" },
  { name: "Data Science", value: "Data-science" },
  { name: "Business", value: "Business" },
  { name: "Technology", value: "Technology" },
  { name: "Development", value: "Development" },
  { name: "Travel", value: "Travel" },
];

// Limits
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

  // video urls
  const [videoUrls, setVideoUrls] = useState([""]);

  // errors / submit
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ReactQuill refs
  const rqRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const setRQ = useCallback((instance) => {
    rqRef.current = instance || null;
  }, []);

  const handlersBoundRef = useRef(false);
  const insertingRef = useRef(false);
  const [pendingImages, setPendingImages] = useState([]);

  // Acquire quill instance
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
      } catch {}
      if (retries++ < 30) requestAnimationFrame(tryGet);
    }
    requestAnimationFrame(tryGet);
    return () => {
      done = true;
    };
  }, []);

  // lengths
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
        setErrorMsg("Missing Cloudinary config.");
        return;
      }
      setCoverUploading(true);
      const rawUrl = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
      });
      const url = withTransform(rawUrl, { width: 1600, quality: 85, crop: "limit" });
      setCoverUrl(url);
    } catch (err) {
      setErrorMsg(err.message || "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

  // Insert image into Quill (blob for now)
  async function insertLocalImage(file) {
    if (!file.type.startsWith("image/")) throw new Error("Not an image.");
    if (!quill) throw new Error("Editor not ready.");
    if (insertingRef.current) return;
    insertingRef.current = true;
    setTimeout(() => (insertingRef.current = false), 200);

    const tempUrl = URL.createObjectURL(file);
    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
    quill.insertEmbed(range.index, "image", tempUrl, "user");
    quill.setSelection(range.index + 1, 0);
    setPendingImages((prev) => [...prev, { tempUrl, file }]);
  }

  const embedInputRef = useRef(null);
  function pickEmbedImage() {
    embedInputRef.current?.click();
  }
  async function onSelectEmbed(e) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      await insertLocalImage(file);
    } catch (err) {
      setErrorMsg(err.message || "Image insert failed.");
    } finally {
      e.target.value = "";
    }
  }

  // Prefill cover with avatar
  useEffect(() => {
    if (!coverUrl && user?.imageUrl) {
      setCoverUrl(user.imageUrl);
    }
  }, [user, coverUrl]);

  // drag & drop / paste images
  useEffect(() => {
    if (!quill) return;
    if (handlersBoundRef.current) return;
    const root = quill.root;
    async function handleDrop(e) {
      const dt = e.dataTransfer;
      if (!dt || !dt.files?.length) return;
      const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      await insertLocalImage(file);
    }
    async function handlePaste(e) {
      const file = Array.from(e.clipboardData?.files || []).find((f) =>
        f.type.startsWith("image/")
      );
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      await insertLocalImage(file);
    }
    root.addEventListener("drop", handleDrop, { passive: false });
    root.addEventListener("paste", handlePaste);
    handlersBoundRef.current = true;
    return () => {
      root.removeEventListener("drop", handleDrop);
      root.removeEventListener("paste", handlePaste);
      handlersBoundRef.current = false;
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
        handlers: { image: () => pickEmbedImage() },
      },
    }),
    []
  );

  // Upload blobs to Cloudinary
  async function resolveEditorImages(html, pending) {
    if (!html) return html;
    let nextHtml = html;
    for (const { tempUrl, file } of pending) {
      if (!nextHtml.includes(tempUrl)) continue;
      const uploadedUrl = await uploadToCloudinary(file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
      });
      const finalUrl = withTransform(uploadedUrl, {
        width: EDITOR_IMG_WIDTH,
        quality: EDITOR_IMG_QUALITY,
        crop: EDITOR_IMG_CROP,
      });
      nextHtml = nextHtml.split(tempUrl).join(finalUrl);
      URL.revokeObjectURL(tempUrl);
    }
    return nextHtml;
  }

  // video handlers
  function handleVideoChange(i, value) {
    const next = [...videoUrls];
    next[i] = value;
    setVideoUrls(next);
  }
  function addVideoField() {
    setVideoUrls([...videoUrls, ""]);
  }
  function removeVideoField(i) {
    setVideoUrls(videoUrls.filter((_, idx) => idx !== i));
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        You need to be signed in to write a post.
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
      setErrorMsg("Please shorten fields over the limits.");
      return;
    }
    try {
      setSubmitting(true);
      const resolvedHtml = await resolveEditorImages(content, pendingImages);
      const authorName =
        user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "anonymous";
      const payload = {
        title: title.trim(),
        category,
        author: authorName,
        excerpt: excerpt.trim(),
        content: (resolvedHtml || "").trim(),
        description: (excerpt || "").trim(),
        cover_image_url: coverUrl,
        author_image_url: user?.imageUrl || "",
        featured_slot: featuredSlot,
        featured_rank: featuredRank ? Number(featuredRank) : null,
        video_urls: videoUrls.filter((u) => u.trim() !== ""),
      };
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Publish failed (HTTP ${res.status})`);
      const data = await res.json();
      navigate(`/posts/${data.id}`);
    } catch (err) {
      setErrorMsg(err.message || "Publish error.");
    } finally {
      setSubmitting(false);
      pendingImages.forEach(({ tempUrl }) => URL.revokeObjectURL(tempUrl));
      setPendingImages([]);
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6 m-11">
      <style>{`.ql-editor img{max-width:100%;height:auto;display:block;margin:1rem auto;}`}</style>
      <h1 className="text-xl font-light">Create a New Post</h1>
      {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-sm">{errorMsg}</div>}
      <form className="flex flex-col gap-6 flex-1 mb-6" onSubmit={handlePublish}>
        {/* Cover image */}
        {/* ... same cover upload code ... */}

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

        {/* Excerpt */}
        <div>
          <textarea
            placeholder="A short description (optional)"
            value={excerpt}
            maxLength={EXCERPT_MAX}
            onChange={(e) => handleExcerptChange(e.target.value)}
            className="w-full p-4 rounded-xl shadow-md"
            rows="6"
          />
          <div className="mt-1 text-xs text-gray-500">
            {excerptLen}/{EXCERPT_MAX}
          </div>
        </div>

        {/* Editor */}
        <div>
          <ReactQuill
            ref={setRQ}
            theme="snow"
            modules={quillModules}
            className="flex-1 p-2 rounded-xl shadow-md min-h-[520px]"
            value={content}
            onChange={handleQuillChange}
          />
          <div className="mt-1 text-xs text-gray-500">
            {contentLen}/{CONTENT_MAX}
          </div>
          <input
            ref={embedInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectEmbed}
          />
        </div>

        {/* Video URLs */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-medium">Video URLs</label>
          {videoUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleVideoChange(i, e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 p-2 rounded-xl bg-white shadow-md"
              />
              {videoUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVideoField(i)}
                  className="px-2 py-1 text-xs bg-red-100 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addVideoField}
            className="text-sm text-blue-700 hover:underline"
          >
            + Add another video
          </button>
        </div>

        {/* Featured controls */}
        {/* ... same as before ... */}

        <button
          type="submit"
          disabled={submitting || overLimits}
          className="bg-blue-800 text-white px-4 py-2 rounded-xl w-max"
        >
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
