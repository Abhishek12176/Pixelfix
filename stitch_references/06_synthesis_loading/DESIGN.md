---
name: Obsidian Precision
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#938ea1'
  outline-variant: '#484555'
  surface-tint: '#cabeff'
  primary: '#cabeff'
  on-primary: '#32009a'
  primary-container: '#947dff'
  on-primary-container: '#2b0088'
  inverse-primary: '#613de0'
  secondary: '#42efb2'
  on-secondary: '#003826'
  secondary-container: '#00d298'
  on-secondary-container: '#00543b'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#f751a1'
  on-tertiary-container: '#570032'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4918c8'
  secondary-fixed: '#56fdc0'
  secondary-fixed-dim: '#2ae0a5'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#005139'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 44px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.035em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1rem
  margin-lg: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system establishes a high-performance, studio-grade creative environment for generative image editing, inpainting, and object removal. It rejects whimsical generative AI tropes—such as iridescent rainbows, sparkle icons, and hyperactive cosmic gradients—in favor of quiet, razor-sharp utility inspired by specialized darkroom hardware and elite developer environments.

The visual style blends **Technical Minimalism** with **Tactile Precision**:
- Surfaces are deep, light-absorbent charcoals that preserve the user's color perception and prioritize canvas fidelity.
- Interactive controls invoke optical calibration tools: ultra-fine 1px structural dividers, surgical typography, calibrated micro-interactions, and a restrained electric violet signal color.
- Tone is utilitarian, confident, and unobtrusive. The interface recedes entirely, allowing user assets and inpainting masks to command full visual dominance.

## Colors

The palette is engineered specifically for prolonged, precision-focused screen work. Light is treated as a premium commodity against layered black and charcoal substrates.

### Color Roles & Meaning
- **Primary (`#7C5CFC` - Electric Violet):** Reserved exclusively for active canvas operations, primary commitments (e.g., "Run Inpainting", "Export High-Res"), brush selection states, and keyboard shortcut indicators. In interactive states, it emits a controlled, low-diffusion ambient violet aura.
- **Secondary (`#38E8AC` - Precision Mint):** Denotes non-destructive system feedback: completed neural generation passes, pristine fidelity checks, and latency/GPU hardware metrics.
- **Tertiary (`#EC4899` - Negative Mask Magenta):** Used specifically for object removal brush overlays, deletion boundaries, and destructive action states to provide absolute contrast against both light and dark imagery.
- **Neutral Core (`#0A0A0B` to `#242429`):**
  - Canvas / Foundation: `#0A0A0B` (pure dark base)
  - Surface Panel Default: `#141416` (docked sidebars, canvas frames)
  - Elevated Popover / Context Menu: `#1C1C1F`
  - Input & Recessed Well: `#111113`
  - Structural Borders: `rgba(255, 255, 255, 0.07)` (hairline structural division)
  - Active / Hover Borders: `rgba(255, 255, 255, 0.16)`
- **Text & Foreground Hierarchy:**
  - High Contrast (Headings, Active Values): `#F4F4F6`
  - Mid Contrast (Labels, Secondary Actions): `#9E9EA8`
  - Low Contrast (Inactive Hotkeys, Meta Units): `#5C5C66`

## Typography

The type system pairs modern, neo-grotesque display cuts with monospace engineering values.
- **Geist** serves as the primary typeface for all structural navigation, tool options, and display copy. Headings use negative letter spacing (`-0.02em` to `-0.035em`) to evoke density and confidence.
- **JetBrains Mono** delivers precise readouts for all numeric coordinates, pixel brushes, aspect ratios, processing times, and keyboard command tags. It enforces strict column alignment in tabular data panels and inspection rails.
- Font sizes default to an ergonomic desktop scale with a baseline body size of 13px, maximizing available canvas viewport real estate while maintaining legibility.

## Layout & Spacing

The layout is built on a 3-zone cockpit framework configured strictly across an 8px base rhythm (with 4px micro-steps):

1. **Top Navigation Ribbon (Height: 48px):** Global project state, undo/redo stack, compute performance indicator, and primary export triggers. Fixed height, no vertical flex.
2. **Infinite Canvas Viewport (Center flex):** Responsive, hardware-accelerated workspace surrounded by structural margin spacers. Contains floating context docks anchored 16px above the bottom viewport edge.
3. **Inspector & Tool Parameters Rail (Width: 320px fixed on desktop):** Right-anchored operational deck housing tool-specific settings (brush size, feathering, strength, denoise thresholds).

### Breakpoints & Adaptations
- **Desktop (>= 1280px):** Full studio layout. Fixed 320px right inspector, floating horizontal canvas dock, 16px page margins.
- **Tablet (768px - 1279px):** Inspector collapses into a slide-over panel triggered via shortcut or top bar icon. Canvas claims full remaining width. Floating toolbar contracts to icon-only variants.
- **Mobile (< 768px):** Inspector transforms into an interactive bottom drawer sheet with discrete snap points (collapsed, half-height, full preview). Top bar condenses to status icons and export trigger.

## Elevation & Depth

Visual separation relies on luminance shifts and hairline boundaries rather than dramatic drop shadows.

- **Level 0 (Canvas Base):** `#0A0A0B`. Recessed background layer containing the raw asset stage.
- **Level 1 (Side Panels & Rails):** `#141416`, bordered by a crisp `1px solid rgba(255, 255, 255, 0.07)`. No drop shadows; spatial separation is achieved exclusively by edge contrast.
- **Level 2 (Floating Action Docks & Toolbars):** `#1C1C1F` layered over canvas elements with `backdrop-filter: blur(16px)` and an internal top-edge highlight (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`). Drop shadow: `0 8px 32px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.4)`.
- **Level 3 (Context Menus, Modals & Dropdowns):** `#202024` with `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)`.
- **Active Glow Elevation:** Elements carrying the primary accent (`#7C5CFC`) utilize a focused peripheral luminance: `0 0 0 1px #7C5CFC, 0 0 16px rgba(124, 92, 252, 0.25)`.

## Shapes

The geometric framework favors compact, structured profiles:
- Base controls (inputs, segmented switches, standard buttons) use **Soft roundedness** (4px / `0.25rem`) to maintain architectural discipline.
- Floating toolbars, surface cards, and inspector modules use `8px` (`0.5rem`).
- Modals, large drop zones, and preview lightboxes use `12px` (`0.75rem`).
- Floating tool selection chips, canvas magnification pills, and badge indicators use fully rounded caps (pill shape) to distinguish runtime state from static panels.

## Components

### Buttons
- **Primary Action:** Solid `#7C5CFC` fill, `#FFFFFF` text, 4px border radius. Hover: `#6B4BE8` with a subtle `0 0 12px rgba(124, 92, 252, 0.35)` glow. Active: scale 0.98.
- **Secondary (Default):** `#18181B` surface, `1px solid rgba(255, 255, 255, 0.08)`, `#E4E4E7` text. Hover: `#222226`, border shifts to `rgba(255, 255, 255, 0.16)`.
- **Ghost / Tool Icon:** Transparent background, `#9E9EA8` icon color. Hover: `#1C1C1F`, `#FFFFFF` icon. Active/Selected tool: `#232328`, `#7C5CFC` icon with a persistent 1px border.

### Precision Sliders (Brush Size, Feather, Opacity)
- **Track:** 4px height, `#232326` background, 2px corner radius.
- **Fill:** Solid `#7C5CFC` active track.
- **Thumb:** 14px circle, `#FFFFFF` surface, `0 1px 3px rgba(0, 0, 0, 0.6)`. Active drag: 16px, surrounded by a faint violet focus ring. Value readouts sit adjacent in JetBrains Mono.

### Input Fields & Numeric Steppers
- Background: `#111113`, `1px solid rgba(255, 255, 255, 0.08)`, 4px radius.
- Focus: `1px solid #7C5CFC`, `0 0 0 1px #7C5CFC`. Text is `#F4F4F6`. Includes inline keyboard shortcut badges (e.g., `⌘K`) aligned right in low-contrast typography.

### Floating Canvas Toolbar (Dock)
- Anchored bottom-center of the canvas. Height: 44px. Background: `#141416/90` with `backdrop-filter: blur(12px)`.
- Border: `1px solid rgba(255, 255, 255, 0.08)`. Features segmented icon clusters (Lasso, Brush, Eraser, Zoom) separated by 16px vertical hairline dividers.

### Chips & Keyboard Hints
- Compact badges with 2px radius or pill forms. Background: `#1C1C1F`, text `#9E9EA8`, border: `1px solid rgba(255, 255, 255, 0.06)`. Monospace character sizing.

### Checkboxes & Segmented Toggles
- **Segmented Control:** Inset tray `#0E0E10` with 4px inner sliding pill (`#232328`).
- **Checkbox:** 14x14px box, `#141416` surface, `1px solid rgba(255, 255, 255, 0.12)`. Checked state: `#7C5CFC` background with a crisp white check vector.

### Inpainting Canvas Overlay Card
- Non-modal status overlay floating in the top-right viewport corner during generation passes. Contains elapsed GPU compute time (ms), animated mint pulse dot (`#38E8AC`), and an inline "Cancel" ghost trigger.