---
name: competitive-ads-extractor
description: "Extracts and analyzes competitor ads from ad libraries (Facebook, LinkedIn, TikTok, Google). Use when researching competitor messaging, creative patterns, campaign strategies, or ad inspiration. Ch..."
---
# Competitive Ads Extractor

## Overview
Scrape and analyze competitor ads to identify working messaging, creative patterns, and campaign strategies.

**Keywords**: competitor ads, ad library, facebook ads, linkedin ads, tiktok ads, messaging analysis, creative research, ad copy, campaign strategy, competitive intelligence

## Process
1. Identify target brand/industry
2. Check `references/competitors/[brand].md` or `references/industries/[industry].md`
3. Access relevant ad libraries
4. Extract ads + screenshots
5. Analyze using framework below
6. Output to `~/competitor-ads/[brand]/`

## Ad Library Sources
| Platform | URL | Access |
|----------|-----|--------|
| Facebook/Instagram | facebook.com/ads/library | Public |
| LinkedIn | linkedin.com/ad-library | Requires login |
| TikTok | ads.tiktok.com/business/creativecenter | Public |
| Google | adstransparency.google.com | Public |

## Analysis Framework

### Messaging
| Dimension | Extract |
|-----------|---------|
| Problems | Pain points, frustrations addressed |
| Use cases | Target scenarios, jobs-to-be-done |
| Value props | Benefits, outcomes promised |
| Positioning | vs. alternatives, unique angles |
| Social proof | Numbers, logos, testimonials |

### Creative
| Dimension | Extract |
|-----------|---------|
| Format | Static, video, carousel, GIF |
| Visual style | Colors, imagery, layout |
| Pattern | Before/after, demo, testimonial |
| Branding | Logo placement, brand colors |
| Length | Video duration, copy length |

### Copy
| Element | Note |
|---------|------|
| Headline | Hook, length, structure |
| Body | Tone, specificity, proof |
| CTA | Action, urgency, offer |

## Output Structure
```
~/competitor-ads/[brand]/
├── screenshots/           # All ad images
├── videos/               # Video ads
├── analysis.md           # Full analysis report
├── top-performers/       # Best ads subset
├── raw-data.csv          # Structured data
└── patterns.md           # Identified patterns
```

## Analysis Report Template
```markdown
# [Brand] Ad Analysis

## Overview
- Total ads: X active
- Platforms: [list]
- Date extracted: YYYY-MM-DD

## Top Problems Highlighted
1. [Problem] (X ads) — "[Example copy]"
2. ...

## Creative Patterns
1. [Pattern name] — [Description], used in X ads

## Copy Patterns
- Headlines: [Pattern]
- CTAs: [Common CTAs]
- Length: [Avg characters]

## Audience Segments
- [Segment]: [Messaging angle]

## Recommendations
1. [Actionable insight]
```

## References
- `references/competitors/` — Known competitor profiles and history
- `references/industries/` — Industry-specific patterns and benchmarks
- `references/platforms/` — Platform-specific extraction methods