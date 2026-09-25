# Arabic-first and RTL

Read this when a project has an Arabic interface, which in this house style is the
default rather than an added locale.

- [The two rules that prevent most bugs](#the-two-rules-that-prevent-most-bugs)
- [Wiring the language](#wiring-the-language)
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
4. If the component library needs to know the direction, hand it down. For Base UI:
   `<DirectionProvider direction={lang === "ar" ? "rtl" : "ltr"}>` around the app.

`assets/i18n.ts` in this skill is the file for steps 2-4.

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
- The `aria-label` always carries the full sentence ("Switch to Arabic"), so the
  one-letter version costs nothing to a screen reader.
- Put `lang={targetLang}` on the label span, so the browser picks the right face
  for a word in the other script.

## Things that mirror badly

- **Numbers, clocks, ids, phone numbers**: keep them LTR with `dir="ltr"` on the
  element, and `font-mono tabular-nums` so digits do not jump as they tick.
- **Latin brand names inside Arabic text**: fine inline, but mind that a mono font
  stack needs Thmanyah in it for the Arabic around them to match.
- **Icons with direction** (arrows, chevrons, back buttons): these must flip.
  `rtl:-scale-x-100` on the icon, or pick the mirrored icon per direction.
  Icons without direction (a lock, a clock) must not flip.
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

## Checking it

Switch the language and look for: anything that did not mirror, a control that
changed sides when it should not have, a number that reversed, a row that wrapped
in one language but not the other, and a label that now overflows its button.
