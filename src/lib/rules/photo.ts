const ALLOWED_MIME: string[] = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT: string[] = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_BYTES = 10_485_760; // 10 MB — rejected at exactly this size

export function validatePhoto(file: File): boolean {
  if (!ALLOWED_MIME.includes(file.type)) return false;
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot) : '';
  if (!ALLOWED_EXT.includes(ext)) return false;
  if (file.size >= MAX_BYTES) return false;
  return true;
}
