# The theme: navy, glass, Thmanyah

Read this when setting up a new project's CSS, changing the palette, or deciding
how a new surface should look.

- [How the layers stack](#how-the-layers-stack)
- [Why the palette is built this way](#why-the-palette-is-built-this-way)
- [Moving to another hue](#moving-to-another-hue)
- [The glass recipe](#the-glass-recipe)
- [Type](#type)
- [Dark mode](#dark-mode)

## How the layers stack

`src/index.css` reads top to bottom as:

1. `@import "tailwindcss"; @import "tw-animate-css"; @import "shadcn/tailwind.css";`
2. Whatever the shadcn CLI generated: its `@theme inline` mappings and its stock
   `:root` / `.dark` token blocks.
3. `assets/theme.css` from this skill, pasted at the end.

Step 3 overrides step 2 instead of editing it. That is deliberate: `npx shadcn add`
rewrites the generated block whenever a new component needs a token, and a design
edited in place would be reverted silently, usually noticed days later. Keeping the
house style in its own trailing block means the CLI can regenerate freely.

## Why the palette is built this way

Every token sits at hue 250-264, a cool blue. Nothing is neutral grey. A grey UI
with a blue accent looks like a template with a colour picked; a UI where the
borders, the muted text, the shadows and the disabled states are all faintly navy
looks designed. That consistency, more than any single colour, is what carries the
look between projects.

All values are `oklch`. Lightness is perceptual there, so `oklch(0.36 ...)`
muted-foreground stays the same apparent darkness when the hue changes, which is
what makes a hue swap safe.

Several tokens carry alpha: `--card` at 0.66, `--muted` at 0.7, `--border` at 0.26.
They are meant to be translucent. A "fix" that makes them opaque kills the glass.

## Moving to another hue

Change the hue angle (the third number) in the `:root` block and in the four
gradients of `body::before`. Keep the lightness and chroma. Keep the spread: the
wash uses four nearby hues, not one, which is what stops it looking like a flat
tint.

For example, a teal version: 250-264 becomes roughly 180-200 everywhere.

Do not change `--radius: 0.9rem`. It is larger than shadcn's default 0.625rem and
is a big part of the softness; the derived `--radius-*` scale multiplies it, so one
value moves every corner in the app.

## The glass recipe

Any panel that should read as glass carries all four of these together:

```
bg-card text-card-foreground
ring-1 ring-(--glass-edge)
shadow-(--glass-shadow)
backdrop-blur-xl backdrop-saturate-150
```

- `ring` not `border`: the ring is a bright inner edge that reads as the lit top of
  a pane, and it does not take part in layout the way a border does.
- `backdrop-saturate-150` alongside the blur: blurring alone washes the colour out
  of what is behind, and re-saturating is what makes it look like glass rather than
  frosted plastic.
- The shadow is navy-tinted, never black. Two stops: a 1px contact shadow so the
  edge is crisp, and a wide, soft, offset shadow so the panel floats.

A header is the same recipe at lower strength, since it spans the full width and a
full-strength panel there would dominate:

```
border-b border-primary/10 bg-background/65 backdrop-blur-xl backdrop-saturate-150
```

The two fallbacks in `theme.css` (`@supports not (backdrop-filter)` and
`prefers-reduced-transparency`) are part of the recipe, not optional polish.
Without them the design fails open onto body text sitting on a gradient.

**Glass inside glass needs the container to give way.** Two 0.66-alpha surfaces
stacked come out near 0.88, which reads as a plain white slab and hides the wash
the whole design rests on. When a panel holds its own cards, weaken the
container and let the children keep full strength:

```
panel  bg-card/55   (plus the usual ring, shadow and blur)
cards  bg-card      (full strength, so they read as objects on the panel)
```

The same applies to a popover over a panel, or a chip over a card. The rule of
thumb is that only one surface in any stack carries full opacity, and it is the
innermost one, the thing you actually want someone to look at.

## Type

- **Thmanyah Sans** is the whole UI, Arabic and Latin, because it carries both
  scripts in one family. Pairing two faces means fighting their weights forever.
- **Thmanyah Serif Display Black** sets the wordmark only, via `font-brand`. One
  weight, one use. It covers both "Raqeeb" and "رقيب".
- The text scale is one step up from Tailwind's default (13/15/17px). These screens
  get read from further away than a marketing page.
- OpenType features are reserved for headings, buttons and pills. Body text and data
  keep the plain letterforms, because swash letters in a table of numbers or a long
  Arabic paragraph slow reading down. `font-ornate` opts anything else in.
- `tracking-*` utilities are neutralised under `html[lang="ar"]`: letter-spacing
  pulls joined Arabic letters apart and makes words look broken.

The fonts load from jsDelivr, from the `khaliddosari/thmanyah-fonts@v1` repo. The
tag is pinned, so the files cannot change under a shipped app. If a project must
not depend on a CDN, download the woff2 files into `public/fonts/` and rewrite the
`src:` URLs; nothing else changes.

## Dark mode

The house style is a light theme. `.dark` from the shadcn CLI is left in place but
not designed against, and no project has needed it yet. If one does, the work is a
`.dark` block that mirrors the navy tokens (dark navy background, surfaces at
`oklch(1 0 0 / 0.06)`, the wash at lower opacity) rather than the stock neutral
greys. Do not half-do it: an untested `.dark` block that ships is worse than none,
because `prefers-color-scheme` will find it.
