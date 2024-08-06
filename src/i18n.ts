import type { Locale } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
import { arraySorted, isRecord } from 'zeed'

/** Some settings may override locale, else empty string and look into browser settings. */
const initialLocale = localStorage.getItem('locale') ?? 'en'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
export const i18n = createI18n({
  legacy: false,
  locale: '',
  messages: { }, // en },
  fallbackLocale: 'en',
})

const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../locales/*.json')).map(([path, loadLocale]) => [path.match(/([\w-]*)\.json$/)?.[1], loadLocale]),
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

export const availableLocales = arraySorted(Object.keys(localesMap))

const loadedLanguages: string[] = []

function setI18nLanguage(lang: Locale) {
  i18n.global.locale.value = lang as any
  if (typeof document !== 'undefined')
    document.querySelector('html')?.setAttribute('lang', lang)
  return lang
}

/** Strip properties with value `undefined` in place */
function deepFix(a: any) {
  if (isRecord(a)) {
    for (const p in a) {
      if (a[p] == null || a[p] === '') {
        delete a[p]
        continue
      }
      deepFix(a[p])
    }
  }
  return a
}

async function loadLanguageAsync(lang: string): Promise<Locale> {
  // If the same language
  if (i18n.global.locale.value === lang)
    return setI18nLanguage(lang)

  // If the language was already loaded
  if (loadedLanguages.includes(lang))
    return setI18nLanguage(lang)

  // If the language hasn't been loaded yet
  const messages = await localesMap[lang]()
  const m = deepFix(messages.default)
  i18n.global.setLocaleMessage(lang, m)
  loadedLanguages.push(lang)
  return setI18nLanguage(lang)
}

export async function switchLocale(lang: string) {
  // log(`locale from ${i18n.global.locale.value} to ${lang}`)
  await loadLanguageAsync(lang)
}

/** Access or modify locale manually (unused) */
// export const locale = computed<string>({
//   get: () => i18n.global.locale.value,
//   async set(value) {
//     log('setLocale to', value)
//     localStorage.setItem('locale', value)
//     await switchLocale(value)
//     // i18n.global.locale.value = value || navigator?.language?.slice(0, 2)
//   },
// })

void loadLanguageAsync('en')
void switchLocale(initialLocale)
