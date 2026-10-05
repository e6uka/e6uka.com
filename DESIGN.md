# Design brief

## Product
- What it is: personal portfolio of a software engineer (confirmed)
- Primary audience and context of use: hiring managers and engineering leads, skimming on desktop, sometimes mobile, ~30 seconds (confirmed)
- Secondary audience: peers following a link (assumed)
- Job of the key screens: show role, skills and 3 to 5 strong projects; make contact and CV one click away (confirmed)
- First 5 seconds: know who this is and what they build, see the work, find the contact (assumed)

## Personality
- Position: calm, precise, serious with a small dose of play; "quiet precision", a draughtsman's sheet (confirmed)
- Admired references and why: @lucasmarkes/hairline, isometric single-stroke line figures that answer the pointer (confirmed)
- Must not resemble: generic dev portfolio template (gradient hero, emoji skill grid, glassmorphism cards) (designer's call)
- Category: stand apart (designer's call)

## Brand (fixed vs flexible)
- Logo: none yet (assumed)
- Colors: flexible; one stroke in four weights, Hairline palette (designer's call)
- Type: flexible (designer's call)
- Imagery: real project screenshots inside a hairline isometric frame (confirmed)
- Voice: plain, first person, specific (assumed)

## Platforms
- Targets and priority: responsive web, desktop first for audience, mobile must be solid (assumed)
- Themes: light and dark, follows system, with toggle (confirmed)
- Locales: English (assumed)

## Constraints
- Stack: static HTML/CSS/JS, no build step (confirmed)
- Accessibility beyond AA: reduced motion fully respected; figure is never the only way to navigate (designer's call)
- Performance: no framework, no external JS beyond the hairline engine (designer's call)

## Motion
- Level and purpose: responsive micro-interactions; motion shows what the pointer is over (confirmed via personality)
- Signature moment: hero shelf, one spine per project; hovered spine tilts out, neighbours lean away staggered; click jumps to the project (confirmed)

## Success
- Measures: contact clicks and CV downloads (assumed)
- Never: em dashes in copy, AI-cliche words, colour-only meaning (designer's call)

## Design decisions (filled in by the designer)
- Palette tokens: monochrome, no accent hue. Light: ground #f6f7f9, ink #1c1f25, muted #5a606c, line #dde0e6, edge #9ea4af. Dark: ground #0c0e11, ink #dde2ea, muted #969daa, line #252930, edge #5d636e. Emphasis is always dim to bright ink (the Hairline accent rule), never a colour.
- Type scale: Hanken Grotesk 400/500/600, ratio ~1.25, h1 clamp(2rem..3.375rem), body 16/17px. JetBrains Mono only for the shelf readout, stack lists and the sample notice.
- Radius and elevation: controls 8, frames 12, figure plate 14. No shadows; depth is a second offset outline (a plate's thickness line).
- Signature element: project shelf figure (shelf.js on the Hairline kernel), one spine per project plus about/contact spines up to 6; linked both ways with the project list.
- Log of conscious rule breaks: monospace small labels (a known generated tell) kept for the readout and stack lists, because code is the subject's world and Hairline's readout is mono.
