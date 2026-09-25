# Layout and density

Read this when building a page that has to hold a lot at once: a console, a
dashboard, an operations screen. Most of this file is about that case. Ordinary
pages, settings, profiles, onboarding, a form someone fills in once, use the
first section and can skip the rest.

- [The other layout: a page of panels](#the-other-layout-a-page-of-panels)
- [The shape of the layouts](#the-shape-of-the-layouts)
- [The desk variants](#the-desk-variants)
- [Shedding content instead of scrolling](#shedding-content-instead-of-scrolling)
- [Phone first, and what that costs](#phone-first-and-what-that-costs)
- [Density patterns](#density-patterns)

## The other layout: a page of panels

Not every screen is a console, and forcing the viewport lock onto a settings page
makes it worse, not more on-brand. The ordinary layout is a scrolling column of
the same glass panels:

```jsx
<main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
  <header className="mb-6">
    <p className="text-xs text-muted-foreground">{breadcrumb}</p>
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
  </header>
  <div className="flex flex-col gap-5">{panels}</div>
</main>
```

- `max-w-5xl` for a single column of panels, `max-w-7xl` when there is a side
  rail. Wider than that and a form field stretches to an unreadable line length.
- `gap-5` between panels: enough that each reads as its own surface over the
  wash, tight enough that they stay one document.
- Numbered panel headers still earn their place here, because they give the side
  rail something to link to and tell someone how much is left.
- A side rail (`lg:grid-cols-[15rem_minmax(0,1fr)]`, rail `lg:sticky lg:top-24`)
  is worth it past three or four panels. Below `lg` it becomes a horizontally
  scrolling row of chips rather than stacking, which would push the content down
  a whole screen. Give each panel `scroll-mt-6 lg:scroll-mt-24` so a rail link
  does not park its heading under the sticky header, and mark the last item
  current once the page reaches its bottom, since the last panels can never
  scroll up to the top.
- Panel footers hold the actions for that panel (Cancel, Save) rather than one
  page-wide save bar, so it is obvious what a button applies to.

The page still scrolls normally: no `h-dvh`, no `overflow-hidden`, no `desk:`
grid. Use those only when someone is watching the screen rather than working
down it.

Beside a shadcn sidebar, the page sits inside `SidebarInset`, which already
renders a `<main>`; there, the outer element above is a `div`, so the page does
not end up with two `<main>` landmarks.

## The shape of the layouts

Two layouts, one codebase:

- **Below desk**: a scrolling column of panels, full width, comfortable padding.
  This is what phones and laptops in a window get.
- **At desk**: the viewport locks. `h-dvh`, `overflow-hidden`, a grid of panels
  each sized by its cell, and anything long scrolls *inside* its panel. Nobody
  scrolls a control room screen to find out what is happening.

```jsx
<div className="min-h-screen desk:flex desk:h-dvh desk:flex-col desk:overflow-hidden">
  <header className="lg:sticky lg:top-0 desk:static desk:shrink-0"> … </header>
  <main className="flex flex-col gap-6 px-4 py-6 desk:grid desk:min-h-0 desk:flex-1
                   desk:grid-cols-3 desk:grid-rows-[minmax(0,1.35fr)_minmax(0,1fr)] desk:gap-3 desk:py-3">
```

`min-h-0` on every flex and grid descendant that should scroll internally: without
it a flex child refuses to shrink below its content and the whole page grows
instead.

Lock the viewport only when there is enough to fill it. Four cards under a locked
grid leave a lake of empty wash below them, which looks like a page that failed
to load rather than a console at rest. If the content does not fill the screen,
use the scrolling page layout above and let the panels size to their contents.

## The desk variants

Width alone is the wrong test for a console layout. A wide but short window, which
is what a laptop with a browser toolbar actually is, cannot hold two rows of
panels; locking the viewport there crushes them. So the variant tests both:

```css
@custom-variant desk {
  @media (min-width: 80rem) and (min-height: 40rem) { @slot; }
}
@custom-variant desk-short {   /* the console on a short laptop window */
  @media (min-width: 80rem) and (min-height: 40rem) and (max-height: 52rem) { @slot; }
}
@custom-variant desk-tight {   /* around 720px tall, the shortest supported */
  @media (min-width: 80rem) and (min-height: 40rem) and (max-height: 47rem) { @slot; }
}
```

These ship inside `assets/theme.css`, so `desk:` works as soon as the theme is
pasted; they are reproduced here so you can see what the variant actually tests.
`desk-short` and `desk-tight` are where secondary text gives up space first:
`desk-tight:line-clamp-1` on a description that was two lines, a caption hidden,
padding cut from `p-4` to `p-3`.

One trap when overriding `desk:` with `desk-tight:` on the same element: a
"none"-style utility does not always win. `desk-tight:overflow-y-auto` does beat
`desk:overflow-hidden`, but `desk-tight:grid-rows-none` against
`desk:grid-rows-3` silently loses. Where that happens, override with a real
value rather than a reset: `desk-tight:grid-rows-[repeat(3,min-content)]`.

## Shedding content instead of scrolling

When a panel is too short for its contents, the answer is to drop the least
important thing, not to introduce a scrollbar in a 6rem box. Container queries make
the panel ask about its own height rather than the window's:

```css
@custom-variant box-short { @container placeholder (max-height: 11rem) { @slot; } }
@custom-variant box-tiny  { @container placeholder (max-height: 5.5rem) { @slot; } }
@custom-variant box-micro { @container placeholder (max-height: 2.5rem) { @slot; } }
```

```jsx
<div className="desk:@container-size desk:[container-name:placeholder]">
  <div className="box-micro:hidden">           {/* the whole block goes last */}
    <div className="box-short:hidden">{art}</div>   {/* artwork goes first */}
    <h3>{title}</h3>                                {/* the heading always stays */}
    <p className="box-tiny:hidden">{body}</p>       {/* then the description */}
  </div>
</div>
```

The order is the point: artwork, then description, then everything. The heading
survives longest because a labelled empty box is informative and an unlabelled one
is a bug report.

`placeholder` is a container name, not a keyword: use your own (`card`, `feed`),
the same in the variant and in `container-name`. These three variants are not in
`theme.css`; add them to the project's stylesheet when a screen needs them.

**A grid of cards that fills a locked panel** is the commonest console case: N
cards should fill the panel, and past that the panel scrolls inside. Make the
panel body a size container and size the rows from its height:

```jsx
<div className="min-h-0 flex-1 overflow-y-auto desk:@container-size">
  <div className="grid gap-3 sm:grid-cols-2 desk:grid-cols-4
                  desk:auto-rows-[calc((100cqh-1.5rem)/3)]">   {/* 3 rows; 1.5rem = two gap-3 gaps */}
    {cards}
  </div>
</div>
```

Three rows fill the panel exactly, a fourth scrolls inside it, and a filtered
view with two cards keeps normal-sized cards and empty space rather than two
giant ones. Each card can be its own container for the shedding above.

## Phone first, and what that costs

The phone is not a shrunken desktop; it is the layout that has to give things up.
Decisions that repeat across projects:

- A header that wraps to two rows on a phone is not sticky there. Pinning a third
  of a phone screen to show a logo is a bad trade. `lg:sticky lg:top-0`.
- Long labels get a short form on phones rather than being dropped: full names
  become first names, "بتوقيت السعودية" becomes "السعودية", a worded button
  becomes one letter. Render both spans and switch with `sm:hidden` /
  `hidden sm:inline`, so the desktop text is untouched.
- Controls stay at least 40px tall on a phone (`h-10 lg:h-8`): 32px is comfortable
  with a mouse and too small with a thumb. That means inputs and selects as well
  as buttons, at the same heights, so a form footer lines up.
- Check 360px, not just 390px. The difference is one wrapped row often enough to
  matter.
- Prefer reordering the DOM over `order-*` utilities when the order should hold at
  every width, so the tab order keeps matching what people see. The one accepted
  exception is the header nav: between brand and actions on desktop, on its own
  row on a phone. No single DOM order does both, so it is `order-last` on the
  phone (`order-last lg:order-0`) and the desktop order in the DOM.

## Density patterns

**Label over value, fixed height.** A grid of these has a known height, so a panel
of facts never scrolls. The full value goes in `title` for hover.

```jsx
<div className="min-w-0">
  <dt className="truncate text-xs text-muted-foreground">{label}</dt>
  <dd className="mt-0.5 truncate text-sm leading-snug font-medium" title={full}>{value}</dd>
</div>
```

**Numbered section panels.** Each panel carries its step number in mono at
`text-xl`, the title, and a status pill pushed to the end with `ms-auto`. The
number makes a grid of panels read as a sequence rather than a wall.

**Status colours, four states.** Grey idle, blue running, green done, red
malfunction: the conventions an operator already reads without a legend. Always
pair the colour with a dot *and* a word, so colour is never the only cue. A
running state gets `motion-safe:animate-ping` on the dot, which is the one piece of
motion in the whole design.

**Truncate rather than wrap in dense grids**, and give the element a `title`.
Wrapping changes a panel's height, which in a locked grid pushes something else
off the screen.
