// src/routes/Write.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Quill
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

// YouTube (lightweight)
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

// Cloudinary helpers
// NOTE: we still use withTransform; but for deletion-by-token we do the upload inline here
import { withTransform } from "../utils/withTransform";

// API + Cloudinary env
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Transform defaults for final images in editor
const EDITOR_IMG_WIDTH = 900;
const EDITOR_IMG_QUALITY = 80; // 1..100
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

// ---------- helpers ----------
function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

// Robust YouTube ID extraction (watch, youtu.be, shorts, embed, with extra params)
function getYouTubeId(url) {
  if (!url) return null;
  const u = url.trim();

  const mWatch = u.match(/[?&]v=([A-Za-z0-9_-]{11})/i);
  if (mWatch) return mWatch[1];

  const mBe = u.match(/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/i);
  if (mBe) return mBe[1];

  const mShort = u.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/i);
  if (mShort) return mShort[1];

  const mEmbed = u.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?&].*)?$/i);
  if (mEmbed) return mEmbed[1];

  const mAny = u.match(/(?:youtube\.com|youtu\.be)[^A-Za-z0-9_-]([A-Za-z0-9_-]{11})/i);
  return mAny ? mAny[1] : null;
}

function getVimeoId(url) {
  if (!url) return null;
  const m = url.trim().match(/vimeo\.com\/(\d+)/i);
  return m ? m[1] : null;
}

function isDirectVideo(url) {
  return !!url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());
}

// ---- Cloudinary client-side helpers (unsigned) ----
async function uploadWithDeleteToken(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary config. Add VITE_CLOUDINARY_* env vars.");
  }
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  // Ask Cloudinary to return a one-time delete token (requires preset config)
  fd.append("return_delete_token", "true");

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Upload failed ${res.status}: ${msg}`);
  }
  const json = await res.json();
  // json includes: secure_url, public_id, delete_token (if preset allows it)
  return json;
}

async function deleteByToken(token) {
  if (!token || !CLOUD_NAME) return false;
  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`;
    const fd = new FormData();
    fd.append("token", token);
    const res = await fetch(url, { method: "POST", body: fd });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------- component ----------
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

  // cover image (track URL + delete_token + public_id)
  const [coverUrl, setCoverUrl] = useState("");
  const [coverDeleteToken, setCoverDeleteToken] = useState(""); // can delete immediately if user removes/replaces
  const [coverPublicId, setCoverPublicId] = useState(""); // send to backend for final deletion on post delete
  const [coverUploading, setCoverUploading] = useState(false);
  const [showCoverPreview, setShowCoverPreview] = useState(false);

  // videos
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

  // Prevent duplicate handler bindings (StrictMode)
  const handlersBoundRef = useRef(false);

  // Debounce to prevent double-insert from weird paste/drop combos
  const insertingRef = useRef(false);

  // Track pending images
  const [pendingImages, setPendingImages] = useState([]);

  // Also collect public_ids of editor images uploaded on publish
  const editorPublicIdsRef = useRef([]);

  // Acquire quill instance safely
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

  // ---------- Cover image ----------
  const coverInputRef = useRef(null);
  function pickCover() {
    coverInputRef.current?.click();
  }

  async function removeCover() {
    try {
      // Best-effort: delete current cover from Cloudinary via delete_token if we have it
      if (coverDeleteToken) {
        await deleteByToken(coverDeleteToken);
      }
    } catch {
      // ignore
    } finally {
      setCoverUrl("");
      setCoverDeleteToken("");
      setCoverPublicId("");
    }
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

      // If there's an existing cover (uploaded in this session), delete it first
      if (coverDeleteToken) {
        try {
          await deleteByToken(coverDeleteToken);
        } catch {
          // ignore
        }
      }

      // Upload new one with delete token request
      const up = await uploadWithDeleteToken(file); // { secure_url, public_id, delete_token, ... }
      const transformedUrl = withTransform(up.secure_url, {
        width: 1600,
        quality: 85,
        crop: "limit",
      });

      setCoverUrl(transformedUrl);
      setCoverDeleteToken(up.delete_token || ""); // might be empty if preset not configured; that's OK
      setCoverPublicId(up.public_id || "");
    } catch (err) {
      setErrorMsg(err.message || "Cover upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

  // ---------- Editor image insert (blob now, upload on publish) ----------
  async function insertLocalImage(file) {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
    if (!quill) throw new Error("Editor not ready yet. Try again in a moment.");

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

  // Prefill cover with user avatar once (optional)
  useEffect(() => {
    if (!coverUrl && user?.imageUrl) {
      setCoverUrl(user.imageUrl);
    }
  }, [user, coverUrl]);

  // Drag & drop / paste → insert blob; DO NOT upload yet
  useEffect(() => {
    if (!quill) return;
    if (handlersBoundRef.current) return;

    const root = quill.root;

    async function handleDrop(e) {
      const dt = e.dataTransfer;
      if (!dt || !dt.files || dt.files.length === 0) return;
      const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        await insertLocalImage(file);
      } catch (err) {
        setErrorMsg(err.message || "Image insert failed.");
      }
    }

    async function handlePaste(e) {
      const file = Array.from(e.clipboardData?.files || []).find((f) =>
        f.type.startsWith("image/")
      );
      if (!file) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        await insertLocalImage(file);
      } catch (err) {
        setErrorMsg(err.message || "Image insert failed.");
      }
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

  // Quill modules (toolbar)
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

  // --- On Publish: upload pending blob images and rewrite the HTML ---
  async function resolveEditorImages(html, pending) {
    if (!html) return { html, publicIds: [] };
    let nextHtml = html;
    const publicIds = [];

    // Replace temp blob URLs we inserted
    for (const { tempUrl, file } of pending) {
      if (!nextHtml.includes(tempUrl)) continue;

      const up = await uploadWithDeleteToken(file); // get secure_url + public_id
      const finalUrl = withTransform(up.secure_url, {
        width: EDITOR_IMG_WIDTH,
        quality: EDITOR_IMG_QUALITY,
        crop: EDITOR_IMG_CROP,
      });

      nextHtml = nextHtml.split(tempUrl).join(finalUrl);
      URL.revokeObjectURL(tempUrl);

      if (up.public_id) publicIds.push(up.public_id);
      // We don’t try to delete editor images immediately; send public_ids to backend to clean up on post delete.
    }

    // Convert <img src="data:image/..."> → upload → replace
    const dataUrlRegex = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/gi;
    const matches = [...nextHtml.matchAll(dataUrlRegex)];
    for (const m of matches) {
      const dataUrl = m[1];
      try {
        const file = dataURLtoFile(dataUrl, "pasted-image.png");
        const up = await uploadWithDeleteToken(file);
        const finalUrl = withTransform(up.secure_url, {
          width: EDITOR_IMG_WIDTH,
          quality: EDITOR_IMG_QUALITY,
          crop: EDITOR_IMG_CROP,
        });
        nextHtml = nextHtml.split(dataUrl).join(finalUrl);
        if (up.public_id) publicIds.push(up.public_id);
      } catch {
        // ignore this one
      }
    }

    return { html: nextHtml, publicIds };
  }

  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  // --- Video handlers ---
  function handleVideoChange(i, val) {
    const next = [...videoUrls];
    next[i] = val;
    setVideoUrls(next);
  }
  function addVideoField() {
    setVideoUrls((v) => [...v, ""]);
  }
  function removeVideoField(i) {
    setVideoUrls((v) => v.filter((_, idx) => idx !== i));
  }

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

      const { html: resolvedHtml, publicIds } = await resolveEditorImages(content, pendingImages);
      editorPublicIdsRef.current = publicIds || [];

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
        cover_image_public_id: coverPublicId || null, // 👈 send to backend for later deletion
        author_image_url: user?.imageUrl || "",
        featured_slot: featuredSlot,
        featured_rank: featuredRank ? Number(featuredRank) : null,
        video_urls: videoUrls.map((u) => u.trim()).filter(Boolean),
        content_image_public_ids: editorPublicIdsRef.current, // 👈 send all editor image public_ids
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
      // clear pending blobs to avoid leaks if you stay on page
      pendingImages.forEach(({ tempUrl }) => URL.revokeObjectURL(tempUrl));
      setPendingImages([]);
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6 m-11">
      {/* Quill & video preview styles + LiteYouTube polish */}
      <style>{`
        .ql-editor img{max-width:100%;height:auto;display:block;margin:1rem auto;}

        .video-grid { display: grid; gap: 1rem; }
        @media (min-width: 768px) { .video-grid { grid-template-columns: 1fr 1fr; } }

        .player-wrapper { position: relative; padding-top: 56.25%; border-radius: 0.75rem; overflow: hidden; }
        .player-wrapper iframe, .player-wrapper video { position:absolute; top:0; left:0; width:100%; height:100%; border:0; }

        /* LiteYouTubeEmbed overrides */
        .yt-card { border-radius: 0.75rem; overflow: hidden; }
        .yt-card .yt-lite{
          background: transparent !important;
          aspect-ratio: 16/9;
          width: 100%;
          height: auto;
          display: block;
          position: relative;
        }
        .yt-card .yt-lite::before{ content: none !important; }
        .yt-card .yt-lite > img{ width:100%; height:100%; object-fit: cover; display:block; }
      `}</style>

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
                onClick={removeCover}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                disabled={coverUploading}
                title={coverDeleteToken ? "Remove (will delete from Cloudinary)" : "Remove"}
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

        {/* Excerpt */}
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

        {/* Editor */}
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

        {/* Video URLs */}
        <div>
          <label className="text-gray-500 font-medium">Video URLs</label>
          <div className="mt-2 video-grid">
            {videoUrls.map((url, i) => {
              const u = url.trim();
              const ytId = getYouTubeId(u);
              const vmId = getVimeoId(u);
              const direct = isDirectVideo(u);

              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={url}
                      onChange={(e) => handleVideoChange(i, e.target.value)}
                      placeholder="https://youtube.com/watch?v=…  |  https://vimeo.com/123456789  |  https://.../video.mp4"
                      className="flex-1 p-2 rounded-xl bg-white shadow-md border"
                    />
                    {videoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(i)}
                        className="px-2 py-1 rounded border text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Previews */}
                  {ytId && (
                    <div className="yt-card">
                      <LiteYouTubeEmbed
                        id={ytId}
                        title={`YouTube video ${i + 1}`}
                        poster="hqdefault"
                        webp
                      />
                    </div>
                  )}
                  {vmId && (
                    <div className="player-wrapper">
                      <iframe
                        src={`https://player.vimeo.com/video/${vmId}`}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={`Vimeo video ${i + 1}`}
                      />
                    </div>
                  )}
                  {direct && (
                    <div className="player-wrapper">
                      <video controls playsInline src={u} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addVideoField}
            className="mt-2 text-sm text-indigo-700 hover:underline"
          >
            + Add another video
          </button>
        </div>

        {/* Featured controls */}
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
