---
name: Debaprashad Bhowmik Portfolio
description: Ivory editorial typography with inspectable engineering artifacts and blue interaction accents.
colors:
  ivory: "#f7f2ea"
  ivory-deep: "#eee6da"
  paper: "#fffaf2"
  ink: "#171c1f"
  muted: "#657078"
  line: "rgba(23, 28, 31, 0.13)"
  line-strong: "rgba(23, 28, 31, 0.25)"
  blue: "#4b7cff"
  cyan: "#75d9ff"
  charcoal: "#101820"
  charcoal-2: "#17222b"
  green: "#39c58a"
  amber: "#f4b85d"
  coral: "#f07a6a"
  violet: "#8d62ff"
  architecture-blue: "#3768df"
  architecture-link: "#285bc6"
  architecture-copy: "#505c64"
  architecture-light-ink: "#eef3f6"
  architecture-light-muted: "#b6c6d4"
  architecture-inspector: "#eee8de"
  architecture-module: "#1b2935"
  architecture-selected: "#223c57"
  architecture-selected-border: "#92b6ff"
  galaxy-instrument: "#030711"
  galaxy-panel: "#f4ecde"
  galaxy-orange: "#ff8838"
  galaxy-pink: "#ff75bd"
  galaxy-lime: "#d9f45b"
  galaxy-teal: "#38ded0"
  galaxy-muted: "#9db2c6"
  galaxy-ink: "#dbe9f2"
  galaxy-focus: "#70e2ff"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "78px"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "0"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "62px"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "0"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "18px"
    lineHeight: 1.65
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 760
    lineHeight: 1.5
    letterSpacing: "0.28em"
  project-number:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
    fontSize: "12px"
    fontWeight: 760
  architecture-headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(38px, 4.3vw, 67px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-.025em"
  architecture-title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-.025em"
  architecture-body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  galaxy-title:
    fontFamily: "Oxanium, sans-serif"
    fontSize: "clamp(13px, 1.3vw, 19px)"
    fontWeight: 700
    letterSpacing: ".03em"
  galaxy-replay:
    fontFamily: "Oxanium, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  galaxy-annotation:
    fontFamily: "Oxanium, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  control: "7px"
  card: "8px"
  architecture-panel: "12px"
  architecture-module: "6px"
  architecture-tab: "5px"
  pill: "999px"
  galaxy-panel: "4px"
  galaxy-control: "3px"
spacing:
  control-gap: "10px"
  compact: "12px"
  card-inset: "18px"
  control-inset: "20px"
  section-gap: "24px"
  panel-inset: "32px"
  wide-gap: "48px"
  section-inset: "64px"
components:
  button-primary:
    textColor: "#f7fbff"
    rounded: "{rounded.control}"
    padding: "0 20px"
  button-ghost:
    backgroundColor: "rgba(255, 250, 242, 0.46)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
  project-card:
    backgroundColor: "rgba(255, 250, 242, 0.96)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  architecture-tab:
    textColor: "{colors.architecture-copy}"
    rounded: "{rounded.architecture-tab}"
    padding: "11px 18px"
  architecture-tab-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.architecture-link}"
    rounded: "{rounded.architecture-tab}"
    padding: "11px 18px"
  architecture-module:
    backgroundColor: "{colors.architecture-module}"
    textColor: "#d6e2ed"
    rounded: "{rounded.architecture-module}"
    padding: "12px"
  architecture-module-selected:
    backgroundColor: "{colors.architecture-selected}"
    textColor: "#fff"
    rounded: "{rounded.architecture-module}"
    padding: "12px"
  architecture-inspector:
    backgroundColor: "{colors.architecture-inspector}"
    padding: "32px"
  galaxy-instrument:
    backgroundColor: "{colors.galaxy-instrument}"
    textColor: "{colors.galaxy-ink}"
    rounded: "{rounded.control}"
  galaxy-panel:
    backgroundColor: "{colors.galaxy-panel}"
    textColor: "#20201d"
    rounded: "{rounded.galaxy-panel}"
    padding: "11px 12px"
  galaxy-view-selected:
    backgroundColor: "{colors.galaxy-orange}"
    textColor: "#18100a"
    rounded: "{rounded.galaxy-control}"
    padding: "6px 11px"
---

# Design System: Debaprashad Bhowmik Portfolio

## Overview

**Creative North Star: "Preserve the deployed portfolio identity"**

The portfolio pairs warm ivory space and Georgia headlines with compact, inspectable engineering interfaces. Inter carries explanations and controls; blue identifies interactions, while charcoal supports technical artifacts. The atmosphere is editorial and inviting, with more density inside demonstrations than around their introductions.

This is a scan of the incumbent implementation, extended by the approved Adaptive Cognitive Architecture surface. Its vibrant cinematic voxel artwork and luminous blue introduction frame a dense futuristic cognitive observatory. The user explicitly approved the galactic dashboard aesthetic and asked to preserve it while making its network dots, paths and controls functional. Oxanium, a dark instrument, cream telemetry-style panels and orange/pink/lime/teal accents are scoped to that observatory. Existing portfolio typography, neutral canvas, projects, interaction coaching, loading behavior and optimized assets remain part of the deployed experience.

**Key Characteristics:**

- Warm editorial framing around concrete engineering artifacts.
- Serif headlines and compact sans-serif controls.
- Blue interaction accents and dark technical surfaces.
- Visible evidence boundaries and accessible manual exploration.

Source authority: [PRODUCT.md](PRODUCT.md), [root tokens](src/index.css), [incumbent styles](src/App.css), [architecture styles](src/components/BrainArchitectureSection.css), [architecture behavior](src/components/BrainArchitectureSection.tsx), [observatory styles](src/components/GalacticExplorer.css), [observatory controls](src/components/GalacticExplorer.tsx) and [Three.js scene](src/components/GalaxyScene.tsx). The former compact SVG explanation is removed. Existing `galactic-` captures document desktop, tablet, mobile and path states; validation and review status are recorded in the surface brief. This document does not redefine production CSS.

## Colors

Warm neutrals carry the editorial frame; saturated accents identify action, engineering states and project-specific content.

### Primary

- **Interaction Blue** (`blue`): links, focus and selection feedback, technical accents.
- **Architecture Blue** (`architecture-blue`) and **Architecture Link Blue** (`architecture-link`): the new surface's italic emphasis, links and active controls. These are scoped literals, not replacements for the root accent.
- **Galaxy Orange**: selected view controls and instrument identity inside the observatory.

### Secondary

- **Cyan** (`cyan`): technical highlights and prospective branch emphasis.
- **Green, Amber, Coral and Violet**: incumbent project and status accents. Preserve their existing semantic context; do not assign them new universal meanings.
- **Galaxy Pink, Lime and Teal**: canonical node kinds and branch/callout roles within the observatory. Preserve the source kind-to-color mapping rather than interpreting these as measured performance states.

### Neutral

- **Ivory, Deep Ivory and Paper**: canvas, warmer recessed areas and pale controls.
- **Ink and Muted**: primary and secondary copy on light backgrounds.
- **Line and Strong Line**: low-contrast dividers and stronger boundaries.
- **Charcoal and Secondary Charcoal**: technical panels.
- **Architecture Light Ink / Light Muted**: legible dark-panel copy.
- **Architecture Inspector**: warm explanatory companion to the dark diagram.
- **Architecture Module / Selected / Selected Border**: dark module surfaces with an explicit selected edge.
- **Galaxy Instrument / Panel / Ink / Muted / Focus**: near-black canvas, cream dashboard cards, light instrument copy, secondary labels and cyan keyboard focus. These values stay local to the observatory.

**The Scoped Accent Rule.** Preserve root color names and incumbent project accents. Architecture literals apply within the architecture surface; they do not establish a new site-wide palette.

## Typography

**Display Font:** Georgia with Times New Roman and serif fallback.

**Body Font:** Inter with the platform sans-serif stack.

**Label/Mono Font:** SFMono-Regular, Consolas and Liberation Mono for project numbers and technical identifiers.

**Observatory Font:** self-hosted Oxanium Medium (500) and Bold (700), loaded with `font-display: swap` from `/motion-fonts/oxanium-medium.ttf` and `/motion-fonts/oxanium-bold.ttf`. It carries instrument identity, inspector/path headings and replay narration. The dense instrument body and controls retain the incumbent monospace stack. Georgia continues to frame the case study outside the instrument.

Serif headlines provide the editorial voice, including italic blue emphasis where implemented. Sans-serif prose and controls keep dense technical content readable. The frontmatter records observed role values; it is not a mathematically uniform type scale.

### Hierarchy

- **Display:** desktop hero heading; responsive overrides are in `src/App.css`.
- **Headline:** incumbent case-study intro heading; some individual project introductions override it.
- **Body:** incumbent introduction prose. Architecture introduction prose uses its smaller scoped body role and a maximum width of (65ch).
- **Label:** uppercase incumbent eyebrows with tracked letters. Architecture evidence labels instead use (10px), weight (700), tracking (.1em).
- **Architecture headline / title:** responsive introduction and detailed explorer/walkthrough section headings. The warm detailed inspector uses (34px) on desktop and (30px) at the stacking breakpoint. The observatory's separate inspector uses Oxanium (20px), weight (700), line-height (1.3).
- **Galaxy title / replay / annotation:** instrument identity, medium-weight replay narration and bold route annotation. Frontmatter captures actual scoped roles rather than replacing site headings.

**The Editorial Heading Rule.** Keep Georgia for narrative headings. Technical labels and interactive module copy retain the sans-serif hierarchy rather than adopting oversized display type.

## Layout

The incumbent hero, case sections and selected work share a centered maximum width of (1500px), generally `calc(100vw - 64px)`. Desktop case sections use (92px 64px) padding. The fixed header establishes a case-section scroll offset of (96px). The selected work rail scrolls horizontally with proximity snapping and an expanding active card.

Architecture uses a two-column introduction (1fr / 1.05fr), a four-column proof row and a two-part explorer: dark diagram (1.5fr) beside an inspector with a minimum width of (270px). Its section padding is (84px 64px 92px), then (64px 36px) below (1100px). Below (820px), intro, rationale, evidence and explorer stack; proof becomes two columns and walkthrough becomes three columns. Below (480px), section padding is (48px 20px), tabs share the available width, and diagram padding becomes (18px 14px). Diagram and inspector remain in reading order.

The observatory extends its desktop container by (72px) with horizontal margins of (-36px). Its near-black viewport uses `clamp(480px, 43vw, 610px)` height. The cream dashboard has five columns; below (900px) the observatory returns to full container width, the viewport becomes (570px) high and panels use three columns. Below (580px), the viewport is (520px) high, dashboard panels use two columns and controls wrap. Twelve replay selectors become six columns at tablet size and four at mobile size. The detailed three-tab explorer and six-step technical walkthrough remain inside a native disclosure, initially collapsed.

Hover annotations sit beside the canvas route; clicking pins them. On mobile, a selected component inspector suppresses the overlapping pinned annotation and exposes its full route through a native details disclosure. Camera interaction never replaces searchable components and keyboard-operable connection lists.

Keep the image/video frame at (16:9). The cover uses the existing rail behavior, with an image-led expanded treatment above (820px). The introduction wash and cover overlay are surface treatments, not a new global grid. See the [architecture surface brief](.impeccable/surfaces/adaptive-cognitive-architecture.md).

Existing CSS contains accumulated per-surface overrides and several additional breakpoints. Read the relevant final cascade before extending another project; this document does not flatten them into a new scale.

## Elevation & Depth

The system combines pale tonal layering, translucent controls, soft ambient shadows and darker artifact surfaces. Root `shadow-soft` supports broad elevation and `shadow-tight` supports interaction lift. The incumbent primary button has its own darker shadow and charcoal gradient. The architecture explorer primarily uses tonal contrast and borders; its selected tabs have a small shadow.

Exact shadow, transition, focus and breakpoint values live in `.impeccable/design.json`, because those properties are outside the frontmatter component schema. Its generated tonal ramps are swatch-preview metadata, not an additional production palette; the extracted CSS values remain authoritative. Global reduced-motion CSS suppresses animation and transition durations; the architecture section additionally removes them. Manual tab and walkthrough changes do not depend on autoplay.

The lazy Three.js scene keeps canonical components and curved source connections on a shared plane with a central black-hole visual metaphor. The whole network rotates slowly clockwise at (-0.009rad/s). Network signal dots belong to documented edges and illustrate their direction; they represent neither additional agents nor measured traffic. GPU shaders update motion through time uniforms, with (23,000) base samples on desktop or (6,500) in low/mobile mode, plus three samples per selectable source edge. Pixel ratio and density adapt to size/performance. Pause, offscreen/hidden suspension and reduced-motion still mode preserve usable inspection and camera controls.

The twelve-stage blocked-route replay advances every (5s) only when playback is requested; its final stage follows receipts into learning attribution and independent validation. This is illustrative design motion, not observed execution. Hovering a real node or connection highlights one directed upstream-to-target-to-downstream canonical route and annotates its handoffs, cutting feedback cycles. It does not assert a unique complete route. Click-to-pin and keyboard focus provide stable inspection. The instrument uses local ambient shadows and colored edges; cream panel depth comes from fine borders and a faint grid texture.

## Shapes

Controls use gently curved corners; project cards are slightly broader, and architecture media and paired panels broader again. Pills retain fully rounded ends. Fine borders separate content without enclosing every prose block. The explorer joins diagram and inspector along a straight seam on desktop, then moves the shared seam horizontally when stacked.

Use the observed radius roles in frontmatter. They describe existing component decisions rather than a compulsory radius scale for every incumbent project.

The galactic instrument uses a restrained (7px) outer corner, cream panels (4px) and compact controls/annotations (3px). Preserve this dense instrument form within the approved observatory.

## Components

### Buttons

Primary actions are charcoal gradient controls with pale text, a minimum height of (48px), weight (700), and horizontal padding from `button-primary`. Ghost actions retain a translucent paper fill. Incumbent hover lifts by (-2px), highlights the edge and uses the tight shadow. Keyboard focus uses a blue (3px) outline with (3px) offset. Preserve native link/button semantics.

### Chips

Work-card tags are contextual descriptors with pill corners, (7px 9px) padding and (11px) type. Their color, border and fill derive from the card variant. They are not interactive filters.

### Cards / Containers

The incumbent project rail uses an image region above the body, an (8px) radius and animated expansion. Existing cards retain their accent, detail and evidence behavior. Adaptive Cognitive Architecture is project (01) and initially selected; its desktop active card fills with concept art behind a left-to-right dark overlay, keeps copy to roughly half the width and uses a pale blue CTA. Its details list stays hidden in this scoped treatment.

### Inputs / Fields

The incumbent demonstrations use native range inputs at full width with the root blue accent; focused inputs share the global outline treatment. Observatory component search adds a local dark text field with a fine border, (3px) corners, (11px) padding and monospace (13px) type. Instrument input/button/select focus uses a cyan (3px) outline with (3px) offset. These scoped styles do not establish a replacement site-wide field pattern.

### Navigation

The fixed translucent ivory header uses a three-column desktop layout, Georgia brand lettering and compact sans-serif links. Link hover and keyboard focus reveal a thin underline over (180ms). Responsive navigation and existing coaching controls follow the deployed implementation.

### Architecture Explorer

The public introduction describes a **judgment layer** that selects supplied actions while code owns state, orchestration, memory, learning and controlled execution. Exact canonical labels are retained within the observatory, where Jev is explicitly explained as the TypeScript judgment component.

The initially collapsed native details disclosure contains three keyboard-operable tabs: Cognition, Runtime and Learning. Arrow keys wrap, Home/End move to the first/last tab, and tab selection resets module and walkthrough state. Module buttons expose pressed state and point to a polite live inspector. The inspector begins with the selected module heading, followed by its description, Receives/Produces and a design boundary; it has no redundant eyebrow above the heading.

The six-step walkthrough is manually controlled, selects the relevant module and distinguishes explanation from an experiment. Previous/next controls expose disabled endpoints. The media placeholder labels the voxel artwork as conceptual and footage as pending; optional video, poster and captions are configured through the data module, with video and poster failure fallbacks.

### Galactic Cognitive Observatory

Five view filters expose Galaxy, Cognitive, Runtime, Learning and Decision replay. Canonical labels, types, grouping and directed/conditional/bidirectional relationships are curated from v1.10 sources. The graph contains (455) diagram instances including three title annotations, with (452) selectable components. Source diagrams have (985) relationships including three title-annotation edges; the curated graph and selectable network retain (982) connections without title endpoints. Counts describe diagram structure rather than deployed components.

Real node and connection hover uses ray picking. Adjacent path annotations identify the target, each relation and the cycle-cut boundary. Click pins a route for step-by-step inspection; keyboard focus on callouts and connection lists exposes equivalent route information. Search, orbit/pan/zoom/reset, component focus, fullscreen and adaptive/low density controls remain available; a renderer fallback preserves textual inspection. The command route explicitly retains `CTRL → CENV → QUEUE → CADMIT → AUTH`.

The twelve-stage illustrative replay supports previous/next, direct stage selection and requested playback. A local JSON import accepts schema version (1), file-provided `observed` provenance, (1–10,000) events, known selectable components, unique event IDs, valid timestamps and readable detail, with a (5MB) file cap. Imported provenance is labelled as supplied by the file; it is not an authenticated live feed or proof of architecture behavior. Structural checks, specified scenarios and pending runtime evaluation remain visible in the dashboard.

## Do's and Don'ts

### Do:

- **Do** preserve the deployed ivory canvas, Georgia headlines, Inter body stack and charcoal technical surfaces.
- **Do** keep new color and composition decisions scoped to the architecture surface.
- **Do** preserve visible keyboard focus, manual exploration and reduced-motion behavior.
- **Do** label conceptual artwork and distinguish completed static design from pending runtime evaluation.

### Don't:

- **Don't** turn the architecture's inviting voxel artwork into a replacement visual identity for existing projects.
- **Don't** publish private workspace links or present mockup benchmarks as measured results.
- **Don't** expose unexplained internal names or claim demonstrated execution, learning or general intelligence from static verification.
- **Don't** repair unrelated incumbent visual differences by imposing a newly invented spacing, radius or type scale.

## Architecture explanation and project framing

The project introduction defines an AI agent before introducing its memory, prediction and judgment architecture. A charcoal four-column Role / Tools / Built Artifact / Outcome summary uses the existing `project-proof-bar` structure, scoped to the observatory palette. A visible three-part map guide explains the black-hole visual symbol, source component connections and illustrative signal motion before the console. After the interactive artifact, the existing Problem / Idea / How It Solves It pattern frames the purpose on ivory. These sections reflow for phones and preserve the galaxy renderer and controls.

Card behavior restored: no card is selected initially; the first project uses the shared expanded width and inactive-card opacity. Pointer hover, keyboard/click selection and Escape remain supported. The first project retains its artwork and expanded image treatment.
