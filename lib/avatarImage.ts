/** Priprema profilne slike: provjera formata i veličine, kvadratni isječak 256×256 kao JPEG data URL. */

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const OUT = 256;

export function avatarFileError(file: File): string | null {
  if (!["image/jpeg", "image/png"].includes(file.type))
    return "Odaberi sliku u formatu JPG ili PNG.";
  if (file.size > AVATAR_MAX_BYTES)
    return "Slika je veća od 2 MB. Odaberi manju.";
  return null;
}

export async function avatarFromFile(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx || !side) throw new Error("slika");
    // Bijela podloga da prozirni PNG ne postane crn u JPEG-u.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      OUT,
      OUT,
    );
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}
