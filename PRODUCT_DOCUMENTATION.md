# Wedding Website Platform — Product Documentation

> Complete feature documentation for building a marketing website targeting potential clients (couples planning their wedding).

---

## Product Overview

A premium, fully-featured wedding website platform that provides couples with a beautiful, interactive digital experience for their guests. The platform combines a static frontend (for speed and SEO) with a real-time backend (for live features), deployed automatically via CI/CD.

**Target audience for the marketing site:** Couples planning their wedding who want a modern, elegant digital presence to share with their guests.

---

## Architecture Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Astro (static site generator) | Fast, SEO-friendly wedding website |
| Styling | Tailwind CSS | Responsive, mobile-first design |
| Backend | Supabase (PostgreSQL + Storage + Realtime) | Database, file storage, live updates |
| Admin Panel | React SPA (Vite) | Couple's management dashboard |
| Deployment | GitHub Pages + GitHub Actions | Zero-cost, automated hosting |
| Language | TypeScript | Type-safe, maintainable codebase |

---

## Core Features

### 1. Animated Envelope Intro

**What it does:** When guests first visit the site, they're greeted with a full-screen animated envelope experience. A golden wax seal with the couple's monogram sits at the center. Tapping/clicking triggers a cinematic sequence:

1. Seal shakes and shatters into fragments
2. Envelope splits open (top and bottom halves slide apart)
3. An elegant invitation card fades in with the couple's names, date, and venue
4. Transitions smoothly into the main content

**Key details:**
- Floating gold particles for ambiance
- Fully responsive (mobile + desktop)
- Keyboard accessible (Enter/Space to open)
- Smooth CSS animations with cubic-bezier easing
- "Tap to open" hint for first-time visitors

**Marketing angle:** *"A cinematic first impression — your guests will feel like they're opening a real invitation."*

---

### 2. Quiz Gate (Access Control)

**What it does:** After the envelope opens, guests must answer a personal trivia question about the couple before accessing the full site. This adds a playful, intimate touch and ensures only people who know the couple can view the details.

**Key details:**
- Multiple-choice format with 4 options
- Correct answer triggers a success animation and unlocks the site
- Wrong answers shake with feedback, allowing retry
- Fully customizable question and answers per couple
- Scroll is locked until the quiz is passed

**Marketing angle:** *"A fun, personal touch that makes your wedding site feel exclusive and intimate."*

---

### 3. Hero Section with Full-Screen Background

**What it does:** A stunning full-screen hero section featuring the couple's photo as background, with an elegant text overlay showing:
- "Vamos casar" (We're getting married) subtitle
- Couple's names in large serif typography
- Wedding date and venue
- Decorative ornaments and scroll indicator

**Key details:**
- Gradient overlay for text readability over any photo
- Responsive typography (scales from mobile to desktop)
- Lazy-loaded background image for performance

---

### 4. Live Countdown Timer

**What it does:** A real-time countdown displaying days, hours, minutes, and seconds until the wedding date. Updates every second.

**Key details:**
- Automatically switches to "Today is the big day! 🎉" message on the wedding date
- Elegant number display with labeled units
- Configurable target date

**Marketing angle:** *"Build excitement as the big day approaches — your guests will keep coming back to check."*

---

### 5. Ceremony & Venue Details

**What it does:** Displays the ceremony and reception locations as elegant cards with:
- Venue names and times
- Direct Google Maps links for navigation
- Venue photo

**Key details:**
- Two-column layout (ceremony + reception)
- One-tap navigation to Google Maps
- Venue imagery with rounded corners and shadows

---

### 6. Day Timeline / Schedule

**What it does:** A visual timeline showing the full day's program with times, event names, and descriptions. Alternating left/right layout on desktop.

**Key details:**
- Vertical line with dot markers
- Responsive: single-column on mobile, alternating on desktop
- Customizable events (time, title, description)
- Example events: Ceremony → Cocktail → Dinner → Party → Last Dance

**Marketing angle:** *"Keep your guests informed with a beautiful visual schedule of the entire celebration."*

---

### 7. Love Story Section

**What it does:** A storytelling section with the couple's narrative alongside photos. Grid layout with a large feature image and a row of smaller photos.

**Key details:**
- Two-column layout (image + text) on desktop
- Multiple paragraphs of customizable story text
- Photo grid (3 columns) below the main story
- Lazy-loaded images

---

### 8. Photo Gallery with Lightbox

**What it does:** A masonry-style photo grid showcasing the couple's photos. Clicking any photo opens a full-screen lightbox with navigation.

**Key details:**
- Masonry grid (2 columns mobile, 3 columns desktop)
- Full-screen lightbox with previous/next navigation
- Keyboard navigation (arrows, Escape)
- Hover effects with subtle zoom
- Links to the Live Photo Gallery feature

---

### 9. Live Photo Gallery (Real-Time Guest Photos)

**What it does:** A dedicated page where guests can upload and view photos during the wedding event in real-time. Photos appear instantly for all viewers via Supabase Realtime subscriptions.

**Key details:**
- **Photo upload:** Floating action button (FAB) opens upload modal
- **File validation:** Accepts JPEG, PNG, HEIC, WebP up to 10MB
- **Image compression:** Client-side compression to 1920px max dimension, 85% JPEG quality
- **Guest name:** Optional name input (persisted in localStorage)
- **Masonry grid:** Responsive 2-3 column layout
- **Infinite scroll:** Loads 20 photos at a time with IntersectionObserver
- **Real-time updates:** New photos appear instantly via Supabase Realtime (INSERT events)
- **Real-time deletions:** Photos removed by admin disappear with animation
- **Lightbox:** Full-screen viewer with swipe support (touch) and keyboard navigation
- **Preloading:** Adjacent photos preloaded for smooth navigation
- **Reconnection indicator:** Shows when connection drops and reconnects
- **Relative timestamps:** "agora mesmo", "há 2 min", "há 1 hora", etc.
- **Upload progress:** Animated progress bar with percentage

**Marketing angle:** *"A live, collaborative photo album — every guest becomes a photographer, and everyone sees the moments as they happen."*

---

### 10. Interactive Table Finder (Seating Chart)

**What it does:** A dedicated page where guests search their name to find their assigned table. Features an interactive SVG floor plan with animated zoom and a detail panel.

**Key details:**
- **Search:** Full-screen centered search with instant results
- **SVG floor plan:** Custom-rendered tables with seats, showing occupancy
- **Animated zoom:** Smooth zoom-to-table animation (2.5x scale) with cubic-bezier easing
- **Guest highlighting:** The searching guest's seat is highlighted in gold
- **Detail panel:** Bottom sheet (mobile) / sidebar showing all guests at the selected table
- **Table navigation:** Click any table to zoom and see its guests
- **Back to overview:** Button to zoom out to full floor plan
- **No-table state:** Graceful message if guest hasn't been assigned yet
- **Accessibility:** ARIA labels, keyboard navigation, live regions for announcements
- **Reduced motion:** Respects `prefers-reduced-motion` preference

**Marketing angle:** *"No more paper charts — guests find their table in seconds with an interactive, animated floor plan."*

---

### 11. Wedding Menu (Ementa)

**What it does:** Displays the full wedding menu organized by course (starters, mains, desserts, drinks) with elegant typography and descriptions.

**Key details:**
- Appears below the table finder after a guest selects their table
- Organized by course with decorative headers
- Each item has a name and description
- Ornamental dividers between sections

---

### 12. Dress Code Section

**What it does:** Communicates the dress code expectations with separate guidance for men and women, plus practical tips (e.g., avoid stilettos on uneven terrain).

**Key details:**
- Card-based layout
- Gender-specific recommendations with emoji icons
- Practical footwear advice
- Warm, friendly tone

---

### 13. Gift List / Honeymoon Fund

**What it does:** Provides payment options for guests who want to contribute to the couple's honeymoon, including MBWay numbers and bank transfer (IBAN).

**Key details:**
- Two payment method cards (MBWay + Bank Transfer)
- Individual contact numbers for each partner
- Full IBAN displayed
- Honeymoon destination image
- Warm messaging ("Your presence is the greatest gift")

---

### 14. RSVP Form with Companion Management

**What it does:** A comprehensive RSVP form where guests confirm attendance and add companions (adults or children) with dietary restrictions.

**Key details:**
- **Fields:** Name, phone number, dietary restrictions, message to the couple
- **Companion system:** Dynamic "Add Adult" / "Add Child" buttons
- **Per-companion data:** Name, type (adult/child), allergies
- **Animated cards:** Companions appear with slide-in animation, removable with fade-out
- **Validation:** Required fields (name, phone)
- **Success/error feedback:** Styled messages after submission
- **Direct Supabase insert:** No server middleware needed

**Marketing angle:** *"Effortless RSVPs — guests confirm in seconds, add companions, and note dietary needs all in one form."*

---

### 15. FAQ Section (Accordion)

**What it does:** Expandable FAQ items with smooth animations. Only one item open at a time.

**Key details:**
- Animated expand/collapse with CSS grid transitions
- Rotating icon (+ to ×)
- Customizable questions and answers
- Hover and active states
- Accessible with `aria-expanded`

---

### 16. Contact Section

**What it does:** Simple, elegant contact cards with phone numbers for both partners. Tap-to-call on mobile.

---

### 17. Light/Dark Theme Toggle

**What it does:** Allows switching between light and dark visual modes. Default theme is configurable via a simple TypeScript config file.

**Key details:**
- Configurable default theme (`light` or `dark`)
- User preference persisted in localStorage
- Toggle button in the header
- Only cards change color; background images remain unchanged

---

## Admin Panel Features

A separate React SPA for the couple to manage their wedding:

### 18. Guest Management

- **Guest list:** Searchable, filterable table of all RSVPs
- **Edit guests:** Modal to update name, email, phone, dietary restrictions, table assignment
- **Delete guests:** With confirmation dialog
- **Check-in system:** Mark guests as arrived (with timestamp)
- **CSV export:** Download full guest list as CSV
- **Statistics dashboard:** Total guests, confirmed, checked-in, pending

### 19. Table Management

- **Create tables:** Name + capacity
- **Visual cards:** Show occupancy (X/Y) with color-coded badges
- **Guest preview:** Shows first 3 assigned guests per table

### 20. Photo Moderation

- **Photo grid:** All uploaded photos with thumbnails
- **Delete photos:** Remove inappropriate content (deletes from storage + database)
- **Metadata:** Uploader name, timestamp
- **Refresh:** Manual reload button

### 21. Admin Authentication

- Password-protected access
- Session persisted in localStorage
- Logout functionality

---

## Technical Highlights (for marketing credibility)

| Feature | Benefit |
|---------|---------|
| Static site generation (Astro) | Lightning-fast page loads, perfect SEO |
| Mobile-first responsive design | Looks great on any device |
| Supabase Realtime | Live photo updates without page refresh |
| Client-side image compression | Fast uploads even on slow connections |
| GitHub Pages deployment | Zero hosting costs, automatic deploys |
| TypeScript throughout | Reliable, maintainable code |
| Tailwind CSS | Consistent, beautiful design system |
| Accessibility (ARIA, keyboard nav) | Inclusive for all guests |
| Reduced motion support | Respects user preferences |
| Property-based testing | Verified correctness of core logic |
| Infinite scroll | Smooth browsing of large photo galleries |
| Touch gestures | Swipe navigation in lightbox |
| Progressive loading | Lazy images, paginated data |

---

## Customization Points

Everything a new couple would need to personalize:

1. **Couple's names** — displayed throughout
2. **Wedding date** — countdown target
3. **Venue details** — ceremony + reception locations with maps
4. **Background/hero photo** — full-screen couple image
5. **Gallery photos** — pre-wedding photo collection
6. **Love story text** — narrative paragraphs
7. **Timeline events** — day schedule
8. **Quiz question** — personal trivia for access gate
9. **Dress code text** — custom guidance
10. **Gift/payment details** — MBWay, IBAN, etc.
11. **FAQ items** — custom Q&A pairs
12. **Contact numbers** — couple's phone numbers
13. **Menu items** — full wedding menu by course
14. **Color theme** — light/dark default + olive/gold/beige palette
15. **Monogram** — wax seal initials
16. **Table layout** — number and arrangement of tables

---

## Deployment & Infrastructure

- **Frontend hosting:** GitHub Pages (free, CDN-backed)
- **Backend:** Supabase free tier (PostgreSQL, Storage, Realtime)
- **CI/CD:** GitHub Actions (auto-deploy on push to main)
- **Domain:** Custom domain support via GitHub Pages settings
- **SSL:** Automatic HTTPS via GitHub Pages

---

## User Flows

### Guest Flow
1. Visit URL → See animated envelope
2. Tap to open → Envelope splits, invitation card appears
3. Answer quiz → Unlock full site
4. Browse sections → Countdown, story, gallery, details
5. RSVP → Fill form with companions
6. Find table → Search name, see interactive floor plan
7. Share photos → Upload during event, see others' photos live

### Couple (Admin) Flow
1. Login to admin panel
2. View dashboard stats (total, confirmed, checked-in)
3. Manage guest list (edit, delete, assign tables)
4. Create/manage tables
5. Moderate uploaded photos
6. Export guest data as CSV
7. Check in guests on the day

---

## Summary for Marketing Copy

This platform delivers:

- **A cinematic first impression** with the animated envelope and wax seal
- **Playful exclusivity** via the personal quiz gate
- **Real-time collaboration** through the live photo gallery
- **Effortless logistics** with interactive seating charts and RSVP management
- **Zero hosting costs** with static deployment on GitHub Pages
- **Mobile-first design** that works beautifully on any device
- **Complete admin control** for the couple to manage everything

The entire experience is designed to feel premium, personal, and effortless — both for the couple setting it up and for the guests using it on the big day.
