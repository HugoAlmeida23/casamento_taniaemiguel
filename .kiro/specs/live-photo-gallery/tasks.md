# Tasks: Live Photo Gallery

## Task 1: Supabase Client Setup and Shared Utilities

- [x] 1.1 Create `basics/src/scripts/supabase.ts` that initializes the Supabase client using `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` environment variables and exports the client instance
- [x] 1.2 Create `basics/src/scripts/photo-gallery-utils.ts` with pure utility functions: `validateFile`, `generateFilename`, `computeScaledDimensions`, `getThumbnailUrl`, `getFullResUrl`, `sortPhotosDescending`, `formatRelativeTime`, `setGuestName`, `getGuestName`
- [x] 1.3 Create the `PhotoRecord` TypeScript interface and export it from the utils module

## Task 2: Image Compression Module

- [x] 2.1 Implement `compressImage(file: File, maxDimension: number, quality: number): Promise<Blob>` in `photo-gallery-utils.ts` using Canvas API to resize images while preserving aspect ratio
- [x] 2.2 Handle HEIC fallback: if Canvas cannot decode the image, return the original file blob if under 10MB, otherwise throw an error

## Task 3: Fotos Page Structure and Styling

- [x] 3.1 Create `basics/src/pages/fotos.astro` with Layout, page header (Playfair Display title "Galeria de Fotos"), back navigation link to main page, and wedding theme styling (olive/beige/gold)
- [x] 3.2 Add the guest name input section: prompt on first visit, display stored name with edit option, persist to localStorage
- [x] 3.3 Add the masonry grid container with CSS columns (2 on mobile, 3 on desktop) and empty state message
- [x] 3.4 Add the fixed-position floating upload button (FAB) with 44x44px minimum tap target and tap-pulse animation
- [x] 3.5 Add the upload modal with file picker input (accept JPEG/PNG/HEIC/WebP), progress indicator, success/error messages, and retry button
- [x] 3.6 Add the lightbox overlay with full-screen image display, close button, prev/next navigation, and swipe gesture support

## Task 4: Upload Flow Implementation

- [x] 4.1 Implement the upload button click handler that opens the file picker (camera + file selection)
- [x] 4.2 Implement file validation on selection: check MIME type and file size, show error messages for invalid files
- [x] 4.3 Implement the upload flow: compress image → upload to Supabase Storage → insert PhotoRecord → show success → clear form
- [x] 4.4 Implement upload progress tracking and display
- [x] 4.5 Implement error handling with retry capability for network failures
- [x] 4.6 Disable upload button when guest name is not set

## Task 5: Live Feed and Realtime

- [x] 5.1 Implement initial photo loading: fetch first 20 photos from Supabase ordered by `created_at` DESC, render as masonry grid items with thumbnails (400px width), uploader name, and relative time
- [x] 5.2 Implement Supabase Realtime subscription for INSERT events: prepend new photos to the grid with animation
- [x] 5.3 Implement Supabase Realtime subscription for DELETE events: remove photos from the grid
- [x] 5.4 Implement infinite scroll using Intersection Observer: load next 20 photos when sentinel element is visible
- [x] 5.5 Implement lazy loading for images using `loading="lazy"` attribute

## Task 6: Lightbox with Swipe Gestures

- [x] 6.1 Implement lightbox open: on photo tap, show full-screen overlay with full-resolution image URL
- [x] 6.2 Implement lightbox close: close button, Escape key, and tap outside image
- [x] 6.3 Implement prev/next navigation with arrow keys and on-screen buttons
- [x] 6.4 Implement touch swipe detection: track touchstart/touchmove/touchend, navigate on horizontal swipe > 50px threshold
- [x] 6.5 Implement adjacent image preloading for smooth navigation

## Task 7: Admin Photo Moderation

- [x] 7.1 Add a "Fotos" tab to the admin panel (`admin/src/App.tsx`) with photo grid showing all uploaded photos and metadata (uploader name, timestamp)
- [x] 7.2 Implement photo deletion: confirmation dialog → delete from Supabase Storage → delete PhotoRecord from database
- [x] 7.3 Add Supabase client initialization in the admin panel using environment variables
- [x] 7.4 Ensure moderation actions require admin authentication (existing token check)

## Task 8: Navigation Integration

- [x] 8.1 Add a link to `/fotos` in the Gallery section of `index.astro` (visible CTA button styled with wedding theme)
- [x] 8.2 Ensure the fotos page includes a back link to the main wedding page

## Task 9: Property-Based Tests

- [x] 9.1 Set up fast-check as a dev dependency and create test file `basics/src/scripts/__tests__/photo-gallery.property.test.ts`
- [x] 9.2 Write property test for Property 1: File validation accepts only valid types and sizes (generate random MIME types and sizes, verify validateFile correctness)
- [x] 9.3 Write property test for Property 2: Generated filenames are unique (generate 1000 filenames, assert all unique)
- [x] 9.4 Write property test for Property 3: Guest name localStorage round-trip (generate random strings, store and retrieve, verify equality)
- [x] 9.5 Write property test for Property 4: Photos sorted in descending chronological order (generate random PhotoRecord arrays, verify sort)
- [x] 9.6 Write property test for Property 5: Photo card rendering includes uploader name and relative time (generate random PhotoRecords, verify rendered output)
- [x] 9.7 Write property test for Property 6: Image dimension scaling preserves aspect ratio and enforces max dimension (generate random dimensions, verify constraints)
- [x] 9.8 Write property test for Property 7: Storage URL generation produces correct thumbnail and full-res URLs (generate random paths, verify URL structure)

## Task 10: Supabase Infrastructure Setup Documentation

- [x] 10.1 Create `SUPABASE_SETUP.md` in the project root with step-by-step instructions for: creating the `wedding-photos` storage bucket (public read, authenticated write), creating the `photos` table with the specified schema, enabling Realtime on the table, and configuring RLS policies
