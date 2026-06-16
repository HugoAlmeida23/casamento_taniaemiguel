# Requirements Document

## Introduction

Este documento define os requisitos para uma série de melhorias ao site de casamento de Tânia & Miguel. As alterações abrangem correções de UX no ecrã introdutório/quiz, consistência tipográfica, reestruturação de secções existentes, criação de novas secções (Notas e Melodias, Casamento Solidário), actualização do formulário RSVP com acompanhantes, e correcção de dados incorrectos (data no footer).

## Glossary

- **Site**: O website de casamento Astro em `basics/`
- **IntroScreen**: Componente de ecrã inicial com envelope animado que precede o quiz
- **QuizGate**: Componente de quiz que bloqueia acesso ao conteúdo principal até resposta correcta
- **Countdown_Section**: Secção de contagem decrescente para o dia do casamento
- **Timeline_Section**: Secção "Programa do dia" com a timeline de eventos
- **LoveStory_Section**: Secção "A nossa jornada" / "A Nossa História"
- **Gallery_Section**: Secção de galeria de fotos do casal
- **RSVP_Section**: Secção de confirmação de presença com formulário
- **GiftList_Section**: Secção de ofertas/mimos com dados de pagamento
- **FAQ_Section**: Secção de perguntas frequentes
- **MusicRequest_Section**: Nova secção para pedidos de música ao DJ
- **SolidarityWedding_Section**: Nova secção sobre casamento solidário com donativos a instituições
- **Footer**: Componente de rodapé do site
- **WeddingDay_Page**: Página secundária com detalhes do dia (mesas, menu, galeria ao vivo, recordações)
- **Companion_Form**: Sub-formulário para adicionar acompanhantes no RSVP

## Requirements

### Requirement 1: Quiz Gate — Transição com Foto após Resposta Correcta

**User Story:** As a wedding guest, I want to see the "19_WTF" photo after answering correctly, so that I have a fun interactive moment before entering the site.

#### Acceptance Criteria

1. WHEN the guest selects the correct answer, THE QuizGate SHALL display a "Correto!" feedback message, then within 800 milliseconds transition to a full-viewport overlay showing the "WTF?!" text followed by the "19_WTF" photo, with the text animating in first and the photo animating in within 300 milliseconds after the text
2. WHILE the "19_WTF" photo overlay is displayed, THE QuizGate SHALL require the guest to tap or click on the overlay to advance to the main content, and SHALL NOT auto-advance without user interaction
3. WHEN the guest taps or clicks on the "19_WTF" photo overlay, THE QuizGate SHALL fade out the overlay within 800 milliseconds and reveal the main content with scroll re-enabled
4. WHEN the guest selects a wrong answer, THE QuizGate SHALL apply a shake animation to the selected option, display an error feedback message for 1500 milliseconds, and allow the guest to select another option without limit on retry attempts
5. WHEN the guest has previously passed the quiz (persisted in localStorage), THE QuizGate SHALL skip the quiz and photo overlay entirely and display the main content directly

### Requirement 2: Quiz Gate — Link Alternativo sem Pergunta

**User Story:** As a shy guest or someone less familiar with the couple, I want a way to skip the quiz, so that I can access the site without embarrassment.

#### Acceptance Criteria

1. THE QuizGate SHALL display a skip link within the quiz screen viewport, rendered below the answer options, with a minimum tap target of 44×44 CSS pixels and an accessible label describing its purpose
2. WHEN a guest activates the skip link, THE QuizGate SHALL dismiss the quiz overlay and reveal the main content within 1 second, bypassing the WTF reveal animation, unlocking page scroll, and removing all gate overlays from the viewport
3. WHEN a guest uses the skip link, THE Site SHALL persist the bypass state in client-side storage so that on subsequent visits the quiz gate and envelope intro are not displayed and the main content is shown immediately
4. IF client-side storage is unavailable or cleared, THEN THE Site SHALL display the quiz gate again on the next visit, allowing the guest to skip once more

### Requirement 3: IntroScreen/Hero — Texto sobre Ilustração

**User Story:** As a visitor, I want to see the text clearly on top of the illustration, so that I can read the content on both mobile and desktop.

#### Acceptance Criteria

1. THE HeroModern SHALL render all text content (couple names, welcome subtitle, date block, and tagline) positioned above the Plaza de España illustration using CSS z-index layering so that no text is hidden behind the image
2. THE HeroModern SHALL apply a contrast treatment to all overlay text (such as text-shadow or a semi-transparent backdrop) so that the text achieves a minimum contrast ratio of 4.5:1 against the underlying illustration on both mobile and desktop viewports
3. THE HeroModern SHALL use the following font assignments for overlay text: a cursive script font for the couple names, a serif font for the date numeral and tagline, and a sans-serif font for the welcome subtitle
4. WHILE the site is viewed on a viewport narrower than 768px, THE HeroModern SHALL render the couple names at a minimum computed font size of 48px and all other overlay text at a minimum computed font size of 16px to ensure readability on mobile devices
5. WHILE the site is viewed on a viewport of 768px or wider, THE HeroModern SHALL render the couple names at a minimum computed font size of 96px and all other overlay text at a minimum computed font size of 18px

### Requirement 4: Consistência Tipográfica Global

**User Story:** As a visitor, I want all sections to look visually consistent, so that the site feels polished and cohesive.

#### Acceptance Criteria

1. THE Site SHALL render all section titles (elements using the `section-title` class) with a computed font-family of 'Playfair Display', a computed color of gray-900 (#111827), and a computed font-size of 1.875rem (mobile) / 2.25rem (md) / 3rem (lg), with no inline style overrides, across every section
2. THE Site SHALL render all section subtitles (elements using the `section-subtitle` class) with a computed color of olive-500, uppercase text-transform, tracking of 0.25em, and font-weight medium, with no inline style overrides, across every section
3. THE Timeline_Section SHALL render the title "O que planeámos para vocês" using the `section-title` class without inline color overrides, so that its computed color matches all other section titles (gray-900 / #111827)
4. THE Timeline_Section SHALL render the subtitle "Programa do dia" using the `section-subtitle` class without inline color overrides, so that its computed color matches all other section subtitles (olive-500)

### Requirement 5: Countdown — Fundo com Textura e Logo TM

**User Story:** As a visitor, I want the countdown section to have a textured background and the couple's wax seal logo, so that it looks more refined.

#### Acceptance Criteria

1. THE Countdown_Section SHALL use the sand-texture.jpg image as the section background, covering the entire section area without visible tiling seams, instead of a flat color
2. THE Countdown_Section SHALL display the wax-seal-prata.png logo image centered in the ornament area, rendered at a width between 48px and 80px, in place of the current leaf ornament emoji
3. THE Countdown_Section SHALL render the TM wax seal logo using the same color value applied to the section's decorative horizontal lines (via CSS filter or equivalent color-matching technique), so that the logo and lines are visually uniform

### Requirement 6: Countdown — Mensagem do Dia do Casamento

**User Story:** As a guest visiting the site on the wedding day, I want to see a special message with a link to details, so that I can access all day-of information.

#### Acceptance Criteria

1. WHEN the client's local date is 28 de Maio de 2027 (from 00:00:00 to 23:59:59 in Europe/Lisbon timezone), THE Countdown_Section SHALL hide the countdown units (Dias, Horas, Minutos, Segundos) and display the text "HOJE É O GRANDE DIA" in place of the countdown timer
2. WHEN the wedding day message is displayed, THE Countdown_Section SHALL show a clickable text "Clica aqui para veres todos os detalhes!" that navigates to the WeddingDay_Page
3. THE WeddingDay_Page SHALL contain the following sections in order: table seating arrangement (linking to the interactive table finder), menu (the wedding menu by course), live gallery (linking to the real-time guest photo upload page), and a memories section displaying a message inviting guests to share photos as souvenirs
4. IF the current date is after 28 de Maio de 2027 (from 29 de Maio de 2027 onwards), THEN THE Countdown_Section SHALL continue to display the wedding day message and link to the WeddingDay_Page instead of the countdown timer

### Requirement 7: Secção "A Nossa História" — Renomeação

**User Story:** As a visitor, I want the section labels to be clear and distinct, so that I understand the section purpose immediately.

#### Acceptance Criteria

1. THE LoveStory_Section SHALL display the text "A Nossa História" as the section title within the section header area
2. THE LoveStory_Section SHALL display the text "Um pouco mais sobre nós" as the section subtitle, positioned directly above the section title within the section header area
3. WHEN the LoveStory_Section is rendered, THE section title and subtitle SHALL be visible without requiring scrolling within the section's header block

### Requirement 8: Secção Galeria — Reorganização

**User Story:** As a visitor, I want the gallery section to clearly show it contains the couple's own photos, so that I know what to expect.

#### Acceptance Criteria

1. THE Gallery_Section SHALL display "Galeria" as the section heading
2. THE Gallery_Section SHALL display "Memórias" as the section subtitle, positioned above the heading
3. THE Gallery_Section SHALL NOT display any interactive element (link, button, or call-to-action) or textual reference that mentions or navigates to a live gallery upload feature
4. THE Gallery_Section SHALL display at least 1 photo from the couple's pre-defined photo collection in a grid layout

### Requirement 9: RSVP — Reorganização de Título e Campos do Formulário

**User Story:** As a guest, I want to fill in a clear RSVP form with proper placeholders, so that I can confirm my attendance easily.

#### Acceptance Criteria

1. THE RSVP_Section SHALL display "Confirmações" as the section title
2. THE RSVP_Section SHALL display "Esperamos por vocês" as the section subtitle
3. THE RSVP_Section SHALL display a field with label "Nome" marked as required, with placeholder "Primeiro e último nome", accepting a maximum of 100 characters
4. THE RSVP_Section SHALL display a field with label "Telemóvel" marked as required, with placeholder "+351 912 345 678"
5. THE RSVP_Section SHALL display an optional field with label "Alergias/Restrições alimentares" with placeholder "Glúten, lactose, vegetariano, vegan, …"
6. IF the guest submits the form without filling in the "Nome" or "Telemóvel" fields, THEN THE RSVP_Section SHALL prevent submission and indicate which required fields are missing

### Requirement 10: RSVP — Acompanhantes com Distinção Adulto/Criança

**User Story:** As a guest bringing companions, I want to add adults and children separately with appropriate fields, so that the couple can plan accordingly.

#### Acceptance Criteria

1. THE Companion_Form SHALL allow adding adult companions with a name field using placeholder "Primeiro e último nome", up to a combined maximum of 10 companions (adults and children together)
2. THE Companion_Form SHALL allow adding child companions with a name field using placeholder "Primeiro e último nome" and a separate age field that accepts whole numbers from 0 to 17
3. THE Companion_Form SHALL allow indicating allergies/dietary restrictions for each companion via a text field with placeholder indicating the field is optional, limited to 200 characters
4. THE Companion_Form SHALL visually distinguish adult companion cards from child companion cards using a type badge label ("Adulto" or "Criança")
5. WHEN the guest activates the remove button on a companion card, THE Companion_Form SHALL remove that companion entry from the list with a fade-out animation lasting no more than 300ms
6. IF a companion card has an empty name field at form submission time, THEN THE Companion_Form SHALL exclude that companion from the submitted data without blocking submission

### Requirement 11: Nova Secção — "Notas e Melodias"

**User Story:** As a guest, I want to suggest a song for the wedding DJ, so that I can contribute to the party atmosphere.

#### Acceptance Criteria

1. THE MusicRequest_Section SHALL display "Notas e Melodias" as the section title
2. THE MusicRequest_Section SHALL display "Um Toque Especial" as the section subtitle
3. THE MusicRequest_Section SHALL display the descriptive text: "O nosso dia só fica completo com a tua música favorita. Partilha connosco aquele tema que te traz boas memórias ou que te faz saltar da cadeira e nós tratamos do resto com o DJ."
4. THE MusicRequest_Section SHALL display a form with a required text field "Nome do Convidado" (maximum 100 characters) and a required text field "Música e Artista" (maximum 200 characters)
5. WHEN a guest submits the music form with all required fields filled, THE MusicRequest_Section SHALL save the suggestion to the backend database and display a success confirmation message
6. IF the music form submission fails due to a network or server error, THEN THE MusicRequest_Section SHALL display an error message indicating the submission failed and preserve the entered data in the form fields
7. WHILE the music form submission is in progress, THE MusicRequest_Section SHALL disable the submit button and display a loading indicator to prevent duplicate submissions

### Requirement 12: Secção Ofertas — Reorganização e Novos Ícones

**User Story:** As a guest, I want clear information about how to contribute a gift, so that I understand the available options.

#### Acceptance Criteria

1. THE GiftList_Section SHALL display "Mimos e Ofertas" as the section title
2. THE GiftList_Section SHALL display "Um gesto carinhoso" as the section subtitle, positioned above the section title
3. THE GiftList_Section SHALL display the text: "A tua presença é o maior presente de todos. Se quiseres contribuir podes fazê-lo pessoalmente no dia ou através das seguintes formas:"
4. THE GiftList_Section SHALL display the MBWay payment option card with a phone icon (representing a mobile device) as the visual identifier, positioned above the payment option label
5. THE GiftList_Section SHALL display the bank transfer payment option card with a multibank/bank-card icon (representing a payment card) as the visual identifier, positioned above the payment option label
6. THE GiftList_Section SHALL display the MBWay and bank transfer payment options side by side in a 2-column grid layout on viewports wider than 640px, and stacked vertically on narrower viewports
7. IF the section contains payment contact details, THEN THE GiftList_Section SHALL display the relevant phone numbers under the MBWay option and the IBAN under the bank transfer option

### Requirement 13: Secção FAQ — Reorganização e Novo Conteúdo

**User Story:** As a guest, I want clear answers to common questions about the wedding, so that I can prepare accordingly.

#### Acceptance Criteria

1. THE FAQ_Section SHALL display "Perguntas frequentes" as the section title
2. THE FAQ_Section SHALL display "Para não ficar nenhuma dúvida" as the section subtitle
3. THE FAQ_Section SHALL display exactly 6 FAQ items as expandable accordion entries, rendered in the following fixed order:
   - "Até quando devo confirmar a presença?" with answer containing the date "30 de Março de 2027" as the confirmation deadline
   - "Tenho restrições alimentares, o que faço?" with answer instructing the guest to indicate restrictions in the RSVP form
   - "Posso levar acompanhante?" with answer confirming companions are allowed and instructing the guest to add them in the RSVP form
   - "Posso tirar fotos na cerimónia?" with answer stating that phones are not permitted during the ceremony and informing guests of a dedicated photo upload page for reception photos
   - "Existe algum Dress Code?" with answer stating that attire should be elegant and comfortable, and that white clothing is not allowed
   - "Há estacionamento no local?" with answer confirming free private parking available at Quinta da Lage
4. WHEN a guest clicks or activates an FAQ item, THE FAQ_Section SHALL expand that item's answer and collapse any previously expanded item, so that at most one answer is visible at a time
5. THE FAQ_Section SHALL render all FAQ items in collapsed state on initial page load
6. THE FAQ_Section SHALL set the `aria-expanded` attribute to "true" on the expanded item's trigger button and "false" on all other trigger buttons

### Requirement 14: Footer — Correcção da Data

**User Story:** As a visitor, I want to see the correct wedding date in the footer, so that I am not confused about the actual date.

#### Acceptance Criteria

1. THE Footer SHALL display the wedding date as the exact text "28 de Maio de 2027"
2. THE Site SHALL display the wedding date "28 de Maio de 2027" in the HTML meta description and the Open Graph (og:description) metadata elements
3. IF any page or component contains the previous incorrect date "20 de Junho de 2027", THEN THE Site SHALL replace it with "28 de Maio de 2027"

### Requirement 15: Nova Secção — "Casamento Solidário"

**User Story:** As a guest, I want to know that this is a solidarity wedding with charitable donations, so that I understand the couple's values and can contribute if desired.

#### Acceptance Criteria

1. THE SolidarityWedding_Section SHALL display "Este é um casamento solidário!" as the section title
2. THE SolidarityWedding_Section SHALL display a text paragraph explaining that the couple chose to donate to charities instead of offering traditional wedding favors
3. THE SolidarityWedding_Section SHALL display one link per charity (Nariz Vermelho, Acreditar, Make-A-Wish, UNICEF) that opens the respective charity's external website in a new browser tab
4. THE SolidarityWedding_Section SHALL display the logo of each charity adjacent to its respective link, rendered at a maximum height of 48px while preserving aspect ratio
5. THE SolidarityWedding_Section SHALL provide an accessible name for each charity logo via alt text containing the charity's name
