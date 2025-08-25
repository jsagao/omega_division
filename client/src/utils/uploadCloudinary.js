// src/utils/uploadCloudinary.js
/**
 * Upload a file to Cloudinary (unsigned).
 * Returns { secure_url, public_id, resource_type, width, height, bytes, format, duration? }
 *
 * Usage:
 *   const up = await uploadToCloudinary(file, {
 *     cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
 *     uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
 *     folder: "blog",                 // optional, recommended
 *     tags: ["blog","post-123"],      // optional
 *     context: { postId: "123" },     // optional (stored as key=value)
 *   });
 *   // up.secure_url, up.public_id
 */
export async function uploadToCloudinary(
  file,
  { cloudName, uploadPreset, folder = "blog", tags = [], context = {} } = {}
) {
  if (!file) throw new Error("No file provided");
  if (!cloudName) throw new Error("Missing Cloudinary cloudName");
  if (!uploadPreset) throw new Error("Missing Cloudinary uploadPreset");

  // Decide resource type automatically
  const isVideo = typeof file.type === "string" && file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  // Build endpoint
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  if (folder) fd.append("folder", folder);
  if (Array.isArray(tags) && tags.length) fd.append("tags", tags.join(","));

  // Cloudinary context is a single string: "key=value|key2=value2"
  const contextPairs = Object.entries(context)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`);
  if (contextPairs.length) fd.append("context", contextPairs.join("|"));

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed ${res.status}: ${msg}`);
  }

  const json = await res.json();

  // Return the essentials + a few nice-to-haves
  const {
    secure_url,
    public_id,
    resource_type,
    width,
    height,
    bytes,
    format,
    duration, // present for videos
  } = json;

  return {
    secure_url,
    public_id,
    resource_type,
    width,
    height,
    bytes,
    format,
    duration,
    // expose raw response in case you want extra fields later
    _raw: json,
  };
}
