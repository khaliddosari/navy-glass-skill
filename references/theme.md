# The theme: navy, glass, Thmanyah

Read this when setting up a new project's CSS, changing the palette, or deciding
how a new surface should look.

- [How the layers stack](#how-the-layers-stack)
- [Why the palette is built this way](#why-the-palette-is-built-this-way)
- [Moving to another hue](#moving-to-another-hue)
- [The glass recipe](#the-glass-recipe)
- [Popups and overlays](#popups-and-overlays)
- [Charts](#charts)
- [The sidebar](#the-sidebar)
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

A fresh `init` also adds a font import (Geist or similar) at the top of the file
and points `--font-sans` at it. The theme's own `--font-sans` comes later and
wins, so the page is right either way, but delete the import and uninstall the
package, or every visitor downloads a font nothing uses.

A few rules in the theme sit outside any `@layer`: the popup and card rules and
the Arabic tracking reset. That is on purpose. Tailwind's utilities live in a
layer, and any rule in a layer loses to them no matter how specific it is, so an
unlayered rule is the only way a stylesheet can restyle generated components
without editing them. The cost is that a `className` on one of those components
cannot override those particular properties; the important modifier can
(`shadow-none!`).

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

Change the hue angle (the third number) in the `:root` block, which includes the
chart hues, `--scrim` and the two shadows, and in the four gradients of
`body::before`. Keep the lightness and chroma. Keep the spread: the wash uses four
nearby hues, not one, which is what stops it looking like a flat tint, and the
five chart hues follow the same spread. The sidebar tokens point at the main ones,
so they follow on their own.

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

The shadcn `Card` gets this whole recipe from `theme.css` (by its `data-slot`),
so a project using `Card` writes none of these classes. They are for panels built
by hand, and for the section shell in `references/components.md`.

## Popups and overlays

Panels float over the wash; popups float over content. That changes three things,
and `theme.css` applies them by `data-slot`, to every menu, select, combobox,
popover, hover card, dialog, alert dialog, sheet, drawer and toast, and to the
phone sidebar, which opens as a sheet under its own slot name. Sonner toasts have
no `data-slot`; the theme finds them by `data-sonner-toast` and gives them the
blur, leaving sonner its own shadow:

- **More opacity.** `--popover` is 0.9 against the card's 0.66, because text over
  other text needs more backing than text over a gradient.
- **A blur anyway.** At 0.9, the text underneath still shows through sharp enough
  to read, which looks like a rendering bug. A 24px blur turns it into colour.
- **A different edge and a deeper shadow.** `--popup-shadow` puts a navy hairline
  round the popup, since the white glass edge would vanish against a card, and a
  deeper float, since a popup sits higher than a panel.

Dialog, sheet and drawer scrims are `--scrim`, navy at 30%, never black.

Tooltips are left out on purpose: they are solid `bg-foreground`, dark navy with
light text, small enough that glass would only make them harder to read.

Menus do not need shadcn's translucent `menuColor`; the theme already makes them
glass, and that setting turns destructive menu items navy.

## Charts

`--chart-1` to `--chart-5` are the wash's own hues, 234 to 276, stepped in
lightness so neighbouring series separate even in greyscale:

| Token | Reads as | Use |
| --- | --- | --- |
| `--chart-1` | deep royal navy | the main series, or the only one |
| `--chart-2` | sky | second series |
| `--chart-3` | indigo | third series |
| `--chart-4` | pale blue | fourth series, or "other" |
| `--chart-5` | darkest navy | fifth series, or a target line |

- One series uses `--chart-1`. A single metric in five colours is noise.
- More than five series is a table, or a top four plus "other".
- A sequence (a heatmap, intensity by hour) is one hue at stepped opacity, not
  the five hues: `fill-chart-1/20` up to `fill-chart-1` on hand-drawn SVG,
  `fill="var(--chart-1)"` with a stepped `fillOpacity` in recharts.
- Anything that means a status (failures, breaches) uses the status red and
  green, the same as the pills. That is the one place saturated colour appears
  in a chart, which is why it is noticed.

## The sidebar

The shadcn sidebar reads its own set of `--sidebar-*` tokens. The theme points
them at the main ones (foreground, primary, accent, border, ring), except
`--sidebar` itself: 0.5 white, weaker than a card, because the rail is a
container that holds other surfaces (glass inside glass, above). The theme blurs
the rail by its `data-slot`, and the reduced-transparency fallback makes it
nearly opaque with the cards.

`SidebarInset`, the main column beside the rail, ships an opaque
`bg-background` in every variant. The theme makes it transparent: it is layout,
not a surface, and opaque it would hide the wash behind the whole page.

## Type

- **Thmanyah Sans** is the whole UI, Arabic and Latin, because it carries both
  scripts in one family. Pairing two faces means fighting their weights forever.
- **Thmanyah Serif Display Black** sets the wordmark only, via `font-brand`. One
  weight, one use. It covers both "Raqeeb" and "رقيب". Page titles are Sans,
  bold.
- The weights loaded are 300, 400, 500, 700 and 900. There is no 600, so
  `font-semibold` renders as bold. Use `font-medium` or `font-bold`, whichever
  was meant.
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

The house style is a light theme. The theme sets `color-scheme: light` on the
root, so native controls, scrollbars and autofill stay light on a machine in dark
mode.

`.dark` from the shadcn CLI is left in place but not designed against. That is
only safe while nothing turns it on, and a fresh project does: `init` (Vite and
Next alike) wraps the app in a `ThemeProvider` that follows the system, which
adds `.dark` on any machine in dark mode, and it adds a hotkey that toggles dark
when D is pressed anywhere outside a text field. Remove the provider and its
file. `defaultTheme="light"` is not enough: it leaves the hotkey, and a stored
choice overrides it. In an older project, look for next-themes or a dark mode
toggle and remove them the same way, and give sonner `theme="light"`, since
shadcn's `sonner.tsx` reads next-themes.

The theme also defines the `dark` variant as class-based (`&:is(.dark *)`), the
same as the CLI does. That matters in a standalone page, which has no CLI
stylesheet: without it, Tailwind's `dark:` follows the system setting, and the
`dark:` classes inside copied shadcn markup switch on for anyone in dark mode.

No project has needed a dark theme yet. If one does, the work is a
`.dark` block that mirrors the navy tokens (dark navy background, surfaces at
`oklch(1 0 0 / 0.06)`, the wash at lower opacity) rather than the stock neutral
greys. Do not half-do it: an untested `.dark` block that ships is worse than none,
because `prefers-color-scheme` will find it.
