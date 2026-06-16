// Client-side image compression before any Storage upload.
// Max 800px on the long edge, JPEG ~70% — keeps files well under 200KB
// so the 1GB free-tier bucket lasts.

export async function compressImage(file, { maxSize = 800, quality = 0.7 } = {}) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
