/**
 * Bilingual strings, Arabic first.
 *
 * Copy to src/lib/i18n.ts and replace the entries. The shape matters more than
 * the contents: `ar` is typed as `Dict = typeof en`, so the day someone adds an
 * English string and forgets the Arabic one, the build fails instead of the
 * interface quietly falling back to English in front of an Arabic reader.
 *
 * Strings that interpolate are functions, not template concatenation at the
 * call site, because Arabic and English put the pieces in different orders and
 * only the dictionary knows the right order for its language.
 */

export type Lang = "en" | "ar"

const STORAGE_KEY = "app.lang"

/**
 * Arabic is the default for everyone, including a first visit: only a saved
 * English choice overrides it. Ship index.html with lang="ar" dir="rtl" to
 * match, so a first paint has no LTR frame to flash.
 */
export function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar"
  } catch {
    return "ar"
  }
}

export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // private windows and blocked storage: the choice just does not persist
  }
}

/** Call before the first render in main.tsx, and again whenever the language changes. */
export function applyDocumentLang(lang: Lang) {
  const root = document.documentElement
  root.lang = lang
  root.dir = lang === "ar" ? "rtl" : "ltr"
}

const en = {
  brand: "Brand",
  docTitle: "Brand · what this page is",

  /** The label on the toggle is the language it switches TO, not the current one. */
  switchTo: "العربية",
  /** One letter on a phone, where the full word costs a header row. */
  switchToShort: "ع",
  switchToLang: "ar" as Lang,
  switchToLabel: "Switch to Arabic",

  timeZone: "AST",
  timeZoneShort: "AST",

  // Interpolation lives in the dictionary, where word order is known.
  greeting: (name: string) => `Welcome, ${name}`,
  itemCount: (n: number) => (n === 1 ? "1 item" : `${n} items`),
}

type Dict = typeof en

const ar: Dict = {
  brand: "العلامة",
  docTitle: "العلامة · ما تعرضه هذه الصفحة",

  switchTo: "English",
  switchToShort: "E",
  switchToLang: "en",
  switchToLabel: "التبديل إلى الإنجليزية",

  timeZone: "بتوقيت السعودية",
  timeZoneShort: "السعودية",

  greeting: (name: string) => `أهلًا ${name}`,
  itemCount: (n: number) => (n === 1 ? "عنصر واحد" : `${n} عناصر`),
}

export const STRINGS: Record<Lang, Dict> = { en, ar }
