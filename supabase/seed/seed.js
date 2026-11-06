/**
 * Sets passwords for the four seed users and uploads seed photos.
 * Run with: npm run seed  (uses --env-file=.env for SUPABASE_SERVICE_ROLE_KEY etc.)
 * Safe to run again — password updates are idempotent.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const supabaseUrl         = process.env.VITE_SUPABASE_URL;
const serviceRoleKey      = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedPassword        = process.env.SEED_TEST_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !seedPassword) {
  console.error('Missing required env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_TEST_PASSWORD');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'zanele.d@example.com',  photos: 14 },
  { id: '00000000-0000-0000-0000-000000000002', email: 'mpho.s@example.com',    photos: 9  },
  { id: '00000000-0000-0000-0000-000000000003', email: 'thabo.m@example.com',   photos: 1  },
  { id: '00000000-0000-0000-0000-000000000004', email: 'ayesha.p@example.com',  photos: 0  },
];

async function setPasswords() {
  for (const user of SEED_USERS) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: seedPassword,
    });
    if (error) {
      console.error(`Failed to set password for ${user.email}:`, error.message);
      process.exit(1);
    }
    console.log(`Password set: ${user.email}`);
  }
}

async function uploadPhotos() {
  const photosDir = join(__dirname, 'photos');
  if (!existsSync(photosDir)) {
    console.log('No photos directory found — skipping photo upload.');
    return;
  }

  const files = readdirSync(photosDir).filter(f =>
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log('No photos in supabase/seed/photos/ — skipping upload.');
    return;
  }

  // Upload up to 5 photos, cycling through for all users who need them
  for (const user of SEED_USERS) {
    if (user.photos === 0) continue;
    for (let i = 1; i <= user.photos; i++) {
      // Use available photos in round-robin, naming them seed-N
      const sourceFile = files[(i - 1) % files.length];
      const ext        = extname(sourceFile).toLowerCase().replace('.jpeg', '.jpg');
      const destPath   = `${user.id}/seed-${i}${ext}`;
      const data       = readFileSync(join(photosDir, sourceFile));
      const mimeType   = ext === '.jpg' ? 'image/jpeg'
                       : ext === '.png' ? 'image/png'
                       : 'image/webp';

      const { error } = await admin.storage
        .from('receipts')
        .upload(destPath, data, { contentType: mimeType, upsert: true });

      if (error) {
        console.error(`Failed to upload ${destPath}:`, error.message);
      } else {
        console.log(`Uploaded: ${destPath}`);
      }
    }
  }
}

await setPasswords();
await uploadPhotos();
console.log('Seed complete.');
