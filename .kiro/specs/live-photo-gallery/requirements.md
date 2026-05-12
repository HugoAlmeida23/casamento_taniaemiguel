# Requirements Document

## Introduction

A dedicated live photo gallery page for the Tânia & Miguel wedding website where guests can upload photos from their phones during the event and view all shared photos in real-time. The feature uses Supabase Storage for image hosting and Supabase Realtime for live feed updates, providing a collaborative photo-sharing experience throughout the wedding celebration.

## Glossary

- **Photo_Gallery_Page**: The Astro page at `/fotos` that displays the live photo feed and upload interface
- **Upload_Module**: The client-side component responsible for capturing and submitting photos to Supabase Storage
- **Live_Feed**: The real-time photo grid that updates automatically when new photos are uploaded by any guest
- **Photo_Record**: A row in the Supabase `photos` table containing metadata (storage path, uploader name, timestamp, approval status)
- **Supabase_Storage**: The Supabase Storage bucket (`wedding-photos`) used to store uploaded image files
- **Supabase_Client**: The `@supabase/supabase-js` client initialized with `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
- **Admin_Moderation_Panel**: The section within the existing admin interface for reviewing and removing photos
- **Image_Thumbnail**: A resized version of the uploaded photo optimized for grid display
- **Guest**: A wedding attendee using the Photo_Gallery_Page on a mobile device

## Requirements

### Requirement 1: Photo Upload

**User Story:** As a guest, I want to upload photos from my phone during the wedding, so that I can share moments with everyone at the event.

#### Acceptance Criteria

1. WHEN a Guest taps the upload button, THE Upload_Module SHALL open the device camera or file picker allowing selection of one or more image files
2. WHEN a Guest selects image files for upload, THE Upload_Module SHALL accept files in JPEG, PNG, HEIC, and WebP formats
3. WHEN a Guest selects an image file larger than 10 MB, THE Upload_Module SHALL reject the file and display a size limit message
4. WHEN a Guest submits a photo, THE Upload_Module SHALL upload the file to Supabase_Storage in the `wedding-photos` bucket with a unique filename
5. WHEN a Guest submits a photo, THE Upload_Module SHALL create a Photo_Record in the Supabase `photos` table with the storage path, uploader name, and upload timestamp
6. WHILE an upload is in progress, THE Upload_Module SHALL display a progress indicator to the Guest
7. WHEN an upload completes successfully, THE Upload_Module SHALL display a success confirmation and clear the upload form
8. IF an upload fails due to a network error, THEN THE Upload_Module SHALL display an error message and allow the Guest to retry the upload

### Requirement 2: Guest Identification

**User Story:** As a guest, I want to provide my name before uploading, so that photos can be attributed to me in the gallery.

#### Acceptance Criteria

1. WHEN a Guest first visits the Photo_Gallery_Page, THE Photo_Gallery_Page SHALL prompt the Guest to enter a display name
2. WHEN a Guest provides a display name, THE Photo_Gallery_Page SHALL persist the name in browser localStorage for subsequent visits
3. WHILE a Guest has not provided a display name, THE Upload_Module SHALL disable the upload button
4. THE Photo_Gallery_Page SHALL display the stored Guest name with an option to change it

### Requirement 3: Real-Time Photo Feed

**User Story:** As a guest, I want to see new photos appear automatically without refreshing the page, so that I can follow the event in real-time.

#### Acceptance Criteria

1. WHEN the Photo_Gallery_Page loads, THE Live_Feed SHALL fetch and display all existing Photo_Records from the Supabase `photos` table ordered by upload timestamp descending
2. WHEN a new Photo_Record is inserted into the Supabase `photos` table, THE Live_Feed SHALL display the new photo within 3 seconds without requiring a page refresh
3. THE Live_Feed SHALL display photos in a responsive masonry grid layout with 2 columns on mobile and 3 columns on desktop
4. WHEN a Guest taps a photo in the Live_Feed, THE Photo_Gallery_Page SHALL open a full-screen lightbox view of the photo
5. THE Live_Feed SHALL display the uploader name and relative upload time beneath each photo thumbnail
6. WHEN the Photo_Gallery_Page loads with more than 20 photos, THE Live_Feed SHALL implement infinite scroll loading in batches of 20 photos

### Requirement 4: Image Optimization

**User Story:** As a guest, I want photos to load quickly on my phone, so that I can browse the gallery without excessive data usage.

#### Acceptance Criteria

1. WHEN a photo is uploaded, THE Upload_Module SHALL compress the image client-side to a maximum dimension of 1920px on the longest side before uploading to Supabase_Storage
2. THE Live_Feed SHALL request Image_Thumbnails at a maximum width of 400px for grid display
3. WHEN a Guest opens the lightbox view, THE Photo_Gallery_Page SHALL load the full-resolution image (up to 1920px)
4. THE Live_Feed SHALL use lazy loading for images below the visible viewport

### Requirement 5: Mobile-First Design

**User Story:** As a guest at the wedding, I want the gallery to work well on my phone, so that I can easily upload and browse photos during the event.

#### Acceptance Criteria

1. THE Photo_Gallery_Page SHALL use a mobile-first responsive layout with touch-friendly tap targets of at least 44x44 pixels
2. THE Photo_Gallery_Page SHALL use the wedding theme colors (olive-500, beige-50, gold-400) and fonts (Playfair Display for headings, Montserrat for body text)
3. THE Photo_Gallery_Page SHALL include a fixed-position upload button accessible from any scroll position
4. THE Photo_Gallery_Page SHALL support swipe gestures for navigating between photos in the lightbox view
5. THE Photo_Gallery_Page SHALL render correctly on viewports from 320px to 1440px wide

### Requirement 6: Admin Photo Moderation

**User Story:** As a wedding organizer, I want to remove inappropriate photos from the gallery, so that the shared album remains appropriate for all guests.

#### Acceptance Criteria

1. WHEN an admin accesses the Admin_Moderation_Panel, THE Admin_Moderation_Panel SHALL display all uploaded photos with their metadata (uploader name, timestamp)
2. WHEN an admin selects a photo for deletion, THE Admin_Moderation_Panel SHALL remove the Photo_Record from the Supabase `photos` table and the file from Supabase_Storage
3. WHEN a Photo_Record is deleted, THE Live_Feed SHALL remove the corresponding photo from all connected Guest views within 3 seconds
4. THE Admin_Moderation_Panel SHALL require admin authentication before allowing moderation actions

### Requirement 7: Supabase Infrastructure

**User Story:** As a developer, I want the Supabase resources properly configured, so that the photo gallery functions correctly with appropriate security.

#### Acceptance Criteria

1. THE Supabase_Storage SHALL have a `wedding-photos` bucket configured with public read access and authenticated write access
2. THE Supabase_Client SHALL be initialized using the existing `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` environment variables
3. THE Supabase `photos` table SHALL have columns for id (UUID primary key), storage_path (text), uploader_name (text), created_at (timestamp with timezone), and is_visible (boolean defaulting to true)
4. THE Supabase `photos` table SHALL have Realtime enabled for INSERT and DELETE events
5. IF the Supabase_Client fails to initialize, THEN THE Photo_Gallery_Page SHALL display an offline message and hide the upload functionality

### Requirement 8: Navigation Integration

**User Story:** As a guest, I want to easily find the photo gallery from the main wedding website, so that I can access it during the event.

#### Acceptance Criteria

1. THE Photo_Gallery_Page SHALL be accessible at the URL path `/fotos` under the base path `/casamento_taniaemiguel`
2. WHEN a Guest visits the main page Gallery section, THE Gallery section SHALL include a visible link to the Photo_Gallery_Page
3. THE Photo_Gallery_Page SHALL include navigation to return to the main wedding page
