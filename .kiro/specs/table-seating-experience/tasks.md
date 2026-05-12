# Implementation Plan: Table Seating Experience

## Overview

This plan implements the table seating feature in two main tracks: (1) Admin Table Manager section added to the existing `admin.astro` page, and (2) a new guest-facing Table Finder page at `/mesa`. Shared utility functions are built first, then the admin UI, then the guest page with animations, and finally property-based tests. All code uses vanilla TypeScript within Astro `<script>` tags, CSS transitions for animations, and the existing Express/SQLite API on port 4000.

## Tasks

- [x] 1. Create shared data utility functions
  - [x] 1.1 Create `basics/src/scripts/seating-utils.ts` with pure data transformation functions
    - Implement `groupGuestsByTable(tables, guests)` — groups guests by `mesa_id`, returns a map of table ID to guest array
    - Implement `partitionGuestsByAssignment(guests)` — splits guests into assigned (non-null `mesa_id`) and unassigned (null `mesa_id`) arrays
    - Implement `isOverCapacity(capacity, assignedCount)` — returns true if assignedCount >= capacity
    - Implement `getTableFillLevel(occupancy, capacity)` — returns `'empty'` | `'partial'` | `'full'`
    - Implement `searchGuestsByName(guests, query)` — case-insensitive partial match filter on `nome` field
    - Implement `getHighlightedGuestId(guests, currentGuestId)` — returns the ID of the guest to highlight, or null if not found
    - Export TypeScript interfaces: `Table`, `Guest`, `TableWithOccupancy`, `SeatingMapState`
    - _Requirements: 1.1, 2.1, 2.4, 3.2, 4.2, 6.2_

  - [ ]* 1.2 Write property test: guest-to-table grouping correctness
    - **Property 1: Guest-to-table grouping correctness**
    - Install `fast-check` as a dev dependency in `basics/`
    - Create `basics/src/scripts/seating-utils.test.ts` with fast-check property test
    - Generate arbitrary tables and guests with random `mesa_id` values (some matching table IDs, some null)
    - Assert: each table's guest list contains exactly guests whose `mesa_id` matches, no guest in multiple lists
    - **Validates: Requirements 1.1, 2.5, 3.1, 6.1**

  - [ ]* 1.3 Write property test: guest assignment classification
    - **Property 2: Guest assignment classification**
    - Generate arbitrary guest lists with random null/non-null `mesa_id`
    - Assert: assigned + unassigned = total count, sets are disjoint, classification matches `mesa_id` nullity
    - **Validates: Requirements 2.1, 3.3**

  - [ ]* 1.4 Write property test: capacity warning correctness
    - **Property 3: Capacity warning correctness**
    - Generate arbitrary capacity (positive integer) and assignedCount (non-negative integer)
    - Assert: warning is active iff assignedCount >= capacity
    - **Validates: Requirements 2.4**

  - [ ]* 1.5 Write property test: table fill-level classification
    - **Property 4: Table fill-level classification**
    - Generate arbitrary occupancy (non-negative) and capacity (positive)
    - Assert: returns "empty" when occupancy=0, "full" when occupancy>=capacity, "partial" otherwise; classifications are mutually exclusive
    - **Validates: Requirements 3.2**

  - [ ]* 1.6 Write property test: case-insensitive partial name search
    - **Property 5: Case-insensitive partial name search**
    - Generate arbitrary guest lists with random names and a random query substring
    - Assert: results contain exactly guests whose lowercased `nome` contains the lowercased query
    - **Validates: Requirements 4.2**

  - [ ]* 1.7 Write property test: current guest highlighting
    - **Property 6: Current guest highlighting**
    - Generate arbitrary guest list and pick one guest ID from the list
    - Assert: exactly one guest is highlighted and it matches the provided ID
    - **Validates: Requirements 6.2**

- [x] 2. Checkpoint - Verify shared utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Admin Table Manager section in admin.astro
  - [x] 3.1 Add tab navigation to admin dashboard
    - Add "Confirmações" and "Mesas" tab buttons to the `.dash-header` area
    - Implement tab switching logic that shows/hides the confirmations view and the new table manager view
    - Style tabs consistently with existing `.btn-secondary` / `.btn-primary` patterns
    - _Requirements: 1.1_

  - [x] 3.2 Implement table list with CRUD operations
    - Add a table management section with a list of all tables (fetched from `GET /api/tables`)
    - Add inline form for creating a new table (name + capacity) that calls `POST /api/tables`
    - Add edit functionality (inline edit for name/capacity) that calls `PATCH /api/tables/:id`
    - Add delete button with confirmation dialog that calls `DELETE /api/tables/:id`
    - Show table name, capacity, and current occupancy count for each table
    - Display error messages on API failures
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5_

  - [x] 3.3 Implement guest-to-table assignment
    - Display list of all guests (from `GET /api/guests`) with their current table assignment or "Sem mesa"
    - Add a dropdown/select per guest to assign them to a table (calls `POST /api/guests/:id/assign`)
    - Allow unassigning a guest (sets `table_id: null`)
    - Show visual warning (gold/amber highlight) when assigning to a table that is at or over capacity
    - Update occupancy counts immediately after assignment changes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.4 Implement visual seating overview grid
    - Render a card grid showing all tables with their name, capacity, and assigned guest names
    - Color-code cards: green/olive for partial, gold for full, grey/beige for empty
    - Display unassigned guest count prominently above the grid
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint - Verify admin table manager
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create guest-facing Table Finder page (mesa.astro)
  - [x] 5.1 Create page scaffold and search UI
    - Create `basics/src/pages/mesa.astro` with Layout wrapper and wedding theme styling
    - Add page header "Encontre a sua Mesa" using Playfair Display font
    - Implement name search input with Montserrat font, olive/beige/gold color palette
    - Implement search logic: fetch `GET /api/guests` on submit, filter locally with `searchGuestsByName`
    - Show results dropdown when multiple matches, allow selection
    - Show "not found" message when no matches with spelling suggestion
    - Handle single-match case: auto-proceed to map
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.6_

  - [x] 5.2 Implement seating map overview rendering
    - Create the `.seating-map-viewport` container with overflow hidden
    - Create the `.seating-map-inner` transformable container
    - Fetch tables from `GET /api/tables` and render each as a circular element with table name label
    - Arrange tables in a responsive grid layout within the map container
    - Add fade-in animation on initial map display
    - Handle empty tables data with placeholder message
    - Respect `prefers-reduced-motion` media query
    - _Requirements: 5.1, 5.2, 5.5, 9.1, 9.2, 10.7_

  - [x] 5.3 Implement zoom animation to guest's table
    - Calculate CSS `transform: scale() translate()` values to center and zoom into the guest's assigned table
    - Apply `transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)` for smooth GPU-accelerated animation
    - Auto-trigger zoom after a brief overview display (1-2 seconds delay)
    - Show "mesa não atribuída" message if guest has no `mesa_id`
    - Skip animation and show detail directly when `prefers-reduced-motion` is active
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 5.4 Implement table detail view with guest names
    - Create `.table-detail-overlay` that fades in after zoom completes (0.4s delay)
    - Display table name as heading and all assigned guests arranged visually around a table shape
    - Highlight the searching guest's name with gold accent color
    - Add "← Ver todas as mesas" back button that triggers reverse zoom to overview
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.5 Implement table navigation from overview
    - Add click/tap handlers on each table element in the overview
    - On table click, animate zoom to that table's detail view (same animation as auto-zoom)
    - Ensure back button returns to full overview with smooth reverse transition
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 5.6 Implement ementa (wedding menu) section
    - Add a dedicated section below the seating map for the wedding menu
    - Structure with course categories: Entradas, Prato Principal, Sobremesa
    - Style consistently with wedding theme (Playfair headings, olive/beige palette)
    - Add smooth scroll transition when navigating to ementa section
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 5.7 Implement responsive design and accessibility
    - Ensure layout works from 320px to 1920px viewport widths
    - Make seating map adapt table sizes to viewport without horizontal scroll
    - Add keyboard navigation: Tab through search, Enter to select, Escape to go back
    - Add ARIA labels on search input, table buttons, back button, and interactive elements
    - Ensure touch targets are at least 44x44px on mobile
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 6. Checkpoint - Verify guest-facing page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integration wiring and final verification
  - [x] 7.1 Wire admin table manager with API proxy
    - Verify Vite proxy config routes `/api` calls to `localhost:4000` during development
    - Test full admin flow: create table → assign guest → verify in seating grid
    - Ensure admin table manager section is accessible only after login
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 7.2 Wire Table Finder page with API and verify navigation
    - Add link to `/mesa` page from guest page or provide direct URL access
    - Test full guest flow: search name → see map → zoom to table → see tablemates → back to overview → click other table
    - Verify API calls work through the Vite proxy in development
    - _Requirements: 10.6, 10.7_

  - [ ]* 7.3 Write integration tests for end-to-end flows
    - Test admin flow: create table, assign guest, verify occupancy updates
    - Test guest flow: search, map render, zoom animation triggers, detail view shows correct guests
    - Test error states: mock API failures, verify error messages display
    - _Requirements: 1.5, 4.5, 5.5_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- All code uses vanilla TypeScript in Astro `<script>` tags — no React/Vue framework additions
- The existing Vite proxy in `astro.config.mjs` already routes `/api` to `localhost:4000`
- CSS animations use `transform` (GPU-accelerated) for 60fps performance
- The base path `/casamento_taniaemiguel` is configured in `astro.config.mjs` and applies automatically
