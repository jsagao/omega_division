// src/utils/uploadCloudinary.js
/**
 * Upload a file to Cloudinary (unsigned).
 * Returns:
 *   {
 *     secure_url, public_id, resource_type,
 *     width, height, bytes, format, duration?, delete_token?
 *   }
 *
 * Usage:
 *   const up = await uploadToCloudinary(file, {
 *     cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
 *     uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
 *     folder: "blog",                 // optional
 *     tags: ["blog", "post-123"],     // optional
 *     context: { postId: "123" },     // optional
 *   });
 *   // up.secure_url, up.public_id, up.delete_token?
 */
export async function uploadToCloudinary(
  file,
  { cloudName, uploadPreset, folder = "blog", tags = [], context = {} } = {}
) {
  if (!file) throw new Error("No file provided");
  if (!cloudName) throw new Error("Missing Cloudinary cloudName");
  if (!uploadPreset) throw new Error("Missing Cloudinary uploadPreset");

  // Auto-pick endpoint based on file type
  const isVideo =
    typeof file.type === "string" &&
    (file.type.startsWith("video/") || file.type === "application/octet-stream"); // some iOS/drag cases
  const resourceType = isVideo ? "video" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  if (folder) fd.append("folder", folder);
  if (Array.isArray(tags) && tags.length) fd.append("tags", tags.join(","));

  // Cloudinary context is "key=value|key2=value2"
  const ctx = Object.entries(context)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  if (ctx) fd.append("context", ctx);

  // If your unsigned upload preset has `return_delete_token = true`,
  // Cloudinary will include `delete_token` in the response. Adding this
  // flag here is harmless; the preset ultimately controls it.
  fd.append("return_delete_token", "true");

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed ${res.status}: ${msg}`);
  }

  const json = await res.json();

  return {
    secure_url: json.secure_url,
    public_id: json.public_id,
    resource_type: json.resource_type, // "image" | "video"
    width: json.width,
    height: json.height,
    bytes: json.bytes,
    format: json.format,
    duration: json.duration, // present for videos
    delete_token: json.delete_token, // present if preset allows it
    _raw: json, // keep raw in case you need more later
  };
}
