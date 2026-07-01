// One-time in-place image optimizer for static assets in public/images.
//
// Why: several files (esp. the sand-texture background at ~9.5MB and the
// hero PNG at ~4MB) are shipped at full resolution and make the site slow /
// flaky to load on mobile. These are used as <img src> and CSS
// background-image, so Astro's <Image> component cannot process them.
// We compress them in place (same filename => all existing paths keep working).
//
// Originals are copied to ../_original_images_backup (outside public, so they
// are NOT deployed) before being overwritten.
//
// Run from the `basics` folder:  node scripts/optimize-images.mjs

import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, '../public/images');
const BACKUP_DIR = path.resolve(__dirname, '../_original_images_backup');

// Only compress files above this size (bytes). Small logos/icons are skipped.
const MIN_SIZE = 400 * 1024; // 400 KB

// Max width/height to resize down to (keeps aspect ratio, never upscales).
const MAX_DIMENSION = 2000;

// Per-format encode settings.
const JPEG_OPTS = { quality: 72, mozjpeg: true };
const PNG_OPTS = { quality: 80, compressionLevel: 9, palette: true };

const EXT = new Set(['.jpg', '.jpeg', '.png']);

function fmtMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function run() {
  await mkdir(BACKUP_DIR, { recursive: true });

  const entries = await readdir(IMAGES_DIR, { withFileTypes: true });
  let totalBefore = 0;
  let totalAfter = 0;

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXT.has(ext)) continue;

    const filePath = path.join(IMAGES_DIR, entry.name);
    const { size: before } = await stat(filePath);
    if (before < MIN_SIZE) continue;

    // Backup original once.
    const backupPath = path.join(BACKUP_DIR, entry.name);
    try {
      await stat(backupPath);
    } catch {
      await copyFile(filePath, backupPath);
    }

    // Re-encode from the backup (pristine source) to keep it idempotent.
    const input = sharp(backupPath).rotate(); // respect EXIF orientation
    const meta = await input.metadata();

    let pipeline = input;
    if (meta.width && meta.width > MAX_DIMENSION) {
      pipeline = pipeline.resize({ width: MAX_DIMENSION, withoutEnlargement: true });
    }

    if (ext === '.png') {
      pipeline = pipeline.png(PNG_OPTS);
    } else {
      pipeline = pipeline.jpeg(JPEG_OPTS);
    }

    const buffer = await pipeline.toBuffer();
    await sharp(buffer).toFile(filePath);

    const { size: after } = await stat(filePath);
    totalBefore += before;
    totalAfter += after;

    const pct = (100 * (1 - after / before)).toFixed(0);
    console.log(
      `${entry.name.padEnd(34)} ${fmtMB(before).padStart(9)} -> ${fmtMB(after).padStart(9)}  (-${pct}%)`
    );
  }

  console.log('-'.repeat(60));
  console.log(`TOTAL ${fmtMB(totalBefore)} -> ${fmtMB(totalAfter)}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
