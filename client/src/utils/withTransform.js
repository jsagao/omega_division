// Tunables for editor-embedded images
const IMG_WIDTH = 900; // max width delivered in content
const IMG_QUALITY = 80;

export function withTransform(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;

    const parts = u.pathname.split("/");
    const uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return url;

    const next = parts[uploadIdx + 1] || "";
    const alreadyHasTransform =
      next.includes(",") ||
      next.startsWith("c_") ||
      next.startsWith("w_") ||
      next.startsWith("h_") ||
      next.startsWith("q_") ||
      next.startsWith("f_") ||
      next.startsWith("dpr_");

    if (alreadyHasTransform) return url;

    // c_limit prevents upscaling; f_auto/dpr_auto pick best format & DPR
    const transform = `c_limit,w_${IMG_WIDTH},q_${IMG_QUALITY},f_auto,dpr_auto`;
    parts.splice(uploadIdx + 1, 0, transform);
    u.pathname = parts.join("/");
    return u.toString();
  } catch {
    return url;
  }
}
