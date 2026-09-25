---
name: navy-glass-ui
description: "Build frontends in the house style: a light navy theme with translucent glass panels floating over an ambient gradient wash, Thmanyah typography, Arabic-first bilingual UI with full RTL mirroring, and dense single-screen console layouts. Use this skill whenever starting a new web frontend, restyling an existing one, or adding a screen to one built this way, and whenever the request mentions 'my usual look', 'the Raqeeb look', the house style, a design system, a dashboard or operations console, or an Arabic / RTL interface. Reach for it even when the request only says 'make it look good' or names no style at all, because an unstyled shadcn default is exactly what this exists to replace."
---

# Navy glass UI

A light navy interface made of translucent panels floating over a soft gradient
wash. Arabic and English in one dictionary, mirroring properly in both. Dense
enough to run an operations screen, comfortable enough to read on a phone.

The look comes from four decisions that hold together. Keep them and a new project
is recognisably part of the family; drop one and it reads as a different product:

1. **Everything is navy.** Hue 250-264 on every surface, border, shadow and muted
   label. No neutral greys with a blue accent on top.
2. **Surfaces are glass, and glass needs a background worth blurring.** The
   translucent panels only work because a fixed gradient wash sits behind them.
3. **Thmanyah for both scripts**, one step up from Tailwind's text scale, with the
   fancy letterforms reserved for headings and buttons.
4. **Direction decides sides, not language.** Logical properties throughout, so the
   whole interface mirrors itself and nothing needs a per-language branch.

## Starting a project

```bash
npm create vite@latest <name> -- --template react-ts
cd <name>
npm i tailwindcss @tailwindcss/vite tw-animate-css class-variance-authority cn lucide-react
npx shadcn@latest init          # style: base-nova, base colour: neutral, CSS variables: yes
npx shadcn@latest add button card input label badge tabs separator
```

Wire `@tailwindcss/vite` into `vite.config.ts` along with the `@` → `./src` alias,
then paste `assets/theme.css` from this skill at the **end** of `src/index.css`,
after everything the CLI generated. It overrides the generated palette instead of
editing it, so a later `npx shadcn add` cannot silently revert the design.

For a bilingual project, copy `assets/i18n.ts` to `src/lib/i18n.ts` and follow the
wiring steps in `references/arabic-rtl.md`.

That is the whole setup. Build the actual screens with the patterns below.

**A standalone page with no build step** (a preview, a one-off, something to open
from disk) works too: load `@tailwindcss/browser@4` and put `theme.css` inside
`<style type="text/tailwindcss">`. Nothing else is needed. The one trap, and it
fails silently, is that the import at-rule text must not appear anywhere inside
that block, comments included: the browser build then emits zero utilities and
says nothing, leaving a page with the right fonts and wash and no layout.

## Restyling an existing project

Same theme file, same place, but check three things first, because they are what
usually fights the paste:

- **Hardcoded colours.** `bg-white`, `bg-slate-50`, `text-gray-600` and hex values
  ignore the token layer and will look grey next to navy. Convert them to
  `bg-card`, `text-muted-foreground` and so on. The exception is the four status
  colours, which stay literal on purpose.
- **Opaque surfaces.** A `bg-white` panel cannot be glass. Switch to `bg-card` plus
  the glass classes.
- **Physical properties.** `ml-`, `pl-`, `text-left`, `left-0` all break mirroring.
  Convert to `ms-`, `ps-`, `text-start`, `start-0` while you are in there, even if
  the project is English-only today.

## The patterns worth knowing before you start

**A panel** is the unit of layout. Glass, rounded-2xl, a numbered header with a
status pill, a scrollable body:

```
bg-card text-card-foreground ring-1 ring-(--glass-edge)
shadow-(--glass-shadow) backdrop-blur-xl backdrop-saturate-150
```

All four parts together. The ring is the lit top edge, the saturate keeps colour in
what shows through the blur, and the shadow is navy-tinted, never black.

**Status is four states**: grey idle, blue running, green done, red malfunction,
each shown as a coloured pill with a dot *and* a word, so colour is never the only
cue. These are the only saturated colours in the design, which is what makes one of
them land when it appears. Domain states map onto the four rather than adding a
fifth colour: queued is idle, unsaved is running, active is done, expired is
malfunction. `references/components.md` has the mapping table.

**Density comes from truncation, not small text.** Label over value, one line each,
full value in `title`. A grid of those has a known height, so a panel of facts never
needs to scroll.

**Phones give things up rather than shrink.** Full names become first names, worded
buttons become one letter, long labels get short forms. Render both and switch with
`sm:hidden` / `hidden sm:inline`, so the desktop version is untouched.

**Motion is nearly absent.** One pinging dot for a running state, under
`motion-safe:`. Everything else is a colour transition. These interfaces are looked
at for hours.

## Where the detail lives

Read the file that matches what you are doing. Each one stands alone.

| File | Read it when |
| --- | --- |
| `references/theme.md` | Setting up the CSS, changing the hue, deciding how a new surface should look, or wondering why a token is translucent. |
| `references/arabic-rtl.md` | The project has an Arabic interface, or anything needs to mirror. Covers the dictionary shape, the language toggle, and what mirrors badly. |
| `references/layout.md` | Laying out any page. Opens with the ordinary scrolling page of panels; the rest is the console case: `desk` variants, container-query shedding, phone-first decisions, density patterns. |
| `references/components.md` | Setting up the component layer, or writing a component that has to match. Stack, `cva` + `data-slot` conventions, the panel, pills, empty states, form controls. |
| `assets/theme.css` | Always. This is the theme; paste it, do not retype it. |
| `assets/i18n.ts` | The project is bilingual. Copy to `src/lib/i18n.ts`. |

## Before calling it done

Look at the real thing, not the code:

- **360px wide**, not just 390. One extra wrapped row shows up there first.
- **Both languages**, at the same breakpoint. Arabic words are longer as often as
  they are shorter, and a row that fits in one can wrap in the other.
- **The mirror**: switch to Arabic and find anything that stayed put when it should
  have flipped, or flipped when it should not have (clocks, ids, non-directional
  icons).
- **Glass over something.** If a panel sits on a flat area of the wash it looks
  like a plain white box. Move it or widen the wash.
- **Focus ring** on every control, by keyboard. The theme sets `outline-ring/50`
  globally; a component that removes it has to put something back.
- **The fallbacks**: with `prefers-reduced-transparency`, surfaces go nearly opaque
  and the wash dims. Confirm text is still readable rather than sitting on a
  gradient.

## What not to do

- Do not make the tokens opaque to "fix" contrast. The alpha is the design; if
  contrast is short, darken the foreground or strengthen the wash behind.
- Do not add a second accent hue. The navy is the identity and the four status
  colours are the exceptions; a third colour family makes it generic.
- Do not reach for `tracking-*` in Arabic, or ship a `.dark` block that has not
  been designed against. Both are covered in `references/theme.md`.
- Do not branch on language to choose a side. That bug looks fixed until the next
  screen.
