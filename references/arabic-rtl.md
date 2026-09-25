# Arabic-first and RTL

Read this when a project has an Arabic interface, which in this house style is the
default rather than an added locale.

- [The two rules that prevent most bugs](#the-two-rules-that-prevent-most-bugs)
- [Wiring the language](#wiring-the-language)
- [Next.js](#nextjs)
- [What the CLI's RTL mode covers, and what it does not](#what-the-clis-rtl-mode-covers-and-what-it-does-not)
- [Writing the dictionary](#writing-the-dictionary)
- [The language toggle](#the-language-toggle)
- [Things that mirror badly](#things-that-mirror-badly)
- [Arabic typography](#arabic-typography)
- [Checking it](#checking-it)

## The two rules that prevent most bugs

**Use logical properties, never physical ones.** `ms-auto` not `ml-auto`, `ps-4`
not `pl-4`, `text-start` not `text-left`, `border-s` not `border-l`. Tailwind maps
these to `margin-inline-start` and friends, so the whole layout mirrors itself when
`dir="rtl"` and there is nothing to maintain per language. A single `ml-auto` in a
header is how a control ends up on the wrong side in Arabic.

**Let direction decide sides, not the language.** Code that reads
`lang === "ar" ? "left" : "right"` is a bug waiting for the next language. Put the
element where it belongs in flow order and let the mirror handle the rest. Worked
example: to sit a language toggle at the row's outer edge, make it the last child
of the end-aligned group. It lands right in English and left in Arabic on its own.

## Wiring the language

1. `index.html` ships `<html lang="ar" dir="rtl">` and Arabic `<title>`,
   `description` and Open Graph tags. Link-preview crawlers do not run JavaScript,
   so whatever is in the static HTML is what gets shared.
2. `main.tsx` calls `applyDocumentLang(initialLang())` **before** `createRoot`, so
   an Arabic reader never sees an LTR frame flash.
3. The app holds `lang` in state, seeded from `initialLang()`, and an effect applies
   `applyDocumentLang(lang)`, sets `document.title`, and calls `rememberLang(lang)`.
4. Wrap the app in `DirectionProvider` from `@/components/ui/direction`
   (`npx shadcn@latest add direction`). The components read direction from this
   context, not from the `dir` attribute, for arrow-key navigation, sliders,
   submenu sides and logical popup sides, so `dir` on `<html>` alone is not
   enough. `useDirection()` reads it back anywhere a physical prop has to be
   chosen (a chart axis, a current sidebar's `side`). The prop differs by base:
   - Base UI: `<DirectionProvider direction={lang === "ar" ? "rtl" : "ltr"}>`.
   - Radix: `<DirectionProvider dir={...}>`. The Radix file also accepts
     `direction`, but Radix's own `dir` stays a required prop, so `direction`
     alone fails the type check.

`assets/i18n.ts` in this skill is the file for steps 2-4. It is written for a
single-page app, where the language lives in `localStorage` and is applied before
React mounts.

Keep `dir` on `<html>`, not on a wrapper `<div>`. Popups are portalled to
`<body>` and inherit direction from the root; with `dir` only on a subtree they
render LTR and their slide-in animations run the wrong way.

## Next.js

A server-rendered app cannot read `localStorage` before the first paint, so the
language lives in a cookie and the server writes `lang` and `dir` itself:

```tsx
// app/layout.tsx
import { cookies } from "next/headers"
import { Providers } from "./providers"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = (await cookies()).get("lang")?.value === "en" ? "en" : "ar"
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body>
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  )
}
```

```tsx
// app/providers.tsx
"use client"

import { createContext, useContext } from "react"
import { DirectionProvider } from "@/components/ui/direction"
import { STRINGS, type Lang } from "@/lib/i18n"

const LangContext = createContext<Lang>("ar")
export const useLang = () => useContext(LangContext)
export const useT = () => STRINGS[useLang()]

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <LangContext.Provider value={lang}>
      <DirectionProvider direction={lang === "ar" ? "rtl" : "ltr"}>{children}</DirectionProvider>
    </LangContext.Provider>
  )
}
```

The toggle sets the cookie (`document.cookie = "lang=en; path=/;
max-age=31536000"`) and calls `router.refresh()`: the server re-renders with the
new `lang` and `dir` and React swaps them in without a page reload. Tested with
Next 16: no hydration warnings, and the document stays the same one across the
switch. Also:

- **Server components** read the language the same way the layout does, from
  `cookies()`, and take strings from `STRINGS[lang]`. Keep that read in a
  server-only helper: `next/headers` cannot be imported into client code.
- **Metadata**: the Arabic `<title>`, description and Open Graph tags that
  `index.html` carries in Vite come from `generateMetadata`, reading the same
  cookie, so a shared link previews in the reader's language.
- Reading `cookies()` in the root layout makes every route render on request
  rather than at build time. For an app behind a login that costs nothing; for a
  public marketing site, weigh it against putting the language in the URL.
- Keep `initialLang`'s rule, Arabic unless English was chosen, and the typed
  dictionary from `assets/i18n.ts`. Drop its `localStorage` functions and
  `applyDocumentLang`; the server owns `<html>` here.

## What the CLI's RTL mode covers, and what it does not

With `"rtl": true`, every file the CLI writes into `components/ui` uses logical
properties, gets `rtl:` counterparts for its transforms (switch thumbs, centred
popups), mirrors its slide-in directions, and flips the directional icons it
ships (menu and select chevrons, breadcrumb separators, pagination and calendar
arrows, the sidebar trigger). An existing project gets the same with
`npx shadcn@latest migrate rtl -y`, which also sets the flag.

It does not reach:

- **Your own code.** Pages and feature components are converted by hand, and any
  directional icon you pass into a component (`ChevronLeftIcon` in a Back button,
  an arrow in a link) needs `rtl:rotate-180` from you.
- **Props that name a physical side.** `Sidebar` and `Sheet` take
  `side="left" | "right"`. In current files that stays physical, so choose it
  from `useDirection()`, which is the direction deciding, not the language. In
  older `new-york` files the migration turns the positioning logical and `side`
  with it; there, pass a constant. How to tell is in the sidebar entry of
  `references/catalog.md`.
- **Its own reversal on spacing, if it adds one.** In Tailwind v4, `space-x-*`
  and `divide-x-*` are already logical (they set `margin-inline-*` and
  `border-inline-*`), so they mirror by themselves. If the migration adds
  `rtl:space-x-reverse` or `rtl:divide-x-reverse` anywhere, delete it: it flips
  them back.
- **Third-party layout inside components.** Recharts never mirrors (`reversed`
  on the x axis, `orientation="right"` on the y axis in RTL); the carousel's
  embla engine needs `opts={{ direction }}` and its arrow keys swapped;
  react-day-picker wants `dir`, `locale` and a `numerals` choice. Each is in
  `references/catalog.md`.
- **Content that must not mirror.** Codes, ids, phone numbers, key combinations
  and OTP slots need `dir="ltr"`; media never flips.
- **English text inside the generated components.** Several ship hardcoded
  English accessible names: the dialog's close button ("Close"), the toast's
  ("Close toast"), `SidebarTrigger` and `SidebarRail` ("Toggle Sidebar"), and the
  phone sidebar's sheet title and description. Pass a dictionary label where the
  component takes one (`aria-label` on `SidebarTrigger`; `showCloseButton={false}`
  plus your own `DialogClose` with a label). Where the string is baked in, as in
  the phone sheet's title, editing `sidebar.tsx` to take it from a prop is a
  legitimate edit: the rule against editing generated files is about styling,
  which the theme covers, not about text a screen reader speaks. Search
  `components/ui` for `sr-only` and `aria-label` after adding components.

## Writing the dictionary

`const ar: Dict = { ... }` where `type Dict = typeof en`. The type is the whole
point: a missing Arabic string is a build error, not an English word sitting in an
Arabic sentence in production.

Strings that interpolate are functions on the dictionary, not concatenation at the
call site, because the pieces land in a different order per language and only the
dictionary knows its own order:

```ts
verifiedBy: (name: string) => `Physically confirmed by ${name}.`
verifiedBy: (name: string) => `تم التأكيد ميدانيًا من ${name}.`
```

When a string has to be assembled from parts with different styling, return an
array of pieces and let the component render them, rather than building JSX in the
dictionary.

Keep user-facing Arabic free of Latin text where anything reads it aloud (a voice
agent, a screen reader): transliterate brand names instead.

## The language toggle

- The label is the language it switches **to**, not the current one: in English it
  reads "العربية", in Arabic it reads "English". Someone who cannot read the
  current language needs to recognise the target.
- On a phone it collapses to one letter, "ع" or "E", in a 40px square button. Four
  names, a clock and two controls do not fit a 360px row otherwise.
- The accessible name has to contain the word people can see, because voice
  control users say what is on screen. So no `aria-label` with a different
  sentence: on a phone, hide the letter from assistive tech and keep the full
  word for it, `<span aria-hidden="true" className="sm:hidden">ع</span>` next to
  `<span className="max-sm:sr-only">العربية</span>`. The sentence ("Switch to
  Arabic") goes in `title`.
- Put `lang={targetLang}` on the label span, so the browser picks the right face
  for a word in the other script.

## Things that mirror badly

- **Numbers, clocks, ids, phone numbers**: keep them LTR with `dir="ltr"` on the
  element, and `font-mono tabular-nums` so digits do not jump as they tick.
- **Latin brand names inside Arabic text**: fine inline, but mind that a mono font
  stack needs Thmanyah in it for the Arabic around them to match.
- **Icons with direction** (arrows, chevrons, back buttons): these must flip.
  `rtl:rotate-180` is what the CLI uses and is right for chevrons and straight
  arrows. An icon that is not symmetric top to bottom (reply, undo, a curved
  arrow) would come out upside down that way; mirror it with `rtl:-scale-x-100`.
  Icons without direction (a lock, a clock, a play button) must not flip.
- **Charts and timelines**: they read start-to-end like text. A pipeline that runs
  left to right in English runs right to left in Arabic; use grid order rather than
  absolute positions so it mirrors with the document.

## Arabic typography

- No `tracking-*` in Arabic: the theme neutralises it, because letter-spacing
  breaks the joins between letters.
- Arabic text runs taller than Latin at the same size. Leading that looks generous
  in English is usually right in Arabic; do not tighten it to match a mockup.
- Status pills and short labels get the ornate feature set in Arabic only, where
  the swash forms look deliberate; in Latin they would look decorative.
- Arabic words are longer than their English equivalents about as often as they are
  shorter. Test both languages at the same breakpoint before calling a layout done.
- **Digits and calendar are a house decision, made once**: Latin digits and the
  Gregorian calendar in both languages, so dates, clocks and ids all read the
  same way and a mono column lines up. `ar-SA` on its own gives Hijri dates and
  Arabic-Indic digits, so spell it out:
  `new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", ...)`. A project that
  wants Hijri or Arabic-Indic digits changes those two extensions in one place,
  not per screen.
- **Plurals have six forms**, and they come from `Intl.PluralRules("ar")`, not
  from `n === 1`: one item is "عنصر واحد", two is "عنصران", 3 to 10 is
  "عناصر", 11 to 99 is "عنصرًا", and 100 goes back to "عنصر". The pattern is in
  `assets/i18n.ts`.

## Checking it

Switch the language and look for: anything that did not mirror, a control that
changed sides when it should not have, a number that reversed, a row that wrapped
in one language but not the other, and a label that now overflows its button.
