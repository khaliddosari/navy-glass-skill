# Component catalog

One entry for every component in the shadcn registry, plus the Base UI primitives
shadcn does not wrap. Read the entry before using a component. For props and
anatomy, read the real docs (`npx shadcn@latest docs <name>`, and
`node_modules/@base-ui/react/docs/react/components/<name>.md`); this file only
says what is different in the house style.

What every entry assumes, so it is not repeated 60 times:

- **Tokens do most of the work.** Every component reads `bg-card`, `bg-popover`,
  `text-muted-foreground` and so on, so pasting `theme.css` already makes it navy.
- **The theme styles by `data-slot`.** `Card` gets the full glass recipe, the
  sidebar rail gets glass, every popup surface (menus, selects, popovers, dialogs,
  sheets, drawers, toasts) gets a blur and the navy popup shadow, and dialog,
  sheet and drawer scrims turn navy. Nothing to add per component.
- **`"rtl": true` is on**, so the CLI wrote every file with logical properties and
  flips its own directional icons. The entries below only mention RTL where the
  CLI cannot help.
- **The props named are `base-nova`'s.** Older Radix files (`new-york`) lack some
  of them: no `data-icon` on buttons, no `size` on cards, no `variant="line"` on
  tabs, and state is `data-[state=active]` rather than `data-active`. In an older
  project, read the component file before using a prop from here.

Contents: [Surfaces](#surfaces-and-structure) ·
[Actions](#actions) · [Forms](#forms) · [Overlays](#overlays) ·
[Menus and navigation](#menus-and-navigation) ·
[Feedback](#feedback-and-status) · [Data](#data-display) ·
[Chat](#chat-and-assistant) · [Base UI only](#base-ui-primitives-shadcn-does-not-wrap)

## Surfaces and structure

- **card**: the panel. Glass comes from the theme. `size="sm"` in dense grids.
  When a card holds cards, weaken the outer one with `bg-card/55` so the stack
  does not turn into a white slab (`references/theme.md`, glass inside glass).
  The numbered console panel with a status pill is the section shell in
  `references/components.md`. In a `size="sm"` card, `CardTitle` is pinned small
  by a variant selector that beats a plain `text-3xl`, so a big stat value goes
  in its own element, not in the title. The theme owns the card's `box-shadow`, so `ring-*`
  and `shadow-*` on a `Card` do nothing: show focus and selection with `outline`
  (`has-focus-visible:outline-2`) or a bar on the start edge
  (`before:start-0`). A whole card that is clickable gets a real `<button>` as
  its title, stretched over the card with `after:absolute after:inset-0`, rather
  than an `onClick` on the card. Older styles also give the card a `border`;
  drop it (`border-0`) so the glass edge is the only line.
- **item**: rows in a list of things (a person, a device, a case): media, title,
  description, actions. Inside `ItemContent` use the label-over-value density
  pattern: truncate, full value in `title`. `ItemGroup` with `ItemSeparator`
  reads better than a table on a phone when rows have actions and few fields.
- **empty**: every panel that waits on something. Inline `currentColor` SVG in a
  `text-primary` media slot; the shedding order for short panels is in
  `references/layout.md`.
- **separator**: fine as is. Panel headers use a `border-primary/15` rule
  instead (the section shell), which is lighter.
- **aspect-ratio**: video feeds, maps, photos. Media never mirrors: no
  `rtl:` flips on anything inside it.
- **scroll-area**: the scrolling body of a locked `desk` panel. Every flex and
  grid parent above it needs `min-h-0`, or the page grows instead.
- **resizable**: split views at `desk` only; on a phone, stack the panes. The
  library computes a drag from the pointer's x position, so try a horizontal
  split's handle in Arabic before shipping it.
- **collapsible**, **accordion**: advanced settings, grouped filters, FAQs. Never
  hide a status or a primary action in a collapsed section on a console: nobody
  watching a screen opens things to find out what is wrong.

## Actions

- **button**: `default` is solid navy, `destructive` is already the tinted
  version in `base-nova` (older styles need the override in
  `references/components.md`). Icons go in with `data-icon="inline-start"` or
  `"inline-end"` so the padding adjusts on the right side; a directional icon you
  pass in needs `rtl:rotate-180` yourself. At least 40px tall on phones
  (`h-10 lg:h-8`). A link that looks like a button is an `<a>` with
  `buttonVariants()`, not a `Button` (`references/base-ui.md`).
- **button-group**: joined actions such as zoom, previous and next. The outer
  corners are logical, so the group rounds correctly in both directions.
- **toggle**, **toggle-group**: view switches (map or table, grid or list), two
  to four options. More than that is `tabs` or a `select`. Style the on state
  with `data-pressed:`.
- **kbd**: shortcut hints, desk only (`hidden sm:inline-flex`), since phones have
  no keyboard. A key combination reads left to right in both languages: wrap it
  in `dir="ltr"`.

## Forms

- **field**: the layout of every form: `FieldSet`, `FieldGroup`, `Field`,
  `FieldLabel`, `FieldDescription`, `FieldError`. `orientation="responsive"` is
  the settings row. It displays errors; it does not validate
  (`references/base-ui.md`, Forms).
- **form**: in `base-nova` this registry entry ships no file. Use `field` plus a
  validation layer.
- **label**: always a real `<Label htmlFor>`, never a placeholder standing in.
- **input**: ids, codes and numbers get `dir="ltr" inputMode="numeric"
  className="font-mono text-center"`. Email, URL and phone fields get
  `dir="ltr"` too: typed Latin in an RTL field puts punctuation at the wrong end.
- **input-group**: a prefix or suffix inside a field: currency, unit, search
  icon, clear button. Addons take `align="inline-start" | "inline-end"`, which
  mirror.
- **input-otp**: verification codes. Wrap it in `dir="ltr"`: a code is typed and
  read left to right in both languages, and without it the first slot lands on
  the right in Arabic.
- **textarea**: free text that could be either language gets `dir="auto"`, so
  each entry takes the direction of its first letter.
- **checkbox**, **radio-group**: the label is the click target (wrap, or
  `Field orientation="horizontal"`). Stock is fine.
- **switch**: stock is right; the CLI adds the flipped thumb translate. The
  settings-row pattern is in `references/components.md`.
- **slider**: fills from the start side under `DirectionProvider`. Always show
  the number beside it (`tabular-nums`), since a slider alone is imprecise.
- **select**: short fixed lists, under about ten. Pass `items` to the root, and
  keep `SelectLabel` inside `SelectGroup` (`references/base-ui.md`).
- **native-select**: forms used mostly on phones, or a long plain list: the
  operating system's picker beats any custom popup on a phone.
- **combobox**: lists you search (people, places, anything past ten options),
  with chips for multiple values.
- **calendar**: pass `locale` (`arSA` from `react-day-picker/locale`), `dir`, and
  choose `numerals` (`"latn"` or `"arab"`) once for the project, not per screen.
  The CLI already flips the month arrows. A date picker is `popover` plus
  `calendar`. Check the installed react-day-picker's docs before promising a
  Hijri calendar.
- **questionnaire**: a question at a time with choices and a free-text fallback:
  an assistant asking to clarify, an intake flow. One question per screen on a
  phone.

## Overlays

- **dialog**: a focused task that needs an answer. If the content could live in a
  panel, put it in the panel. Actions in the footer, the primary one at the end.
  To keep a stray click from discarding a half-filled form, check the close
  reason in `onOpenChange` (`references/base-ui.md`).
- **alert-dialog**: confirmations. Irreversible ones ask the person to type the
  word, with the confirm button disabled until they do.
- **sheet**: filters and details beside the page. Whether `side` is physical
  depends on the file, so look before choosing it (the same test as the sidebar
  below): current files position with `data-[side=right]:right-0`, which the RTL
  mode leaves physical, so derive it, a details sheet on the end side being
  `side={dir === "rtl" ? "left" : "right"}` with `dir` from `useDirection()`.
  Older `new-york` files position with `side === "right" && "... end-0"` after
  the migration, which makes `side` logical: pass `side="right"` for the end side
  in both languages and do not derive it.
- **drawer**: bottom sheets on phones. The usual responsive pair is a dialog from
  `sm` up and a drawer below it, for the same content.
- **popover**: small forms and pickers tied to a trigger. `side="inline-end"`
  puts it beside a row in reading order in both languages.
- **hover-card**: previews on hover, desk only. Touch has no hover, so nothing
  may exist only inside one.
- **tooltip**: names for icon-only buttons. Solid dark navy on purpose; the theme
  leaves it alone. Same touch rule as hover-card: the button also needs an
  `aria-label`.

## Menus and navigation

- **dropdown-menu**: row and header actions. `DropdownMenuLabel` inside
  `DropdownMenuGroup`, or the page crashes. `variant="destructive"` items stay
  red. Submenus open towards the inline end on their own. Shortcuts shown in
  `DropdownMenuShortcut` stay LTR.
- **context-menu**: right-click shortcuts on dense tables and maps. Every action
  in it must also exist somewhere visible, since touch and keyboard users never
  see it.
- **menubar**: desktop-application menus. Rarely right for a web console; a
  header with buttons and a dropdown or two is clearer.
- **navigation-menu**: a site header with rich dropdowns, for public pages. A
  console header uses plain links.
- **tabs**: `variant="line"` inside a panel, the default pill list for a page
  level switch. The active tab is `data-active`.
- **breadcrumb**: the trail on ordinary pages, above the title (the page-of-panels
  header in `references/layout.md`). The CLI flips the separator. On phones,
  collapse the middle with `BreadcrumbEllipsis`.
- **pagination**: under long tables. The CLI flips the arrows; the labels come
  from the dictionary.
- **command**: a command palette inside a dialog (Ctrl or Cmd plus K), or a
  searchable action list inside a panel. Results come from the dictionary.
- **sidebar**: the app's navigation rail, glass from the theme at weaker strength
  than a card, and on a phone, where it opens as a sheet, the popup glass. The
  theme also makes `SidebarInset` transparent: it ships an opaque background in
  every variant, which would hide the wash. `SidebarInset` renders a `<main>`,
  so the page inside it is a `div`, not a second `<main>`. `variant="floating"`
  matches the panels.

  Choosing `side` takes one look at `sidebar.tsx`, because the two generations
  behave oppositely under the RTL mode:
  - **Current files** (`base-nova`, `radix-nova`) position the rail with
    `data-[side=left]:left-0`. That stays physical, so derive it:
    `<Sidebar side={dir === "rtl" ? "right" : "left"} dir={dir}>`.
  - **Older `new-york` files** position it with
    `side === "left" ? "left-0 ..." : "right-0 ..."`, and the migration turns
    those into `start-0` and `end-0`. `side` is then logical: `side="left"` means
    the start side in both languages. Pass it as a constant. Deriving it on top
    flips it twice and parks the Arabic sidebar on the left, over the content.
    The migration lists this file as needing manual steps; the rail
    (`SidebarRail`) and the trigger icon are the remaining ones, covered in the
    RTL section of `npx shadcn@latest docs sidebar`.

## Feedback and status

- **badge**: neutral tags and counts (`secondary`, `outline`). The four status
  states use the status pill in `references/components.md`, not badge variants,
  so saturated colour stays reserved for status.
- **alert**: an inline message in a panel or above a form. When it reports a
  status, map it to one of the four tones rather than inventing a colour.
- **progress**: work with a known end, with the number beside it. Work with no
  known end is a running status pill, not a bar.
- **spinner**: inside a button while it submits. A panel waiting on data shows an
  empty state or a skeleton, never a spinner in the middle.
- **skeleton**: first load only, shaped like what it stands in for. It pulses,
  which is motion: on a console it should resolve in about a second or turn into
  an empty state.
- **toast**: the Base UI toast. First choice in new projects: no extra
  dependency, it sits on the end side through logical properties, and the theme
  gives it the popup blur. A toast confirms something that just happened;
  anything someone must act on belongs in a panel.
- **sonner**: projects already on it keep it. Its positions are physical, so
  pass `dir` and choose `position` from the direction (`"bottom-left"` in
  Arabic), which means the `Toaster` sits inside `DirectionProvider`. Its surface
  is `--popover` and the theme blurs it (by `data-sonner-toast`). Pass
  `theme="light"`: shadcn's `sonner.tsx` reads next-themes, and without a
  provider it follows the system into sonner's dark styles.

## Data display

- **table**: headers are `text-start` after the migration. Numeric columns get
  `text-end tabular-nums`; ids, times and phone numbers get `dir="ltr"`. In a
  locked panel, truncate cells with a `title` rather than letting rows wrap.
- **chart**: recharts through `ChartContainer`, with a `ChartConfig` pointing at
  `var(--chart-1)` to `var(--chart-5)`; the palette is in `references/theme.md`.
  Recharts does not mirror: in RTL set `reversed` on `XAxis` and
  `orientation="right"` on `YAxis`, both from `useDirection()`. Then keep the
  chart's SVG itself LTR, with `className="[&_.recharts-surface]:[direction:ltr]"`
  on `ChartContainer`: SVG text anchors follow the inherited direction, and under
  `dir="rtl"` the y-axis numbers otherwise draw into the plot over the first bar.
  The tooltip and legend are HTML and stay RTL. Recharts 3 sorts the legend
  alphabetically unless `ChartLegend` gets `itemSorter={null}`, which breaks the
  match with the stack order. A series that means failure uses the status red,
  not a chart hue. Legend and tooltip labels come from the dictionary.
- **avatar**: people. In Arabic the fallback is the first letter of the first
  name only: Arabic letters change shape when they join, so two initials read as
  a broken word. Group overlap mirrors through the CLI.
- **carousel**: rarely right in an operations interface; a grid shows everything
  at once. If used, embla needs `opts={{ direction: dir }}`, and the component's
  ArrowLeft and ArrowRight key handler is physical, so swap them in RTL.
- **marker**: a label inside a stream ("Today", "New since you left");
  `variant="separator"` centres it between two rules.

## Chat and assistant

- **message**, **message-scroller**, **bubble**, **attachment**: the parts of a
  chat or assistant transcript: messages grouped by sender, a scroller that
  stays pinned to the newest message, bubbles with reactions, file attachments.
  Sides are `align="start" | "end"`, which mirror. Message text gets `dir="auto"`,
  so in a mixed conversation each message runs in its own direction. Timestamps
  are LTR and `tabular-nums`.

## Direction

- **direction**: `DirectionProvider` and `useDirection`. Installed in every
  project at setup; `references/arabic-rtl.md` has the wiring.

## Base UI primitives shadcn does not wrap

Import these from `@base-ui/react/<name>` and write the wrapper the way
`references/components.md` describes (`data-slot`, `cva`, `cn`, tokens only).
Their docs are in the same `node_modules/@base-ui/react/docs` folder.

- **meter**: a value inside a known range (storage used, share of an SLA budget
  spent). Different from progress, which is a task moving towards done.
- **number-field**: numeric entry with stepper buttons and drag-to-scrub. It
  formats through `Intl`; pass `locale` to decide the digit shape, and keep the
  field `dir="ltr"`.
- **autocomplete**: free text with suggestions, where the answer does not have to
  be one of them. When it must be one of them, use combobox.
- **toolbar**: a row of buttons, toggles and selects with one tab stop and arrow
  keys between them (map and editor toolbars). Base UI mirrors the arrow keys
  under `DirectionProvider`.
- **checkbox-group**: checkboxes sharing one value array, with a parent
  "select all" that goes indeterminate.
- **fieldset**: a native fieldset with a stylable legend, for when shadcn's
  `FieldSet` layout is not enough.
- **otp-field**: Base UI's own code input, an alternative to `input-otp` without
  the extra dependency. Same `dir="ltr"` rule.
