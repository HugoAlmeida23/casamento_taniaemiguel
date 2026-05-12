/**
 * Property-Based Tests for Live Photo Gallery utilities.
 * Uses fast-check for property-based testing with vitest.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  validateFile,
  generateFilename,
  computeScaledDimensions,
  getThumbnailUrl,
  getFullResUrl,
  sortPhotosDescending,
  formatRelativeTime,
  setGuestName,
  getGuestName,
  type PhotoRecord,
} from '../photo-gallery-utils';

// --- Property 1: File validation accepts only valid types and sizes ---
// **Validates: Requirements 1.2, 1.3**

describe('Property 1: File validation accepts only valid types and sizes', () => {
  const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
  const MAX_FILE_SIZE = 10_485_760;

  it('returns valid:true for valid MIME types and sizes within limit', () => {
    const validMimeArb = fc.constantFrom(...VALID_MIME_TYPES);
    const validSizeArb = fc.integer({ min: 1, max: MAX_FILE_SIZE });

    fc.assert(
      fc.property(validMimeArb, validSizeArb, (mime, size) => {
        const file = new File(['x'.repeat(Math.min(size, 100))], 'test.jpg', { type: mime });
        Object.defineProperty(file, 'size', { value: size });
        const result = validateFile(file);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('returns valid:false for invalid MIME types', () => {
    const invalidMimeArb = fc.string({ minLength: 1 }).filter(
      (s) => !VALID_MIME_TYPES.includes(s)
    );
    const anySizeArb = fc.integer({ min: 1, max: MAX_FILE_SIZE });

    fc.assert(
      fc.property(invalidMimeArb, anySizeArb, (mime, size) => {
        const file = new File(['x'], 'test.file', { type: mime });
        Object.defineProperty(file, 'size', { value: size });
        const result = validateFile(file);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('returns valid:false for files exceeding size limit', () => {
    const validMimeArb = fc.constantFrom(...VALID_MIME_TYPES);
    const oversizeArb = fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 5 });

    fc.assert(
      fc.property(validMimeArb, oversizeArb, (mime, size) => {
        const file = new File(['x'], 'test.jpg', { type: mime });
        Object.defineProperty(file, 'size', { value: size });
        const result = validateFile(file);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});


// --- Property 2: Generated filenames are unique ---
// **Validates: Requirements 1.4**

describe('Property 2: Generated filenames are unique', () => {
  it('generates 1000 unique filenames', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const filenames = new Set<string>();
        for (let i = 0; i < 1000; i++) {
          filenames.add(generateFilename());
        }
        expect(filenames.size).toBe(1000);
      }),
      { numRuns: 5 }
    );
  });
});

// --- Property 3: Guest name localStorage round-trip ---
// **Validates: Requirements 2.2**

describe('Property 3: Guest name localStorage round-trip', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('stores and retrieves any non-empty string unchanged', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (name) => {
        setGuestName(name);
        const retrieved = getGuestName();
        expect(retrieved).toBe(name);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 4: Photos sorted in descending chronological order ---
// **Validates: Requirements 3.1**

describe('Property 4: Photos sorted in descending chronological order', () => {
  const photoRecordArb = fc.array(
    fc.record({
      id: fc.uuid(),
      storage_path: fc.string({ minLength: 1 }),
      uploader_name: fc.string({ minLength: 1 }),
      created_at: fc.date({
        min: new Date('2020-01-01'),
        max: new Date('2030-12-31'),
      }).map((d) => d.toISOString()),
      is_visible: fc.boolean(),
    }),
    { minLength: 2, maxLength: 50 }
  );

  it('returns photos ordered by created_at descending', () => {
    fc.assert(
      fc.property(photoRecordArb, (photos) => {
        const sorted = sortPhotosDescending(photos as PhotoRecord[]);
        for (let i = 0; i < sorted.length - 1; i++) {
          const current = new Date(sorted[i].created_at).getTime();
          const next = new Date(sorted[i + 1].created_at).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('does not mutate the original array', () => {
    fc.assert(
      fc.property(photoRecordArb, (photos) => {
        const original = [...photos];
        sortPhotosDescending(photos as PhotoRecord[]);
        expect(photos).toEqual(original);
      }),
      { numRuns: 50 }
    );
  });
});


// --- Property 5: Photo card rendering includes uploader name and relative time ---
// **Validates: Requirements 3.5**

describe('Property 5: formatRelativeTime returns non-empty string for any valid date', () => {
  it('returns a non-empty string for any valid date within reasonable range', () => {
    const pastDateArb = fc.date({
      min: new Date('2020-01-01'),
      max: new Date(),
    }).map((d) => d.toISOString());

    fc.assert(
      fc.property(pastDateArb, (dateString) => {
        const result = formatRelativeTime(dateString);
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 6: Image dimension scaling preserves aspect ratio and enforces max dimension ---
// **Validates: Requirements 4.1**

describe('Property 6: Image dimension scaling preserves aspect ratio and enforces max dimension', () => {
  const MAX_DIM = 1920;

  it('max(w, h) <= maxDimension for any input dimensions', () => {
    const dimArb = fc.integer({ min: 1, max: 10000 });

    fc.assert(
      fc.property(dimArb, dimArb, (w, h) => {
        const result = computeScaledDimensions(w, h, MAX_DIM);
        expect(Math.max(result.width, result.height)).toBeLessThanOrEqual(MAX_DIM);
      }),
      { numRuns: 100 }
    );
  });

  it('returns original dimensions when both are within maxDimension', () => {
    const smallDimArb = fc.integer({ min: 1, max: MAX_DIM });

    fc.assert(
      fc.property(smallDimArb, smallDimArb, (w, h) => {
        const result = computeScaledDimensions(w, h, MAX_DIM);
        expect(result.width).toBe(w);
        expect(result.height).toBe(h);
      }),
      { numRuns: 100 }
    );
  });

  it('preserves aspect ratio (|w/h - W/H| < 0.01) for realistic photo dimensions', () => {
    // Generate dimensions with aspect ratios typical of real photos (between 1:3 and 3:1).
    // This ensures scaled dimensions are large enough that Math.round rounding
    // doesn't cause the absolute ratio difference to exceed 0.01.
    const baseArb = fc.integer({ min: 500, max: 5000 });
    const ratioFactorArb = fc.double({ min: 0.33, max: 3.0, noNaN: true });

    fc.assert(
      fc.property(baseArb, ratioFactorArb, (base, factor) => {
        const w = Math.max(1, Math.round(base * factor));
        const h = base;
        const result = computeScaledDimensions(w, h, MAX_DIM);
        const originalRatio = w / h;
        const scaledRatio = result.width / result.height;
        expect(Math.abs(scaledRatio - originalRatio)).toBeLessThan(0.01);
      }),
      { numRuns: 100 }
    );
  });
});

// --- Property 7: Storage URL generation produces correct thumbnail and full-res URLs ---
// **Validates: Requirements 4.2, 4.3**

describe('Property 7: Storage URL generation produces correct thumbnail and full-res URLs', () => {
  it('getThumbnailUrl contains "width=400" for any non-empty path', () => {
    const pathArb = fc.string({ minLength: 1, maxLength: 100 }).filter(
      (s) => s.trim().length > 0
    );

    fc.assert(
      fc.property(pathArb, (path) => {
        const url = getThumbnailUrl(path);
        expect(url).toContain('width=400');
        expect(url).toContain(path);
      }),
      { numRuns: 100 }
    );
  });

  it('getFullResUrl contains the path without resize params', () => {
    const pathArb = fc.string({ minLength: 1, maxLength: 100 }).filter(
      (s) => s.trim().length > 0
    );

    fc.assert(
      fc.property(pathArb, (path) => {
        const url = getFullResUrl(path);
        expect(url).toContain(path);
        expect(url).not.toContain('width=');
      }),
      { numRuns: 100 }
    );
  });
});
