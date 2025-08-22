// src/utils/uploadCloudinary.js
export async function uploadToCloudinary(file, { cloudName, uploadPreset }) {
  if (!file) throw new Error("No file");
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Upload failed ${res.status}: ${msg}`);
  }
  const json = await res.json();
  return json.secure_url; // public URL
}
