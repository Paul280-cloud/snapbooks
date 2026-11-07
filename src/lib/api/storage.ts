import { supabase } from '../supabase';
import { validatePhoto } from '../rules/photo';

const BUCKET = 'receipts';

export async function uploadPhoto(userId: string, file: File): Promise<string> {
  if (!validatePhoto(file)) {
    throw new Error('Invalid photo: must be JPEG, PNG or WebP under 10 MB.');
  }
  const ext = file.name.split('.').pop()!.toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}

export async function removePhoto(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
