---
name: brand-guidelines
description: "Applies brand colors, typography, and visual identity to artifacts, documents, presentations, and web content. Use when brand consistency, visual formatting, or company design standards apply. Chec..."
---
# Brand Guidelines

## Overview
Universal brand styling system for digital and print assets. Brand-specific rules are stored in references.

**Keywords**: branding, visual identity, styling, brand colors, typography, corporate identity, design standards, visual formatting

## Usage
1. Identify which brand applies to the task
2. Load brand-specific reference from `references/brands/[brand-name].md`
3. Apply colors, typography, and rules from that reference
4. Fall back to generic defaults if no brand reference exists

## Available Brand References
- `references/brands/molychile.md` — Chilean industrial distributor (UNI-T, CSB, URREA, Energizer)

## Generic Defaults (when no brand specified)

### Colors
| Role | Hex | Use |
|------|-----|-----|
| Primary | `#1a1a1a` | Headers, primary text |
| Secondary | `#4a4a4a` | Body text |
| Accent | `#0066cc` | Links, CTAs, highlights |
| Background | `#ffffff` | Page background |
| Surface | `#f5f5f5` | Cards, sections |
| Border | `#e0e0e0` | Dividers, outlines |

### Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | System sans-serif | 700 | 32px |
| H2 | System sans-serif | 600 | 24px |
| H3 | System sans-serif | 600 | 18px |
| Body | System sans-serif | 400 | 16px |
| Small | System sans-serif | 400 | 14px |

## Application Contexts

### Documents (docx, pdf)
- Cover page: Primary color header bar
- Headers: Primary color, heading font
- Body: Secondary color, body font
- Accents: Accent color for highlights, links

### Presentations (pptx)
- Title slides: Primary background, white text
- Content slides: White background, primary headers
- Accent elements: Accent color for charts, callouts

### Web / HTML
- Use CSS variables for theming
- Ensure WCAG AA contrast compliance
- Apply responsive typography scale

### Ecommerce Listings
- Product titles: Primary color, heading font
- Descriptions: Secondary color, body font
- Price: Accent color, bold
- Badges/CTAs: Accent background, white text

## Technical Patterns

### CSS Variables Template
```css