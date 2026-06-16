# Implementation Plan: Wedding Site Improvements

## Overview

This plan implements all 15 requirements for the Tânia & Miguel wedding site improvements. The implementation uses Astro 5.x, Tailwind CSS, Supabase, and Vitest + fast-check for property-based testing. Tasks are ordered to build foundational changes first (typography, date fixes), then modify existing sections, then create new sections and pages, and finally wire everything together.

## Tasks

- [x] 1. Fix global typography and date corrections
  - [x] 1.1 Create/update global CSS classes for section-title and section-subtitle
    - Ensure `section-title` class in `basics/src/styles/global.css` uses Playfair Display, color gray-900 (#111827), responsive font sizes (1.875rem mobile / 2.25rem md / 3rem lg)
    - Ensure `section-subtitle` class uses olive-500 color, uppercase, tracking 0.25em, font-weight medium (500)
    - Remove any inline style overrides on section titles/subtitles across all section files
    - _Requirements: 4.1, 4.2_

  - [x] 1.2 Fix Timeline section typography overrides
    - Remove inline color overrides from the title and subtitle elements in `basics/src/sections/Timeline.astro`
    - Apply `section-title` class to the "O que planeámos para vocês" title
    - Apply `section-subtitle` class to the "Programa do dia" subtitle
    - _Requirements: 4.3, 4.4_

  - [x] 1.3 Fix Footer date and meta description
    - Update `basics/src/components/Footer.astro` to display "28 de Maio de 2027" instead of "20 de Junho de 2027"
    - Update `basics/src/layouts/Layout.astro` meta description and og:description with correct date "28 de Maio de 2027"
    - Search entire codebase for "20 de Junho" and replace all occurrences
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 1.4 Write property tests for typography consistency (Properties 1 & 2)
    - **Property 1: Section title typography consistency** — For any element with `section-title` class, verify no inline style overrides on color or font-family
    - **Property 2: Section subtitle typography consistency** — For any element with `section-subtitle` class, verify no inline style overrides on color, text-transform, letter-spacing, or font-weight
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 1.5 Write property test for incorrect date string absence (Property 8)
    - **Property 8: Incorrect date string absence** — Scan all .astro files to verify no occurrence of "20 de Junho de 2027"
    - **Validates: Requirements 14.3**

- [x] 2. QuizGate improvements — Photo reveal and skip link
  - [x] 2.1 Implement tap-to-advance WTF photo reveal in QuizGate
    - Modify `basics/src/components/QuizGate.astro` state machine to add WTFReveal → WaitingForTap state
    - After correct answer and "Correto!" feedback (800ms), transition to full-viewport overlay with "WTF?!" text animating in, then photo appearing 300ms after
    - Remove auto-dismiss timer (was 4500ms), require explicit tap/click to advance
    - On tap: fade out overlay (800ms), reveal main content, re-enable scroll
    - Keep wrong-answer shake animation (1500ms) and unlimited retries
    - Maintain localStorage persistence for `wedding_quiz_passed`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Add skip link to QuizGate
    - Add a skip link below the answer options with minimum 44×44px tap target
    - Include accessible label (e.g., aria-label="Avançar para o site sem responder ao quiz")
    - On activation: dismiss quiz overlay within 1s, bypass WTF reveal, unlock scroll, remove gate overlays
    - Persist bypass in localStorage (`wedding_quiz_passed = 'true'`)
    - Handle localStorage unavailable gracefully (catch exceptions, show quiz on each visit)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.3 Write unit tests for QuizGate state transitions
    - Test correct answer → feedback → WTF reveal → tap → dismiss flow
    - Test wrong answer → shake → retry flow
    - Test skip link → dismiss flow
    - Test localStorage bypass on revisit
    - Test localStorage unavailable scenario
    - _Requirements: 1.1–1.5, 2.1–2.4_

- [x] 3. Checkpoint — Typography and QuizGate
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. HeroModern contrast and font improvements
  - [x] 4.1 Update HeroModern text contrast and font sizing
    - Apply contrast treatment (text-shadow or semi-transparent backdrop) to all overlay text in `basics/src/components/HeroModern.astro`
    - Ensure z-index layering positions text above the Plaza de España illustration
    - Apply font assignments: cursive script for couple names, serif for date/tagline, sans-serif for welcome subtitle
    - Mobile (<768px): couple names min 48px, other text min 16px
    - Desktop (≥768px): couple names min 96px, other text min 18px
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Countdown section improvements
  - [x] 5.1 Add textured background and wax seal to Countdown section
    - Update `basics/src/components/CountdownModern.astro` to use `sand-texture.jpg` as background-image (cover, no tiling seams)
    - Replace leaf ornament emoji with `wax-seal-prata.png` logo (48–80px width, centered)
    - Apply CSS filter or color-matching to ensure seal matches decorative line color
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 Implement wedding-day conditional logic in Countdown
    - Add date comparison using `Intl.DateTimeFormat` with `timeZone: 'Europe/Lisbon'`
    - When date >= 2027-05-28: hide countdown units, display "HOJE É O GRANDE DIA" message
    - Show link "Clica aqui para veres todos os detalhes!" navigating to `/dia` page
    - After wedding day (29 May onwards): continue showing wedding day message and link
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 5.3 Write property test for countdown wedding-day state (Property 3)
    - **Property 3: Countdown wedding-day state** — For any timestamp on or after 2027-05-28 (Europe/Lisbon), the countdown state function returns "wedding day" mode
    - **Validates: Requirements 6.1, 6.4**

- [x] 6. Update existing sections — LoveStory, Gallery, GiftList
  - [x] 6.1 Update LoveStory section title and subtitle
    - In `basics/src/sections/LoveStory.astro`, set title to "A Nossa História"
    - Set subtitle to "Um pouco mais sobre nós", positioned above the title
    - Ensure both use standard `section-title` and `section-subtitle` classes
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 6.2 Update Gallery section — remove live gallery CTA
    - In `basics/src/sections/Gallery.astro`, set title to "Galeria" and subtitle to "Memórias"
    - Remove any link, button, or CTA referencing live gallery upload
    - Ensure at least 1 photo from couple's collection remains in grid layout
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 6.3 Update GiftList section with new title, subtitle, text, and icons
    - In `basics/src/sections/GiftList.astro`, set title to "Mimos e Ofertas"
    - Set subtitle to "Um gesto carinhoso" above the title
    - Update descriptive text to "A tua presença é o maior presente de todos. Se quiseres contribuir podes fazê-lo pessoalmente no dia ou através das seguintes formas:"
    - Replace icons: phone icon for MBWay, multibank/bank-card icon for bank transfer
    - Display as 2-column grid on ≥640px, stacked on narrower viewports
    - Show phone numbers under MBWay, IBAN under bank transfer
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 7. RSVP section restructure
  - [x] 7.1 Update RSVP form fields and labels
    - In `basics/src/sections/RSVP.astro`, set title to "Confirmações" and subtitle to "Esperamos por vocês"
    - Update "Nome" field: required, placeholder "Primeiro e último nome", max 100 chars
    - Update "Telemóvel" field: required, placeholder "+351 912 345 678"
    - Update "Alergias" field: optional, placeholder "Glúten, lactose, vegetariano, vegan, …"
    - Add HTML5 required validation preventing empty Nome/Telemóvel submission
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 7.2 Implement adult/child companion form with validation
    - Add "+ Adulto" and "+ Criança" buttons to companion section
    - Adult card: name field (placeholder "Primeiro e último nome") + allergies field (max 200 chars, optional)
    - Child card: name field + age field (integer 0–17) + allergies field (max 200 chars, optional)
    - Display type badge ("Adulto" / "Criança") on each card
    - Add remove button with fade-out animation (≤300ms)
    - Enforce max 10 companions total (adults + children)
    - On submit: filter out companions with empty names (after trim), send only valid entries to Supabase
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 7.3 Write property tests for companion form (Properties 4, 5, 6)
    - **Property 4: Companion count cap** — For any sequence of add operations, the list never exceeds 10 entries
    - **Property 5: Child companion age validation** — Only values [0, 17] are accepted as valid ages
    - **Property 6: Empty-name companions excluded** — Submitted payload contains only non-empty-name companions
    - **Validates: Requirements 10.1, 10.2, 10.6**

- [x] 8. Checkpoint — Existing sections updated
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. FAQ section — New content and accordion
  - [x] 9.1 Implement FAQ section with 6 accordion items
    - In `basics/src/sections/Faq.astro`, set title to "Perguntas frequentes" and subtitle to "Para não ficar nenhuma dúvida"
    - Implement 6 FAQ items in exact order with specified questions and answers
    - All items collapsed on initial load
    - Single-expansion accordion: clicking one collapses the others
    - Set `aria-expanded` attribute on trigger buttons ("true"/"false")
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 9.2 Write property test for FAQ accordion invariant (Property 7)
    - **Property 7: FAQ accordion single-expansion invariant** — For any sequence of click events, at most one item is expanded at any time
    - **Validates: Requirements 13.4**

- [x] 10. New section — MusicRequest ("Notas e Melodias")
  - [x] 10.1 Create MusicRequest section component
    - Create `basics/src/sections/MusicRequest.astro`
    - Title: "Notas e Melodias", subtitle: "Um Toque Especial"
    - Add descriptive text as specified in requirement 11.3
    - Form with "Nome do Convidado" (required, max 100 chars) and "Música e Artista" (required, max 200 chars)
    - On submit: insert into Supabase `music_requests` table using `@supabase/supabase-js`
    - Display success confirmation on success
    - Display error message on failure, preserve form data
    - Disable submit button + show loading indicator during submission
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [x] 10.2 Create Supabase migration for music_requests table
    - Create SQL migration: `music_requests` table with id (UUID), guest_name (VARCHAR 100), song_artist (VARCHAR 200), created_at (TIMESTAMPTZ)
    - Add RLS policies: anonymous inserts allowed, authenticated reads only
    - _Requirements: 11.5_

  - [ ]* 10.3 Write unit tests for MusicRequest form submission
    - Test success path with mocked Supabase client
    - Test error path (network failure) with error message display
    - Test loading state (button disabled during submission)
    - _Requirements: 11.5, 11.6, 11.7_

- [x] 11. New section — SolidarityWedding ("Casamento Solidário")
  - [x] 11.1 Create SolidarityWedding section component
    - Create `basics/src/sections/SolidarityWedding.astro`
    - Title: "Este é um casamento solidário!"
    - Add explanatory paragraph about donating to charities instead of traditional favors
    - Display 4 charity links (Nariz Vermelho, Acreditar, Make-A-Wish, UNICEF) opening in new tabs
    - Show charity logos at max-height 48px with preserved aspect ratio
    - Add accessible alt text for each logo with charity name
    - Create `public/images/charities/` directory for logo assets
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 12. New page — WeddingDay (dia.astro)
  - [x] 12.1 Create WeddingDay page
    - Create `basics/src/pages/dia.astro`
    - Include sections in order: table seating arrangement (with link to interactive table finder), menu by course, live gallery link (to real-time photo upload page), memories section with message inviting guests to share photos
    - Use the site's existing Layout component and design system
    - Page is publicly accessible at all times (direct URL access always works)
    - _Requirements: 6.3_

- [x] 13. Wire new sections into main page
  - [x] 13.1 Add MusicRequest and SolidarityWedding sections to index.astro
    - Import and place MusicRequest section after Gallery in `basics/src/pages/index.astro`
    - Import and place SolidarityWedding section after GiftList
    - Verify section order matches architecture diagram: Hero → Countdown → Ceremony → Timeline → LoveStory → Gallery → MusicRequest → GiftList → SolidarityWedding → Location → Faq → RSVP → Contact
    - _Requirements: 11.1, 15.1_

- [x] 14. Final checkpoint — All features integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 8 universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Vitest + fast-check for property-based testing (already in devDependencies)
- Static assets (charity logos, wax seal) need to be placed manually in `public/images/`
- Supabase migration should be run against the project's Supabase instance before testing MusicRequest

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "1.4", "1.5", "4.1"] },
    { "id": 2, "tasks": ["2.1", "5.1", "6.1", "6.2", "6.3"] },
    { "id": 3, "tasks": ["2.2", "5.2", "7.1"] },
    { "id": 4, "tasks": ["2.3", "5.3", "7.2"] },
    { "id": 5, "tasks": ["7.3", "9.1", "10.1", "10.2"] },
    { "id": 6, "tasks": ["9.2", "10.3", "11.1", "12.1"] },
    { "id": 7, "tasks": ["13.1"] }
  ]
}
```
