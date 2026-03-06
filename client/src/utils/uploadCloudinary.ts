// src/utils/uploadCloudinary.ts
import type { CloudinaryUploadResult } from "../types";

interface UploadOptions {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  tags?: string[];
  context?: Record<string, string | number | null | undefined>;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  duration?: number;
  delete_token?: string;
  _raw: CloudinaryUploadResult;
}

/**
 * Unsigned upload to Cloudinary (image/video).
 * Returns { secure_url, public_id, resource_type, delete_token? ... }
 */
export async function uploadToCloudinary(
  file: File,
  { cloudName, uploadPreset, folder = "blog", tags = [], context = {} }: UploadOptions
): Promise<UploadResult> {
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
    .map(([k, v]) => `${k}=${v}`);
  if (ctx.length) fd.append("context", ctx.join("|"));

  // DO NOT append "return_delete_token" here. It must be enabled in the Upload Preset, not the request.

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed ${res.status}: ${msg}`);
  }
  const json: CloudinaryUploadResult = await res.json();

  // Expose the fields you care about (delete_token may or may not be present)
  const {
    secure_url,
    public_id,
    resource_type,
  } = json;

  return {
    secure_url,
    public_id,
    resource_type,
    width: json.width as number | undefined,
    height: json.height as number | undefined,
    bytes: json.bytes as number | undefined,
    format: json.format as string | undefined,
    duration: json.duration as number | undefined,
    delete_token: json.delete_token as string | undefined, // present only if your unsigned preset has "Return delete token" enabled
    _raw: json,
  };
}
