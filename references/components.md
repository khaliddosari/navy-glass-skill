# Components

Read this when setting up the component layer in a new project or adding a
component that has to match the rest.

- [The stack](#the-stack)
- [Setting it up](#setting-it-up)
- [How a component is written](#how-a-component-is-written)
- [The panel](#the-panel)
- [The status pill](#the-status-pill)
- [Empty states](#empty-states)
- [Switches](#switches)
- [Dialogs](#dialogs)
- [Forms and controls](#forms-and-controls)
- [Icons and marks](#icons-and-marks)

## The stack

React 19 + TypeScript + Vite, Tailwind v4, shadcn (`base-nova` style, which is
built on Base UI rather than Radix), `lucide-react` for icons, `sonner` for
toasts, `class-variance-authority` for variants, `cn` for class merging.

`src/lib/utils.ts` is one line: `export { cn } from "cn"`. Components import from
`@/lib/utils` so the merge implementation can change in one place.

Path alias `@` → `./src`, set in both `vite.config.ts` (`resolve.alias`) and
`tsconfig.app.json` (`paths`). shadcn's CLI expects it.

## Setting it up

```bash
npm create vite@latest <name> -- --template react-ts
cd <name>
npm i tailwindcss @tailwindcss/vite tw-animate-css class-variance-authority cn lucide-react
npx shadcn@latest init          # style: base-nova, base colour: neutral, CSS variables: yes
npx shadcn@latest add button card input label badge tabs separator
```

Then paste `assets/theme.css` at the end of `src/index.css`. The navy tokens
override the neutral ones the CLI just wrote; see `references/theme.md` for why
the order matters.

`components.json` should end up with `"style": "base-nova"`, `"iconLibrary":
"lucide"`, `"cssVariables": true`. Leave `"rtl": false` even for Arabic projects:
direction is handled by `dir` on `<html>` plus logical properties, not by asking
the CLI to generate a second set of components.

## How a component is written

Variants with `cva`, a `data-slot` attribute for styling hooks, `cn()` merging a
`className` prop last so callers can override:

```tsx
function Panel({ className, tone = "default", ...props }: Props) {
  return <div data-slot="panel" className={cn(panelVariants({ tone }), className)} {...props} />
}
```

The `data-slot` is not decoration. The theme targets it (`[data-slot="button"]`
gets the ornate letterforms), and it lets a parent style a child it does not own:
`has-data-[slot=card-footer]:pb-0`.

Size and spacing come from a CSS variable on the component
(`[--card-spacing:--spacing(4)]`, `data-[size=sm]:[--card-spacing:--spacing(3)]`)
rather than repeating padding values through the subcomponents. One variable moves
the whole component's rhythm.

## The panel

Every content block is a glass panel. The four classes that make it glass are in
`references/theme.md`; this is the full section shell, numbered, with a status:

```tsx
<section className="flex min-h-0 flex-col rounded-2xl bg-card text-card-foreground
                    shadow-(--glass-shadow) ring-1 ring-(--glass-edge)
                    backdrop-blur-xl backdrop-saturate-150 desk:overflow-hidden">
  <div className="shrink-0 border-b border-primary/15 px-4 pt-3 pb-2.5 desk:pt-2.5 desk:pb-2">
    <div className="flex items-center gap-2">
      <span className="font-mono text-xl leading-none font-bold text-primary tabular-nums">{index}</span>
      <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
      {status && <StatusPill {...status} className="ms-auto" />}
    </div>
    <p className="mt-0.5 text-xs text-muted-foreground desk:truncate">{caption}</p>
  </div>
  <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 desk:p-3">{children}</div>
</section>
```

The header is `shrink-0` and the body is `min-h-0 flex-1`, which is what lets the
body scroll inside a locked grid cell instead of stretching the panel.

## The status pill

Four states, colour plus dot plus word:

```tsx
const toneClass = {
  idle:        "bg-slate-100 text-slate-700 border-slate-300",
  running:     "bg-blue-100 text-blue-900 border-blue-300",
  done:        "bg-green-100 text-green-900 border-green-300",
  malfunction: "bg-red-100 text-red-900 border-red-300",
}
const dotClass = {
  idle: "bg-slate-400", running: "bg-blue-600", done: "bg-green-600", malfunction: "bg-red-600",
}
```

The pill is `font-mono text-xs uppercase` in Latin and `rtl:font-sans` in Arabic,
since uppercase and mono mean nothing to Arabic letterforms. The running dot gets
a `motion-safe:animate-ping` halo.

These four are the only saturated colours in the design. Everything else is navy,
which is what makes a red pill land.

The names are console-shaped, but the four tones are really "nothing is
happening", "something is in flight", "it finished well" and "it needs a human".
Most domains map onto them cleanly, so map rather than invent a fifth tone:

| Domain state | Tone |
| --- | --- |
| queued, draft, not started, N selected | idle |
| running, syncing, pending review, unsaved | running |
| done, active, saved, verified, paid | done |
| failed, expired, over SLA, irreversible | malfunction |

If a state genuinely does not fit, prefer the nearest tone plus a clearer word
over a new colour. A fifth hue costs more than a vague label does.

## Empty states

Every panel that waits on something shows what will fill it, not a blank box:
artwork, a short heading, one sentence. Use shadcn's `Empty` family
(`EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`), with the shedding
pattern in `references/layout.md` for short windows.

Artwork is a small inline SVG that uses `currentColor` and sits in a
`text-primary` container, so it is tinted by the theme rather than carrying its
own colour.

## Switches

A settings page is mostly switches, and the mirroring trap here is real: the
obvious `translate-x` thumb animation moves the thumb the wrong way in RTL, since
the transform is physical. Drive the thumb from `inset-inline-start` instead, so
it follows the document direction for free:

```jsx
<button
  type="button"
  role="switch"
  aria-checked={on}
  onClick={() => setOn(!on)}
  className="relative h-6 w-11 shrink-0 rounded-full ring-1 ring-(--glass-edge)
             transition-colors aria-checked:bg-primary bg-muted"
>
  <span className="absolute top-0.5 size-5 rounded-full bg-background shadow-sm
                   transition-[inset-inline-start] start-0.5
                   in-aria-checked:start-[1.375rem]" />
</button>
```

The row around it is the clickable target, with the label and its one-line
explanation on the reading-start side and the switch at `ms-auto`. A switch that
cannot be turned off (a security alert, a required notice) stays on and gets
`disabled` plus a muted track, rather than being hidden: people look for it.

## Dialogs

A dialog is a popover surface, not a panel: `bg-popover` at its higher opacity,
because text over a scrim needs more backing than text over the wash. The scrim
is navy at low alpha with a light blur, never black:

```
backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm
m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-popover p-0 shadow-2xl
```

A native `<dialog>` with `showModal()` gets focus trapping, Escape and the
backdrop for free, which is worth more than a custom implementation.

Destructive confirmations ask the person to type the word rather than just
clicking again, and the confirm button stays disabled until they do.

## Forms and controls

- Inputs that hold ids, codes or numbers: `font-mono`, `dir="ltr"`,
  `inputMode="numeric"`, `className="text-center"`. Centred because a short code in
  a wide field looks stranded at one end, and LTR because digits do not mirror.
- A placeholder shows a realistic example, not a description of the format.
- Labels are real `<Label htmlFor>`, never placeholder-as-label: the placeholder
  disappears exactly when someone needs it.
- Destructive actions use `variant="destructive"`. Stock shadcn ships that as a
  solid red slab, so the house version overrides it in `button.tsx`. Without this
  override the convention and the code disagree:

  ```ts
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 " +
    "focus-visible:border-destructive/40 focus-visible:ring-destructive/20 " +
    "dark:bg-destructive/20 dark:hover:bg-destructive/30",
  ```

  A tinted button still reads as dangerous next to an all-navy page, and it does
  not shout across a panel the way a solid slab does.

## Focus rings

The theme sets `outline-ring/50` globally, so most controls need nothing. If a
component does remove it, put something back.

One Tailwind v4 trap: `outline-none` now sets an outline with a width but
`outline-style: none`, so a `focus-visible:outline-2` on top of it renders
nothing. The v4 spelling for "remove the outline entirely" is `outline-hidden`.
If a focus ring is mysteriously invisible, this is usually why.

## Icons and marks

Lucide, at the size the component sets (`[&_svg:not([class*='size-'])]:size-4`),
never larger than the text beside them.

A brand mark is an inline SVG component with `aria-hidden="true"`, filling from
theme classes (`fill-primary`, `stroke-primary-foreground`) rather than hardcoded
hex, so it follows a hue change. Keep marks free of national, ministry or company
emblems: the same interface should sit equally well in a government room and a
private firm's office.
