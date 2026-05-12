# Requirements Document

## Introduction

This feature adds a table seating management experience to the wedding website. It consists of two parts: (1) an admin section for managing table assignments within the existing admin panel, and (2) a guest-facing "Table Finder" page where guests enter their name and see an animated visualization of the venue tables, zooming into their assigned table with fellow guests. The guest page also displays the wedding menu (ementa). The existing Express/SQLite backend already provides tables CRUD and guest-to-table assignment APIs.

## Glossary

- **Admin_Panel**: The existing admin page at `basics/src/pages/admin.astro` that provides login, stats, search, and CSV export for wedding confirmations
- **Table_Manager**: The admin section responsible for creating, editing, deleting tables and assigning guests to tables
- **Table_Finder**: The public-facing page where guests search by name and see an animated table seating visualization
- **Seating_Map**: The visual representation of all venue tables displayed as a top-down layout with table shapes and labels
- **Table_Detail_View**: The zoomed-in view of a single table showing all guests assigned to that table
- **Ementa**: The wedding menu (food courses) displayed on the guest-facing Table Finder page
- **Backend_API**: The Express/SQLite server running on port 4000 that provides REST endpoints for guests and tables
- **Guest**: A person invited to the wedding, stored in the `guests` table with fields including `nome` and `mesa_id`
- **Table**: A physical table at the venue, stored in the `tables` database table with `id`, `name`, and `capacity` fields

## Requirements

### Requirement 1: Admin Table Creation and Management

**User Story:** As an admin, I want to create, edit, and delete tables in the admin panel, so that I can define the venue seating layout.

#### Acceptance Criteria

1. WHEN the admin navigates to the table management section, THE Table_Manager SHALL display all existing tables fetched from the Backend_API with their name, capacity, and number of assigned guests
2. WHEN the admin submits a new table form with a name and capacity, THE Table_Manager SHALL create the table via the Backend_API and display it in the table list without a full page reload
3. WHEN the admin edits a table name or capacity, THE Table_Manager SHALL update the table via the Backend_API and reflect the change in the table list
4. WHEN the admin deletes a table, THE Table_Manager SHALL remove the table via the Backend_API and remove it from the displayed list
5. IF the Backend_API returns an error during any table operation, THEN THE Table_Manager SHALL display a descriptive error message to the admin

### Requirement 2: Admin Guest-to-Table Assignment

**User Story:** As an admin, I want to assign guests to specific tables, so that I can organize the seating arrangement for the wedding.

#### Acceptance Criteria

1. WHEN the admin views the table management section, THE Table_Manager SHALL display a list of all guests with their current table assignment (or "unassigned")
2. WHEN the admin assigns a guest to a table, THE Table_Manager SHALL update the guest's `mesa_id` via the Backend_API and reflect the change immediately
3. WHEN the admin removes a guest from a table, THE Table_Manager SHALL set the guest's `mesa_id` to null via the Backend_API and show the guest as unassigned
4. WHILE a table has reached its capacity, THE Table_Manager SHALL display a visual warning when the admin attempts to assign additional guests to that table
5. THE Table_Manager SHALL display the current occupancy count alongside the capacity for each table

### Requirement 3: Admin Seating Visualization

**User Story:** As an admin, I want to see a visual overview of the seating arrangement, so that I can quickly understand the table layout and spot unassigned guests.

#### Acceptance Criteria

1. THE Table_Manager SHALL display a visual grid of all tables showing table name, capacity, and the names of assigned guests
2. THE Table_Manager SHALL visually distinguish between full tables, partially filled tables, and empty tables using color coding
3. THE Table_Manager SHALL display a count of unassigned guests prominently in the seating overview

### Requirement 4: Guest Name Search on Table Finder Page

**User Story:** As a guest, I want to enter my name on the Table Finder page, so that I can find my assigned table.

#### Acceptance Criteria

1. WHEN a guest navigates to the Table Finder page, THE Table_Finder SHALL display a name search input field with the wedding styling (Playfair Display headings, Montserrat body, olive/beige/gold palette)
2. WHEN a guest types their name, THE Table_Finder SHALL search for matching guests from the Backend_API using a case-insensitive partial match
3. WHEN multiple guests match the search query, THE Table_Finder SHALL display a list of matching names for the guest to select from
4. WHEN exactly one guest matches or the guest selects their name, THE Table_Finder SHALL transition to the Seating_Map animation
5. IF no guests match the search query, THEN THE Table_Finder SHALL display a friendly message indicating no match was found and suggest checking the spelling

### Requirement 5: Animated Seating Map Overview

**User Story:** As a guest, I want to see an animated overview of all tables at the venue, so that I can understand the seating layout before seeing my specific table.

#### Acceptance Criteria

1. WHEN the guest's name is confirmed, THE Table_Finder SHALL display the Seating_Map showing all tables as a top-down visual layout with smooth fade-in animation
2. THE Seating_Map SHALL render each table as a circular or rectangular shape with the table name label visible
3. WHEN the Seating_Map overview has been displayed for a brief moment, THE Table_Finder SHALL animate a zoom transition from the full map into the guest's assigned Table_Detail_View
4. THE Table_Finder SHALL use CSS transitions or keyframe animations with easing curves consistent with the existing site animations (cubic-bezier timing)
5. IF the guest has no table assigned (mesa_id is null), THEN THE Table_Finder SHALL display a message indicating that their table assignment is not yet available

### Requirement 6: Table Detail View with Guests

**User Story:** As a guest, I want to see who else is seated at my table, so that I know my tablemates.

#### Acceptance Criteria

1. WHEN the zoom animation completes on the guest's table, THE Table_Detail_View SHALL display the table name and all guests assigned to that table
2. THE Table_Detail_View SHALL visually highlight the searching guest's name among the listed tablemates
3. THE Table_Detail_View SHALL display guest names arranged visually around the table shape to suggest seating positions
4. WHEN the guest activates a "back" or "see all tables" control, THE Table_Finder SHALL animate back to the full Seating_Map overview with a smooth reverse zoom transition

### Requirement 7: Table Navigation from Overview

**User Story:** As a guest, I want to browse other tables from the overview, so that I can find friends at other tables.

#### Acceptance Criteria

1. WHEN the Seating_Map overview is displayed, THE Table_Finder SHALL allow the guest to tap or click on any table to zoom into its Table_Detail_View
2. WHEN the guest selects a different table from the overview, THE Table_Finder SHALL animate the zoom transition to the selected table's detail view
3. THE Table_Finder SHALL provide a visible control to return to the Seating_Map overview from any Table_Detail_View

### Requirement 8: Wedding Menu (Ementa) Display

**User Story:** As a guest, I want to see the wedding menu on the Table Finder page, so that I know what food will be served.

#### Acceptance Criteria

1. THE Table_Finder SHALL display the wedding menu (ementa) in a dedicated section on the page, accessible alongside the seating visualization
2. THE Table_Finder SHALL present the ementa with course categories (e.g., entradas, prato principal, sobremesa) styled consistently with the wedding theme
3. WHEN the guest navigates to the ementa section, THE Table_Finder SHALL display the menu content with a smooth scroll or transition animation

### Requirement 9: Responsive Design and Accessibility

**User Story:** As a guest, I want the Table Finder page to work well on my phone, so that I can check my table at the venue.

#### Acceptance Criteria

1. THE Table_Finder SHALL render correctly on viewport widths from 320px to 1920px
2. THE Seating_Map SHALL adapt its layout and table sizes to fit the available viewport without requiring horizontal scrolling
3. THE Table_Finder SHALL provide keyboard navigation for the name search, table selection, and back navigation controls
4. THE Table_Finder SHALL use appropriate ARIA labels on interactive elements for screen reader compatibility
5. THE Table_Manager SHALL be usable on tablet-sized viewports (768px and above) within the admin panel

### Requirement 10: Integration with Existing Backend API

**User Story:** As a developer, I want the feature to use the existing backend endpoints, so that no new server-side code is needed.

#### Acceptance Criteria

1. THE Table_Manager SHALL use the existing `GET /api/tables` endpoint to fetch all tables
2. THE Table_Manager SHALL use the existing `POST /api/tables` endpoint to create new tables
3. THE Table_Manager SHALL use the existing `PATCH /api/tables/:id` endpoint to update table properties
4. THE Table_Manager SHALL use the existing `DELETE /api/tables/:id` endpoint to remove tables
5. THE Table_Manager SHALL use the existing `POST /api/guests/:id/assign` endpoint to assign guests to tables
6. THE Table_Finder SHALL use the existing `GET /api/guests` endpoint to search for guests and retrieve table assignments
7. THE Table_Finder SHALL use the existing `GET /api/tables` endpoint to fetch all tables for the Seating_Map
