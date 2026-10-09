---
name: Modern Public Healthcare System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#005683'
  on-tertiary: '#ffffff'
  tertiary-container: '#006fa8'
  on-tertiary-container: '#dbecff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system delivers an institutional, modern, and trustworthy interface for public health appointments and hospital operations. Its primary users encompass diverse citizens seeking critical care, medical professionals managing high-stress shifts, and administrative triage coordinators.

The aesthetic fuses **Corporate/Modern** precision with an empathetic, clinical clarity:
- **Calm Authority:** Subdued clinical slates and authoritative oceanic blues mitigate user anxiety.
- **Immediate Triage Legibility:** Universal standard triage levels are recognized instantly through high-visibility semantic tokens.
- **Radical Inclusivity:** High-contrast text hierarchies, generous touch targets, and strict AA/AAA accessibility compliance ensure usability across all ages, visual acuities, and digital literacy tiers.

## Colors

The palette organizes clinical operations by clear hierarchy, avoiding visual noise while elevating institutional trustworthiness.

### Palette Architecture
- **Primary (`#0F766E` Clinical Teal):** Primary actions, active healthcare milestones, verified credentials, and active hospital status badges.
- **Secondary (`#1E3A8A` Institutional Trust Blue):** Core navigation chrome, institutional headers, authoritative dialogue confirmations, and formal metadata.
- **Tertiary (`#0284C7` Cyan Blue):** Interactive links, secondary appointment flows, actionable tooltips, and informational status banners.
- **Neutral (`#64748B` Slate Gray):** Base for body copy (`#0F172A`), structural borders (`#E2E8F0`), and layered medical surfaces (`#F8FAFC`, `#F1F5F9`, `#FFFFFF`).

### Clinical Triage Scale (Levels 1–5)
Reserved exclusively for triage, urgency queues, and vital clinical alerts:
- **Triage 1 (Emergencia Crítica):** `#DC2626` (Red-600) | Surface: `#FEF2F2` | Text: `#991B1B`
- **Triage 2 (Urgencia Mayor):** `#EA580C` (Orange-600) | Surface: `#FFF7ED` | Text: `#9A3412`
- **Triage 3 (Urgencia Moderada):** `#D97706` (Amber-600) | Surface: `#FFFBEB` | Text: `#92400E`
- **Triage 4 (Baja Gravedad):** `#16A34A` (Green-600) | Surface: `#F0FDF4` | Text: `#166534`
- **Triage 5 (Consulta General / Preventivo):** `#0284C7` (Blue-600) | Surface: `#F0F9FF` | Text: `#075985`

Do not repurpose triage colors for generic brand decorations.

## Typography

The typography system pairs **Plus Jakarta Sans** for structural and display headings with **Inter** for clinical records, high-density appointment lists, and forms.

- Headings balance warmth and structural authority.
- Body and label copy enforce absolute clarity in data-dense electronic health record (EHR) screens.
- Numerical patient identifiers, medical codes (CIE-10/ICD-11), and bed allocations leverage `tabular-nums` formatting to prevent misalignment in queues and dashboards.

## Layout & Spacing

This design system uses a flexible 12-column grid system tuned for patient booking portals, hospital queue boards, and administrative desks:
- **Desktop (1280px+):** 12 columns, 24px gutters, dynamic max-width container capped at 1440px.
- **Tablet (768px - 1279px):** 8 columns, 20px gutters, 24px canvas margins.
- **Mobile (320px - 767px):** 4 columns, 16px gutters, 16px canvas margins.

Interactive patient triggers (e.g., "Confirmar Cita", "Ingreso Urgencias") must adhere to a minimum interactive target size of 48px height across all viewports to accommodate motor-impaired individuals or high-stress emergency actions.

## Elevation & Depth

Visual hierarchy relies on **tonal containment** and **ambient cool-tinted shadows**, steering clear of excessive blur or ungrounded drop-shadows.

- **Level 0 (Flat Surface):** Clean canvas `#F8FAFC`. Unbordered or framed with `#E2E8F0`.
- **Level 1 (Card & Module Resting):** Pure white `#FFFFFF` surface resting on `#F8FAFC`, structured by a 1px `#E2E8F0` border and an ambient shadow: `0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active/Hover Cards & Dropdowns):** `0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Urgency Alerts, Triage Drawers):** `0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.04)` over a dim backdrop layer (`rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(4px)`).

## Shapes

The system implements a consistent **Level 2 (Rounded)** curvature language:
- Standard buttons, input elements, and triage chips use **0.5rem (8px)** radius.
- Clinical cards, calendar viewports, and appointment summary blocks use **1rem (16px)** (`rounded-lg`).
- Major clinical modal surfaces, patient dashboards, and triage status pods use **1.5rem (24px)** (`rounded-xl`).
- High-priority operational triage chips and quick-filter pills employ full pill-shaped curves (`rounded-full`) to contrast with structural data containers.

## Components

### Buttons
- **Primary:** Background `#0F766E`, text `#FFFFFF`, radius 8px, padding 12px 24px (`label-lg`). Hover: `#115E59`. Focus: 2px ring `#0F766E` with 2px offset.
- **Secondary (Institutional):** Background `#1E3A8A`, text `#FFFFFF`. Hover: `#1E40AF`.
- **Outline / Neutral:** 1px border `#CBD5E1`, background `#FFFFFF`, text `#334155`. Hover: `#F1F5F9`.

### Clinical Triage Badges & Chips
- Compact dimensions (height 24px–28px), uppercase or bold title (`label-sm`).
- Built using semantic surface pairs:
  - Triage 1: Surface `#FEF2F2`, border `#FCA5A5`, text `#991B1B`, with a pulsating 6px dot indicator.
  - Triage 2 to 5: Solid tint surface corresponding to their semantic grade, with a crisp 1px border.

### Cards
- **Clinical Encounter Card:** White container, 16px radius, 1px `#E2E8F0` border, Level 1 shadow. Includes a 4px left-hand vertical accent strip indicating appointment status or triage grade.
- Internal padding: 20px (`space-lg`) on desktop; 16px (`space-md`) on mobile.

### Inputs & Date-Time Pickers
- Border: 1px `#CBD5E1` on resting state, background `#FFFFFF`. Height: 48px.
- Focused state: 2px border `#0F766E` with ambient cyan-tinted glow (`rgba(15, 118, 110, 0.15)`).
- Error state: 1.5px border `#DC2626`, accompanied by an explicit inline icon and error message in `body-sm`.

### Checkboxes & Radios
- Size: 20px by 20px, radius 4px (checkbox) or circular (radio).
- Active state: `#0F766E` fill with white indicator mark. High-contrast focus state with a 2px outer ring.

### Lists & EHR Queues
- Row heights: Standard 56px, dense 44px.
- Alternating subtle highlight on hover (`#F8FAFC`).
- Separator line: 1px `#F1F5F9`.