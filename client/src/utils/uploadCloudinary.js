// src/utils/uploadCloudinary.js
/**
 * Upload a file to Cloudinary (unsigned).
 * Returns { secure_url, public_id, delete_token?, ... }
 */
export async function uploadToCloudinary(
  file,
  { cloudName, uploadPreset, folder = "blog", tags = [], context = {} } = {}
) {
  if (!file) throw new Error("No file provided");
  if (!cloudName) throw new Error("Missing Cloudinary cloudName");
  if (!uploadPreset) throw new Error("Missing Cloudinary uploadPreset");

  const isVideo = typeof file.type === "string" && file.type.startsWith("video/");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? "video" : "image"}/upload`;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  if (folder) fd.append("folder", folder);
  if (Array.isArray(tags) && tags.length) fd.append("tags", tags.join(","));
  const ctx = Object.entries(context)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("|");
  if (ctx) fd.append("context", ctx);

  // ⚠️ DO NOT append `return_delete_token` here on unsigned uploads.
  // If your preset has "Return delete token" enabled, Cloudinary will include `delete_token` in the JSON automatically.

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed ${res.status}: ${msg}`);
  }

  const json = await res.json();
  const {
    secure_url,
    public_id,
    delete_token, // present only if your preset returns it
    resource_type,
    width,
    height,
    bytes,
    format,
    duration,
  } = json;

  return {
    secure_url,
    public_id,
    delete_token, // <- grab it if present
    resource_type,
    width,
    height,
    bytes,
    format,
    duration,
    _raw: json,
  };
}
