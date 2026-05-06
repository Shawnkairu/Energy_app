# Agent instructions — design system

This project follows the design system extracted from https://stripe.com.
Any coding agent working here must use the tokens below and avoid inventing new ones.
Source: https://stripe.com
Extracted by designlang v7.0.0 on 2026-04-30T21:34:43.730Z

## Semantic tokens (use these)
- color.action.primary: #6b59fe
- color.surface.default: #ffffff
- color.text.body: #000000
- radius.control: 1px
- typography.body.fontFamily: sohne-var

## Regions
- nav
- nav
- content
- content
- pricing
- hero
- pricing
- content
- hero
- testimonials
- testimonials
- nav
- features
- nav
- content
- hero
- nav
- content
- testimonials
- testimonials
- nav
- pricing
- footer

## How to use
- Prefer `semantic.*` tokens over `primitive.*`.
- Never invent new tokens or hex values; reuse the ones above.
- When a value is missing, pick the closest existing semantic token and flag the gap.
- Reference tokens by their dotted path (e.g. `semantic.color.action.primary`).
