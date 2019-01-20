import { RawLocale, RawLocales } from '@/_helpers/i18n'
import { getALlDicts } from '@/app-config/dicts'

export interface RawDictLocales {
  name: RawLocale
  options?: RawLocales
}

export const dictsLocales: RawLocales = Object.keys(getALlDicts())
  .reduce((result, id) => {
    const locale: RawDictLocales = require('@/components/dictionaries/' + id + '/_locales')
    result[id] = locale.name
    const options = locale.options
    if (options) {
      Object.keys(options).forEach(opt => {
        result[`${id}_${opt}`] = options[opt]
      })
    }
    return result
  }, {})

export default dictsLocales
