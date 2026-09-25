---
name: navy-glass-ui
description: "Build frontends in the house style: a light navy theme with translucent glass panels floating over an ambient gradient wash, Thmanyah typography, Arabic-first bilingual UI with full RTL mirroring, and dense single-screen console layouts, on shadcn/ui with Base UI (or Radix in older projects). Use this skill whenever starting a new web frontend, restyling an existing one, or adding a screen or a shadcn component to one built this way, and whenever the request mentions 'my usual look', 'the Raqeeb look', the house style, a design system, a dashboard or operations console, or an Arabic / RTL interface. Reach for it even when the request only says 'make it look good' or names no style at all, because an unstyled shadcn default is exactly what this exists to replace."
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

## What this skill covers, and where the API docs are

The component layer is shadcn/ui in the `base-nova` style, which is built on Base
UI. Their API documentation already exists and is matched to the version installed
in the project, so read it rather than guessing props:

- `npx shadcn@latest docs <component>` for the shadcn wrapper: usage, examples,
  variants. It reads the project's base, so it answers for Radix projects too.
- `node_modules/@base-ui/react/docs/react/components/<name>.md` for the primitive
  underneath, and `.../docs/react/handbook/` for composition, forms and animation.
  Radix ships no docs folder; in a Radix project the shadcn docs above are the
  local source.
- `npx shadcn@latest view https://ui.shadcn.com/r/styles/base-nova/<name>.json`
  prints a component's registry source, with no project needed. It is how a
  standalone page borrows the real classes of a button or an input.

This skill is the layer on top of those: the theme, the direction handling, and a
house answer for every component in the registry (`references/catalog.md`).

## Starting a project

```bash
npx shadcn@latest init -t vite -b base -p nova --rtl -n <name>   # -t next for Next.js
cd <name>
npx shadcn@latest add direction
```

Run `init` from the folder that should contain the new project, not from inside
one: in a folder that already has a `package.json` it tries to set up that
package instead and stops. It also runs `git init` and makes a first commit
under the machine's git identity; if commits should only happen when asked,
say so, or remove the `.git` folder it made. It scaffolds the app, Tailwind v4, the `@` alias and `base-nova`, and writes
`"rtl": true` into `components.json`. That flag is the most important line in the
setup: with it, the CLI writes every component it adds with logical properties
(`ps-`, `start-`, `text-start`) and `rtl:` flips for transforms and icons. Without
it, stock components ship `pl-`, `left-` and `text-left`, and break in Arabic one
at a time.

Then four edits to what the CLI wrote:

1. **The stylesheet** (`src/index.css`, or `app/globals.css` in Next): paste
   `assets/theme.css` from this skill at the **end**, after everything
   generated. It overrides the generated palette instead of editing it, so a
   later `npx shadcn add` cannot silently revert the design. Then remove the
   font the CLI added, since the theme sets Thmanyah and nothing would use it:
   in Vite it is an import line at the top of the stylesheet (uninstall the
   package too); in Next it is `next/font` (Geist and Geist Mono) in
   `app/layout.tsx`, with their variables in the `<html>` className.
2. **The theme provider**: remove it, and its file. Both templates wrap the app
   in a `ThemeProvider` that follows the system setting and also adds a hotkey:
   pressing D anywhere on the page switches to dark. Setting
   `defaultTheme="light"` does not stop the hotkey. The house style is light
   only, and dark swaps in shadcn's stock neutral palette under the navy. If
   `sonner` is installed, its `sonner.tsx` imports `useTheme` from next-themes;
   replace that with `theme="light"` on the `Toaster`, or it follows the system
   into sonner's dark styles.
3. **Direction**: ship `<html lang="ar" dir="rtl">` and wrap the app in
   `DirectionProvider` from `@/components/ui/direction`. In Next, `app/layout.tsx`
   renders `lang` and `dir` from a cookie instead of the hardcoded `lang="en"`.
   The wiring for both is in `references/arabic-rtl.md`.
4. **Bilingual**: copy `assets/i18n.ts` to `src/lib/i18n.ts`.

An English-only project skips steps 3 and 4: ship `lang="en" dir="ltr"`, no
dictionary, no toggle. Keep `"rtl": true` and logical properties anyway, so
adding Arabic later is a dictionary and a toggle rather than a rewrite.

Leave `"menuColor"` at `"default"`. The translucent option looks like the house
style, but it forces destructive menu items to navy with `!important`, and
`theme.css` already makes every menu glass.

Add components as they are needed (`npx shadcn@latest add dialog`), and check the
component's entry in `references/catalog.md` before using it. From a shell that
cannot answer prompts, which includes an agent's, pass `-y` to `add` and
`migrate`, or the command waits on a confirmation nobody sees. `-y` does not
answer the overwrite question, though: when a component brings along a file that
already exists (`item` brings `separator`), `add` asks, gets no answer, and exits
having written nothing, with no error. Check with `--dry-run` first, and add
`--overwrite` only for files that have no local edits. Afterwards, confirm the
file you asked for actually exists.

The template's lint config flags a few rules inside the generated
`components/ui` files. Turn those rules off for that folder in the ESLint config
rather than editing the files.

**A standalone page with no build step** (a preview, a one-off, something to open
from disk) works too: load `@tailwindcss/browser@4` and put `theme.css` inside
`<style type="text/tailwindcss">`. Nothing else is needed. The one trap, and it
fails silently, is that the import at-rule text must not appear anywhere inside
that block, comments included: the browser build then emits zero utilities and
says nothing, leaving a page with the right fonts and wash and no layout.

With no registry to add from, controls are built by hand: take the classes from
the registry source (`shadcn view`, above), and use the switch and dialog recipes
in `references/components.md`. The dictionary works in plain JavaScript too; it
loses the type check, so compare the two dictionaries' keys once at load and
log any key Arabic is missing.

## Restyling an existing project

Find out what the project is before pasting anything. Each row is a check and what
to do about it:

| If the project has | Do this |
| --- | --- |
| Tailwind v3 (`tailwind.config.js`, `@tailwind base`) | `npx @tailwindcss/upgrade` first. `theme.css` is v4 syntax throughout. |
| shadcn with `"rtl": false`, or no `rtl` key | `npx shadcn@latest migrate rtl -y`, once: a second run adds every `rtl:` class again as a duplicate. It sets `"rtl": true` itself and rewrites only the physical classes in `components/ui`, keeping local edits. Review the diff. Most of what it fixes is latent (icon padding, table headers, vertical tabs) and only shows once someone uses that feature. It lists the files it cannot finish (sidebar, and per shadcn's docs calendar and pagination); their entries in `references/catalog.md` say what is left. |
| An older copy of this theme already in its CSS | Do not paste a second copy. Diff it against `assets/theme.css` and bring over what is missing: tokens, the popup and overlay rules, the fallback lines. |
| shadcn on Radix (`new-york`, `radix-*` styles) | Keep it. The theme keys on `data-slot`, which is the same in both. Differences are in `references/base-ui.md`. Do not mix Radix and Base UI in one project. |
| shadcn components with no `data-slot` attributes (pre-2025) | The theme's popup and card rules cannot find them. Re-add with `npx shadcn@latest add <name> --diff` to review, then `--overwrite`, after the RTL migration so the files arrive logical. A file with local edits keeps them: add the `data-slot` attributes by hand instead. |
| Tailwind v4 without shadcn | `theme.css` works on its own. Build components with `references/components.md`, or `shadcn init` into the project. |
| No Tailwind (CSS modules, MUI, styled-components) | Port the plain-CSS parts of `theme.css`: the font faces, the `:root` tokens, the wash, the fallbacks and the popup rules. Point the library's theme at the variables. |
| A dark mode toggle or next-themes | Remove the provider and the toggle, and fix `sonner.tsx` as in step 2 of the setup above, or design a real `.dark` block (`references/theme.md`). `defaultTheme="light"` is not a pin: a stored choice and the D hotkey both override it. Never leave shadcn's neutral `.dark` under a navy light theme. |

Then the three things inside the project's own code that fight the paste:

- **Hardcoded colours.** Solid `bg-white`, greys such as `bg-slate-50` and
  `text-gray-600`, and hex values ignore the token layer and will look grey next
  to navy. Convert them to `bg-card`, `text-muted-foreground` and so on. The
  exceptions stay: the four status colours, white at partial opacity used as an
  inner glass surface (`bg-white/55`), and black behind video.
- **Opaque surfaces.** A `bg-white` panel cannot be glass. Switch to `bg-card` plus
  the glass classes, or to the shadcn `Card`, which the theme makes glass.
- **Physical properties.** `ml-`, `pl-`, `text-left`, `left-0` all break mirroring.
  The migration only covers `components/ui`; convert pages and feature components
  to `ms-`, `ps-`, `text-start`, `start-0` by hand, even if the project is
  English-only today.

## The patterns worth knowing before you start

**A panel** is the unit of layout. Glass, rounded-2xl, a numbered header with a
status pill, a scrollable body. The shadcn `Card` gets the glass from the theme;
a hand-built panel needs all four parts:

```
bg-card text-card-foreground ring-1 ring-(--glass-edge)
shadow-(--glass-shadow) backdrop-blur-xl backdrop-saturate-150
```

The ring is the lit top edge, the saturate keeps colour in what shows through the
blur, and the shadow is navy-tinted, never black.

**Popups are a different surface.** Menus, selects, popovers and dialogs sit over
content rather than the wash, so they are near-opaque (`bg-popover`), blurred, with
a navy hairline and a deeper shadow. The theme applies all of that by `data-slot`;
there is nothing to add per component.

**Status is four states**: grey idle, blue running, green done, red malfunction,
each shown as a coloured pill with a dot *and* a word, so colour is never the only
cue. These are the only saturated colours in the design, which is what makes one of
them land when it appears. Domain states map onto the four rather than adding a
fifth colour: queued is idle, unsaved is running, active is done, expired is
malfunction. The pill is a shadcn `Badge` (outline) with the tone classes, which is
how the theme finds it; `references/components.md` has the component and the
mapping table.

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
| `references/catalog.md` | Using any shadcn component. One entry per component in the registry: what the theme already does, what to add, what breaks in Arabic, when not to use it. Also the Base UI primitives shadcn does not wrap. |
| `references/base-ui.md` | Writing JSX against Base UI: `render` instead of `asChild`, the data attributes to style on, groups, forms, positioning. Also the Radix equivalents, for older projects. |
| `references/theme.md` | Setting up the CSS, changing the hue, charts, the sidebar, deciding how a new surface should look, or wondering why a token is translucent. |
| `references/arabic-rtl.md` | The project has an Arabic interface, or anything needs to mirror. Wiring for Vite and Next, the dictionary, the toggle, and what the CLI's RTL mode does not cover. |
| `references/layout.md` | Laying out any page. Opens with the ordinary scrolling page of panels; the rest is the console case: `desk` variants, container-query shedding, phone-first decisions, density patterns. |
| `references/components.md` | Writing a component of your own that has to match: `cva` + `data-slot` conventions, the panel, pills, empty states, switches, dialogs, form controls. |
| `assets/theme.css` | Always. This is the theme; paste it, do not retype it. |
| `assets/i18n.ts` | The project is bilingual. Copy to `src/lib/i18n.ts`. |

## Before calling it done

Look at the real thing, not the code:

- **360px wide**, not just 390. One extra wrapped row shows up there first.
- **Both languages**, at the same breakpoint. Arabic words are longer as often as
  they are shorter, and a row that fits in one can wrap in the other.
- **The mirror**: switch to Arabic and find anything that stayed put when it should
  have flipped, or flipped when it should not have (clocks, ids, non-directional
  icons). Sidebars, sheets and charts are the usual suspects.
- **Every popup, open, over real content.** Menus, selects, dialogs: text behind
  them should be blurred away, not readable through them, and destructive items
  should still be red.
- **Glass over something.** If a panel sits on a flat area of the wash it looks
  like a plain white box. Move it or widen the wash. Judge this in the browser or
  in a viewport-sized screenshot: the wash is `position: fixed`, and a headless
  full-page capture paints it over the first screen only, so everything below
  looks flat when it is not.
- **Focus ring** on every control, by keyboard. The theme sets `outline-ring/50`
  globally; a component that removes it has to put something back.
- **The fallbacks**: with `prefers-reduced-transparency`, surfaces go nearly opaque
  and the wash dims. Confirm text is still readable rather than sitting on a
  gradient.
- **The console**: no errors. Base UI throws on a misassembled part (a menu label
  outside its group, for one) and takes the whole page down with it.

## What not to do

- Do not make the tokens opaque to "fix" contrast. The alpha is the design; if
  contrast is short, darken the foreground or strengthen the wash behind.
- Do not add a second accent hue. The navy is the identity and the four status
  colours are the exceptions; a third colour family makes it generic.
- Do not reach for `tracking-*` in Arabic, or ship a `.dark` block that has not
  been designed against. Both are covered in `references/theme.md`.
- Do not branch on language to choose a side. That bug looks fixed until the next
  screen. Reading the *direction* (`useDirection()`) to pick a prop that is
  genuinely physical is fine; that is the direction deciding. Check first that it
  is physical: in older sidebar and sheet files the RTL migration makes `side`
  logical, and deriving it again flips it twice (`references/catalog.md`).
- Do not hand-build a component the registry ships. Add it and let the theme
  style it; a hand-rolled dialog or switch misses the focus handling, the
  keyboard support and the RTL work that come with the real one.
- Do not edit a generated component to restyle it when a token or a `theme.css`
  rule would do. Edits are lost the next time someone runs `add --overwrite`.
