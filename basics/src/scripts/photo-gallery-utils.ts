/**
 * Pure utility functions for the Live Photo Gallery feature.
 * No side effects except localStorage access in setGuestName/getGuestName.
 */

// --- Interfaces ---

export interface PhotoRecord {
  id: string;
  storage_path: string;
  uploader_name: string;
  created_at: string;
  is_visible: boolean;
}

// --- Constants ---

const VALID_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
];

const MAX_FILE_SIZE = 10_485_760; // 10 MB in bytes

const GUEST_NAME_KEY = 'photo-gallery-guest-name';

// --- File Validation ---

/**
 * Validates a file for upload eligibility.
 * Accepts JPEG, PNG, HEIC, and WebP formats up to 10 MB.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!VALID_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPEG, PNG, HEIC ou WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Ficheiro demasiado grande. Máximo: 10 MB.',
    };
  }

  return { valid: true };
}

// --- Filename Generation ---

/**
 * Generates a unique filename in the format `{timestamp}_{randomId}.jpg`.
 */
export function generateFilename(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomId}.jpg`;
}

// --- Image Scaling ---

/**
 * Computes scaled dimensions preserving aspect ratio.
 * If both dimensions are already within maxDimension, returns original dimensions.
 * Otherwise scales down so that max(w, h) <= maxDimension.
 */
export function computeScaledDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

// --- URL Generation ---

/**
 * Returns the thumbnail URL for a photo using Supabase Storage transforms.
 * Uses width=400 for grid display.
 */
export function getThumbnailUrl(path: string): string {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/render/image/public/wedding-photos/${path}?width=400`;
}

/**
 * Returns the full-resolution URL for a photo from Supabase Storage.
 */
export function getFullResUrl(path: string): string {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/wedding-photos/${path}`;
}

// --- Sorting ---

/**
 * Sorts an array of PhotoRecords by created_at in descending order (newest first).
 * Returns a new sorted array without mutating the original.
 */
export function sortPhotosDescending(photos: PhotoRecord[]): PhotoRecord[] {
  return [...photos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// --- Relative Time Formatting ---

/**
 * Formats a timestamp as a Portuguese relative time string.
 * Examples: "agora mesmo", "há 2 min", "há 1 hora", "há 3 dias"
 */
export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'agora mesmo';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'há 1 min' : `há ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? 'há 1 hora' : `há ${diffHours} horas`;
  }

  return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`;
}

// --- Image Compression ---

const MAX_FALLBACK_SIZE = 10_485_760; // 10 MB

/**
 * Compresses an image file using the Canvas API.
 * Resizes to fit within maxDimension (preserving aspect ratio) and exports as JPEG.
 *
 * If the browser cannot decode the image (e.g., HEIC not supported),
 * falls back to returning the original file blob if under 10MB,
 * otherwise throws an error.
 */
export async function compressImage(
  file: File,
  maxDimension: number,
  quality: number
): Promise<Blob> {
  try {
    // Load the image into an HTMLImageElement
    const bitmap = await loadImage(file);

    // Compute scaled dimensions preserving aspect ratio
    const scaled = computeScaledDimensions(
      bitmap.width,
      bitmap.height,
      maxDimension
    );

    // Create an off-screen canvas at the target dimensions
    const canvas = document.createElement('canvas');
    canvas.width = scaled.width;
    canvas.height = scaled.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }

    // Draw the image scaled onto the canvas
    ctx.drawImage(bitmap, 0, 0, scaled.width, scaled.height);

    // Export as JPEG blob with specified quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        },
        'image/jpeg',
        quality
      );
    });

    return blob;
  } catch {
    // HEIC fallback: if Canvas cannot decode the image,
    // return the original file if under 10MB, otherwise throw
    if (file.size <= MAX_FALLBACK_SIZE) {
      return file;
    }
    throw new Error(
      'Formato não suportado e ficheiro demasiado grande para enviar sem compressão.'
    );
  }
}

/**
 * Loads a File into an HTMLImageElement via object URL.
 * Rejects if the image cannot be decoded (e.g., unsupported format).
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

// --- Guest Name (localStorage) ---

/**
 * Persists the guest display name to localStorage.
 */
export function setGuestName(name: string): void {
  localStorage.setItem(GUEST_NAME_KEY, name);
}

/**
 * Retrieves the guest display name from localStorage.
 * Returns null if no name has been stored.
 */
export function getGuestName(): string | null {
  return localStorage.getItem(GUEST_NAME_KEY);
}
