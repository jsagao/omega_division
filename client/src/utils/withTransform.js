// src/utils/withTransform.js

// Defaults for editor-embedded media
export const IMG_WIDTH = 900; // max delivery width
export const IMG_QUALITY = 80; // 1..100

/**
 * Insert a Cloudinary transformation segment into a Cloudinary URL
 * (right after `/upload/` or `/video/upload/`), unless a transform already exists.
 *
 * Backward compatible:
 *   withTransform(url)                        -> uses defaults (w=900,q=80,c_limit,f_auto,dpr_auto)
 *   withTransform(url, { width: 1200 })       -> override width
 *   withTransform(url, { height: 600 })       -> height-only
 *   withTransform(url, { crop: "fill" })      -> different crop mode
 *   withTransform(url, { format: "auto" })    -> f_auto (default)
 *   withTransform(url, { dpr: "auto" })       -> dpr_auto (default)
 *   withTransform(url, { quality: 60 })       -> q_60
 *   withTransform(url, { gravity: "auto" })   -> g_auto (useful with c_fill)
 *   withTransform(url, { aspect: "16:9" })    -> ar_16:9
 *   withTransform(url, { flags: ["lossy"] })  -> fl_lossy
 */
export function withTransform(
  url,
  {
    width = IMG_WIDTH,
    height = undefined,
    quality = IMG_QUALITY,
    crop = "limit", // safe default: never upscale
    format = "auto", // f_auto
    dpr = "auto", // dpr_auto
    gravity, // e.g. "auto", "face"
    aspect, // e.g. "16:9", "1:1"
    flags = [], // e.g. ["lossy","progressive"]
  } = {}
) {
  if (!url) return url;

  try {
    const u = new URL(url);

    // Only touch Cloudinary delivery URLs
    if (!/\.cloudinary\.com$/i.test(u.hostname) || !/\/upload\//i.test(u.pathname)) {
      return url;
    }

    // Split path so we can inject the transform
    const parts = u.pathname.split("/");

    // Find ".../(image|video)/upload/..." or ".../upload/..." segment
    let uploadIdx = parts.findIndex((p, i) => {
      // match "upload" exactly (cloudinary may have "image/upload" or "video/upload")
      return p === "upload" && i > 0 && (parts[i - 1] === "image" || parts[i - 1] === "video");
    });

    // Fallback in case the resource-type folder wasn't present
    if (uploadIdx === -1) uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return url; // safety

    // Detect if a transformation already exists between "upload" and the version/public_id.
    // Heuristic: if the very next segment contains "_" or "," or known transform keys.
    const nextSeg = parts[uploadIdx + 1] || "";
    const looksLikeTransform =
      /[,_]/.test(nextSeg) || /^(c_|w_|h_|q_|f_|dpr_|g_|ar_|fl_)/.test(nextSeg);

    if (looksLikeTransform) {
      // URL already has a transformation; leave it as-is.
      return url;
    }

    // Build the transform string
    const tokens = [];

    // crop mode (always first)
    if (crop) tokens.push(`c_${crop}`);

    // dimensions
    if (width) tokens.push(`w_${Math.max(1, Number(width) || 1)}`);
    if (height) tokens.push(`h_${Math.max(1, Number(height) || 1)}`);

    // optional helpers
    if (quality != null) tokens.push(`q_${quality}`);
    if (format) tokens.push(`f_${format}`);
    if (dpr) tokens.push(`dpr_${dpr}`);
    if (gravity) tokens.push(`g_${gravity}`);
    if (aspect) tokens.push(`ar_${aspect}`);

    if (Array.isArray(flags) && flags.length) {
      tokens.push(...flags.map((f) => `fl_${f}`));
    }

    // Nothing to insert? bail
    if (!tokens.length) return url;

    const transform = tokens.join(",");

    // Insert transform directly after "upload" segment
    // This safely keeps any following version segment (e.g. v123456789) intact.
    parts.splice(uploadIdx + 1, 0, transform);

    u.pathname = parts.join("/");

    return u.toString();
  } catch {
    return url;
  }
}
