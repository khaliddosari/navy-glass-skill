# Components

Read this when writing a component of your own that has to match the rest, or
checking that a project's component layer is set up the house way. For the
components the registry ships, `references/catalog.md` has an entry each.

- [The stack](#the-stack)
- [components.json](#componentsjson)
- [How a component is written](#how-a-component-is-written)
- [The panel](#the-panel)
- [The status pill](#the-status-pill)
- [Empty states](#empty-states)
- [Switches](#switches)
- [Dialogs](#dialogs)
- [Forms and controls](#forms-and-controls)
- [Icons and marks](#icons-and-marks)

## The stack

React 19 + TypeScript, Vite or Next.js, Tailwind v4, shadcn in the `base-nova`
style (built on Base UI rather than Radix), `lucide-react` for icons, the Base UI
`toast` for notifications, `class-variance-authority` for variants, `cn` for class
merging. Older projects on a Radix style (`new-york`, `radix-nova`) or on
`sonner` stay on them; everything here still applies.

Current registry files import `cn` straight from the `cn` package and
`src/lib/utils.ts` re-exports it; files added by an older CLI import it from
`@/lib/utils`. It is the same function either way. `cn` resolves conflicting
utilities, so a `className` passed in wins over the component's own classes.

Path alias `@` → `./src`, set in both the bundler config and `tsconfig`
(`paths`). `shadcn init` writes both; an older project may need them added by
hand before the CLI will run.

## components.json

The setup commands are in `SKILL.md`. Whatever the project's age, the file should
end up with:

```json
{
  "style": "base-nova",
  "iconLibrary": "lucide",
  "rtl": true,
  "menuColor": "default",
  "tailwind": { "cssVariables": true }
}
```

- `"rtl": true`, even for a project that is English only today. The CLI then
  writes every component with logical properties and `rtl:` flips. It does not
  generate a second set of components; the same files work in both directions.
  In an existing project, `npx shadcn@latest migrate rtl -y` sets it and converts
  the existing files.
- `"menuColor": "default"`. The translucent setting forces destructive menu items
  to navy with `!important`; `theme.css` already gives menus the glass.
- `"style"` is whatever the project already uses. A Radix style is fine; do not
  switch styles as part of a restyle.

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

function StatusPill({ label, tone, className }: { label: string; tone: Tone; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 gap-1.5 font-mono text-xs uppercase rtl:font-sans", toneClass[tone], className)}
    >
      <span aria-hidden="true" className="relative flex size-1.5">
        {tone === "running" && (
          <span className={cn("absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping", dotClass[tone])} />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", dotClass[tone])} />
      </span>
      {label}
    </Badge>
  )
}
```

The pill is a `Badge`, so it carries `data-slot="badge"`, and that is how the
theme gives it the ornate letterforms in Arabic. A pill built from a plain `span`
needs `data-slot="badge"` added by hand, or it loses them. The `outline` variant
is only the frame; the colour comes from the tone classes, which is why the other
badge variants are not used for status.

It is `font-mono text-xs uppercase` in Latin and `rtl:font-sans` in Arabic, since
uppercase and mono mean nothing to Arabic letterforms. In English the uppercase
mono makes it wide ("BEING HANDLED" is about 9rem), so size grid columns with the
longest English label, not the Arabic one. The running dot gets a
`motion-safe:animate-ping` halo.

**`font-ornate` and `cn`.** `cn` merges conflicting utilities, and it reads
`font-ornate` as a font-family class. In one `cn()` call, `font-ornate` and
`font-sans` (or `font-mono`) cancel each other and only the last survives. Put
`font-ornate` on an inner span, or on an element with no other font class.

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

A settings page is mostly switches. In a project, use the shadcn `Switch`: its
thumb moves with `translate-x`, which is physical, but with `"rtl": true` the CLI
adds the `rtl:` counterpart, so it slides the right way in Arabic. A project that
cannot run the RTL migration yet has thumbs that slide backwards; migrate rather
than patch.

In a standalone page with no component library, build it by driving the thumb
from `inset-inline-start`, which follows the document direction for free:

```jsx
<button
  type="button"
  role="switch"
  aria-checked={on}
  onClick={() => setOn(!on)}
  className="relative h-6 w-11 shrink-0 rounded-full ring-1 ring-(--glass-edge)
             transition-colors aria-checked:bg-primary bg-input"
>
  <span className="absolute top-0.5 size-5 rounded-full bg-background shadow-sm
                   transition-[inset-inline-start] start-0.5
                   in-aria-checked:start-[1.375rem]" />
</button>
```

The off track is `bg-input`, the same as the stock switch. `bg-muted` looks
right in isolation and disappears on a card: a pale track under a pale thumb.

The row around it is the clickable target, with the label and its one-line
explanation on the reading-start side and the switch at `ms-auto`. A switch that
cannot be turned off (a security alert, a required notice) stays on and gets
`disabled` plus a muted track, rather than being hidden: people look for it.

## Dialogs

A dialog is a popover surface, not a panel: `bg-popover` at its higher opacity,
because text over a scrim needs more backing than text over the wash. The scrim
is navy at low alpha with a light blur, never black.

In a project, that is the shadcn `Dialog` or `AlertDialog` with nothing added:
`theme.css` turns its overlay navy (`--scrim`) and gives the content the blur and
`--popup-shadow`. Base UI supplies the focus trap, Escape, scroll lock and the
portal. Older Radix styles (`new-york`) make the content opaque `bg-background`;
that reads fine, so leave it rather than editing the file.

In a standalone page, a native `<dialog>` with `showModal()` gets the focus trap,
Escape and the backdrop for free, and takes the same tokens, blur included:

```
backdrop:bg-(--scrim) backdrop:backdrop-blur-sm
m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-popover p-0 shadow-(--popup-shadow)
backdrop-blur-xl backdrop-saturate-150
```

Destructive confirmations ask the person to type the word rather than just
clicking again, and the confirm button stays disabled until they do.

## Forms and controls

- Inputs that hold ids, codes or numbers: `font-mono`, `dir="ltr"`,
  `inputMode="numeric"`, `className="text-center"`. Centred because a short code in
  a wide field looks stranded at one end, and LTR because digits do not mirror.
- A placeholder shows a realistic example, not a description of the format.
- Labels are real `<Label htmlFor>`, never placeholder-as-label: the placeholder
  disappears exactly when someone needs it.
- Destructive actions use `variant="destructive"`, which is a tint, not a solid
  red slab. `base-nova` already ships it that way. Older styles (`new-york` and
  its generation) ship the slab, so in those projects replace the variant in
  `button.tsx` with the tinted one:

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
