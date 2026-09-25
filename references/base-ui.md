# Base UI, and Radix in older projects

Read this when writing JSX against the component layer: composing a trigger,
styling a state, building a form, placing a popup. New projects are on Base UI
(the `base-nova` style). Older ones are often on Radix (`new-york`, `radix-*`);
the last section maps one onto the other.

- [Where the real API lives](#where-the-real-api-lives)
- [`render`, not `asChild`](#render-not-aschild)
- [Styling on state](#styling-on-state)
- [Parts that must be grouped](#parts-that-must-be-grouped)
- [Select shows labels only if you give it the items](#select-shows-labels-only-if-you-give-it-the-items)
- [Placing popups](#placing-popups)
- [Controlled state](#controlled-state)
- [Forms](#forms)
- [Writing a component the Base UI way](#writing-a-component-the-base-ui-way)
- [Radix to Base UI](#radix-to-base-ui)

## Where the real API lives

Do not work from memory; both libraries moved fast through 2025. The installed
package carries its own docs, matched to the version in `package.json`:

- `node_modules/@base-ui/react/docs/react/components/<name>.md`: anatomy, props,
  data attributes, CSS variables, examples.
- `node_modules/@base-ui/react/docs/react/handbook/`: `composition.md`,
  `forms.md`, `styling.md`, `animation.md`.
- `npx shadcn@latest docs <component>`: the shadcn wrapper's usage and variants.

The package was renamed from `@base-ui-components/react` to `@base-ui/react`.
Older snippets on the web use the old name; always import from the new one.

## `render`, not `asChild`

Base UI replaces Radix's `asChild` with a `render` prop. The part keeps its
behaviour and renders as the element you pass:

```tsx
<DropdownMenuTrigger render={<Button variant="outline" />}>
  {t.actions}
</DropdownMenuTrigger>

<DropdownMenuItem render={<a href="/settings" />}>{t.settings}</DropdownMenuItem>
```

Whatever you pass must forward its `ref` and spread the props it receives onto
the DOM node; every shadcn component already does. Triggers can nest, which is
how one button opens a dialog and shows a tooltip:

```tsx
<TooltipTrigger render={<DialogTrigger render={<Button size="icon" />} />} />
```

`render` also takes a function, `(props, state) => element`, when the content
should change with the part's state.

**A link styled as a button is a link.** Base UI's `Button` enforces button
semantics, and its docs say plainly not to render an `<a>` through it. Put the
button classes on the anchor instead:

```tsx
<a href="/reports" className={buttonVariants({ variant: "outline" })}>{t.reports}</a>
```

`nativeButton={false}` is for the other case: a non-button tag (a `div`) that
should behave as a button.

## Styling on state

Base UI exposes state as bare data attributes, which Tailwind v4 reads as
variants directly:

| State | Attribute | Tailwind |
| --- | --- | --- |
| Popup open / closed | `data-open`, `data-closed` | `data-open:` |
| Trigger whose popup is open | `data-popup-open` | `data-popup-open:` |
| Entering / leaving (for transitions) | `data-starting-style`, `data-ending-style` | `data-starting-style:opacity-0` |
| Checked (checkbox, switch, radio, menu item) | `data-checked`, `data-unchecked` | `data-checked:` |
| Keyboard or pointer highlight in a list | `data-highlighted` | `data-highlighted:` |
| Pressed toggle | `data-pressed` | `data-pressed:` |
| Disabled | `data-disabled` | `data-disabled:` |
| Where a popup landed | `data-side`, `data-align` | `data-[side=top]:` |
| Field validity | `data-valid`, `data-invalid`, `data-touched`, `data-dirty` | `data-invalid:` |

Style state here rather than tracking it in React. It is what the shadcn files
already do, and it keeps the house motion rule (colour transitions only) in CSS.

## Parts that must be grouped

A label inside a menu or a select belongs to a group, and Base UI enforces it:

```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>{t.incident(42)}</DropdownMenuLabel>
    <DropdownMenuItem>{t.assignToMe}</DropdownMenuItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

A `DropdownMenuLabel` (or `ContextMenuLabel`, `MenubarLabel`, `SelectLabel`)
outside its group throws, and in a production build the error is only a number
(`Base UI error #31`) while the whole React tree unmounts to a blank page. Radix
allowed a loose label, so this is the first thing to break when porting.

## Select shows labels only if you give it the items

The trigger's `SelectValue` renders before the list has ever opened, so it cannot
read the labels from the items inside the popup. Pass them to the root, or the
trigger shows the raw value (`riyadh` instead of "الرياض"):

```tsx
const regions = { all: t.allRegions, riyadh: t.riyadh }

<Select items={regions} defaultValue="all">
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    {Object.entries(regions).map(([value, label]) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

`items` also accepts an array of `{ value, label }`. Build it from the dictionary
so the labels switch with the language.

## Placing popups

The shadcn content components forward `side`, `align`, `sideOffset` and
`alignOffset` to Base UI's positioner. `side` accepts the logical values
`inline-start` and `inline-end` as well as the physical four. Use the logical
ones for anything that should sit beside its trigger in reading order, a popover
next to a list row, a hint next to a field, so it swaps sides in Arabic with no
code. `top` and `bottom` are direction-free already.

Useful variables on the popup, for sizing: `--anchor-width` (the trigger's
width, which is how a select matches its trigger), `--available-height`,
`--available-width` and `--transform-origin`.

Popups are portalled to `<body>`, so they inherit `dir` from `<html>`. Keep the
direction there. If a project sets `dir` on a subtree only, pass `dir` to each
popup's content as well, or its slide-in animation runs the wrong way.

## Controlled state

`open` and `onOpenChange` as usual, with one difference from Radix: the callback
gets a second argument saying why it changed:

```tsx
<Dialog
  open={open}
  onOpenChange={(next, details) => {
    if (!next && details.reason === "outside-press" && dirty) return // keep unsaved work
    setOpen(next)
  }}
>
```

Reasons include `trigger-press`, `outside-press`, `escape-key`, `close-press`,
`focus-out` and `imperative-action`. That is the clean way to stop a stray click
from discarding a half-filled form.

## Forms

Two layers, and they do different jobs:

- **shadcn `Field`** (`FieldSet`, `FieldGroup`, `Field`, `FieldLabel`,
  `FieldDescription`, `FieldError`) is layout and presentation. `Field` has
  `orientation="vertical" | "horizontal" | "responsive"`; responsive is the
  settings-row pattern (label beside the control on desktop, above it on a
  phone). `FieldError` shows the messages you give it, as children or an
  `errors` array. It does not validate anything.
- **Validation** comes from Base UI's `Form` and `Field` (native constraint
  validation, a `validate` function per field, `Form errors` for errors returned
  by the server, keyed by field name) or from react-hook-form / TanStack Form
  feeding `FieldError`. Read `handbook/forms.md` before choosing; do not build a
  third system in component state.

Whichever validates, error text lives in the dictionary like any other string,
and a field with an error gets `aria-invalid`, which the shadcn inputs already
style with the destructive ring.

The two layers compose through `render`: Base UI's parts do the work, shadcn's
parts do the look.

```tsx
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { Form } from "@base-ui/react/form"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

<Form onFormSubmit={submit}>
  <FieldPrimitive.Root
    name="hours"
    validate={(value) => (isValidHours(value) ? null : t.errors.hoursInvalid)}
    render={<Field />}
  >
    <FieldPrimitive.Label render={<FieldLabel />}>{t.hoursLabel}</FieldPrimitive.Label>
    <Input dir="ltr" inputMode="decimal" />
    <FieldPrimitive.Description render={<FieldDescription />}>{t.hoursHint}</FieldPrimitive.Description>
    <FieldPrimitive.Error className="text-sm text-destructive" />
  </FieldPrimitive.Root>
</Form>
```

- A field whose control is a Select has no native input to label, so its label
  is `FieldPrimitive.Label nativeLabel={false} render={<div />}`.
- A plain `<textarea>` (the shadcn `Textarea`) is not registered with the field
  on its own; wrap it as `FieldPrimitive.Control render={<Textarea />}`.
- Validate with `validate` functions rather than native `required`, `min` or
  `step`: native constraints show the browser's own message, in the browser's
  language, unless every validity state gets its own `Error match`. A `validate`
  function returns dictionary text.

## Writing a component the Base UI way

A component of your own that should accept `render` like the rest uses Base UI's
`useRender` and `mergeProps` (the registry's `Marker` is written this way):

```tsx
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

function Panel({ className, render, ...props }: useRender.ComponentProps<"section">) {
  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">({ className: cn(panelVariants(), className) }, props),
    state: { slot: "panel" },
  })
}
```

Every key in `state` becomes a data attribute, so `state: { slot: "panel" }` is
what puts `data-slot="panel"` on the element, the hook the theme and parents
target (`references/components.md`).

## Radix to Base UI

For a project on a Radix style, everything in this skill still applies: the
theme keys on `data-slot`, which the Radix styles use with the same names. What
changes is the JSX:

| Radix | Base UI |
| --- | --- |
| `asChild` | `render={<El />}` |
| `data-[state=open]:` / `data-[state=closed]:` | `data-open:` / `data-closed:` |
| `data-[state=checked]:` | `data-checked:` |
| `data-[state=active]:` (tabs) | `data-active:` |
| Keyframe enter/exit on `data-state` | `data-starting-style` / `data-ending-style` transitions (the shadcn files handle both) |
| `onOpenChange(open)` | `onOpenChange(open, details)` |
| A menu label anywhere in the content | Inside its group, or it throws |
| `SelectValue` finds the label itself | `items` on the root |
| `--radix-select-trigger-width`, `--radix-popover-content-available-height` | `--anchor-width`, `--available-height` |
| `side="left" \| "right"` only | also `inline-start` / `inline-end` |
| `HoverCard` | `PreviewCard` (the shadcn file keeps the name `hover-card`) |
| `<DirectionProvider dir>` (the shadcn file also takes `direction`, but `dir` stays required by its type) | `<DirectionProvider direction>` |

Do not mix the two in one project. `components.json` names the style; a Base UI
snippet pasted into a Radix project compiles only as far as the first `render`
prop. Moving a whole project from Radix to Base UI is a rewrite of
`components/ui` plus every `asChild` and `data-[state=...]` in the app, so do it
deliberately, as its own change, never as a side effect of restyling.
