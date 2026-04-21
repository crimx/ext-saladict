import { LangCode } from '@/app-config'

export type StaticNamespace =
  | 'background'
  | 'common'
  | 'content'
  | 'langcode'
  | 'menus'
  | 'options'
  | 'popup'
  | 'wordpage'

const req = require.context(
  '@/_locales',
  true,
  /\/(background|common|content|langcode|menus|options|popup|wordpage)\.ts$/
)

export function getStaticLocale(lang: LangCode, ns: StaticNamespace) {
  const localeModule = req(`./${lang}/${ns}.ts`)
  return localeModule.locale || localeModule
}
