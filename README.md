# Navy Glass UI

A Claude Code skill that builds and restyles web
frontends in one consistent look: a light navy theme, translucent glass panels over
a soft gradient wash, Thmanyah typography, and an Arabic-first interface that mirrors
properly in both languages.

It sits on top of [shadcn/ui](https://ui.shadcn.com) (the `base-nova` style, built on
[Base UI](https://base-ui.com)), and it also restyles older shadcn projects on Radix.

## What you get

- **One theme file** (`assets/theme.css`) that turns stock shadcn components navy and
  glass without editing them: panels, menus, selects, dialogs, sheets, toasts, the
  sidebar and charts.
- **Arabic and English that mirror correctly**: logical properties throughout, the
  shadcn CLI's RTL mode, a typed two-language dictionary, and the places where
  mirroring needs a hand (charts, sidebars, codes and ids).
- **A house answer for every shadcn component**, in `references/catalog.md`: what
  the theme already does, what to add, what breaks in Arabic, and when not to use it.
- **Setup for new projects and fixes for old ones**: Vite or Next.js from scratch,
  or an existing project on Tailwind v3, Radix shadcn, or no shadcn at all.
- **Dense console layouts** that fill one screen on a laptop and still work at 360px
  on a phone.

## Install

Clone it into your Claude Code skills folder, under the skill's name:

```bash
# macOS / Linux
git clone https://github.com/khaliddosari/navy-glass-skill.git ~/.claude/skills/navy-glass-ui

# Windows (PowerShell)
git clone https://github.com/khaliddosari/navy-glass-skill.git "$env:USERPROFILE\.claude\skills\navy-glass-ui"
```

To use it in one project only, clone it into that project's `.claude/skills/navy-glass-ui`
instead. Update later with `git pull` inside that folder.

## Use

Claude reaches for the skill on its own when you ask for frontend work, for example:

- "Start a new Vite project for a small operations team, Arabic first with an English toggle."
- "Restyle this page to match my usual look, and make it ready for Arabic."
- "Add a settings screen to this app."
- "Build me a standalone HTML dashboard I can open from disk."

You can also call it directly with `/navy-glass-ui`.

## What's inside

| Path | What it is |
| --- | --- |
| `SKILL.md` | The entry point: the four decisions behind the look, setup, restyling, and the checks before calling a screen done. |
| `assets/theme.css` | The theme. Pasted at the end of a project's stylesheet, never retyped. |
| `assets/i18n.ts` | The bilingual dictionary template, with Arabic plurals done properly. |
| `references/catalog.md` | One entry per shadcn component, plus the Base UI parts shadcn does not wrap. |
| `references/base-ui.md` | Working with Base UI (`render`, state attributes, forms, popups), and how it maps to Radix. |
| `references/arabic-rtl.md` | Direction wiring for Vite and Next.js, the dictionary, the language toggle, and what needs mirroring by hand. |
| `references/theme.md` | Why the palette and the glass are built the way they are, charts, the sidebar, type, dark mode. |
| `references/layout.md` | Pages of panels, locked console layouts, and phone-first decisions. |
| `references/components.md` | Writing your own components so they match. |
| `evals/evals.json` | Test prompts and assertions for measuring the skill with Anthropic's skill-creator. |

## Requirements

- Tailwind CSS v4. A v3 project upgrades first with `npx @tailwindcss/upgrade`.
- React for the component guidance. The theme itself is plain CSS plus Tailwind, and
  it also runs in a single HTML file through Tailwind's browser build.

## Fonts

The theme loads Thmanyah Sans and Thmanyah Serif Display from the
[khaliddosari/thmanyah-fonts](https://github.com/khaliddosari/thmanyah-fonts)
repository through jsDelivr, pinned to a tag so the files cannot change under a
shipped app. The typefaces are Thmanyah's. To avoid the CDN, download the `woff2`
files into your project and point the `src:` URLs in `theme.css` at them.
