import { Profile, ProfileMutable, getDefaultProfile } from './profiles'

import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import set from 'lodash/set'

export function mergeProfile (oldProfile: Profile, baseProfile?: Profile): Profile {
  const base: ProfileMutable = baseProfile
    ? JSON.parse(JSON.stringify(baseProfile))
    : getDefaultProfile(oldProfile.id)

  mergeString('name')
  mergeString('mtaAutoUnfold')

  mergeSelectedDicts('dicts')

  forEach(base.dicts.all, (dict, id) => {
    mergeBoolean(`dicts.all.${id}.defaultUnfold`)
    mergeNumber(`dicts.all.${id}.preferredHeight`)
    mergeNumber(`dicts.all.${id}.selectionWC.min`)
    mergeNumber(`dicts.all.${id}.selectionWC.max`)
    mergeBoolean(`dicts.all.${id}.selectionLang.eng`)
    mergeBoolean(`dicts.all.${id}.selectionLang.chs`)
    mergeBoolean(`dicts.all.${id}.selectionLang.japanese`)
    mergeBoolean(`dicts.all.${id}.selectionLang.korean`)
    mergeBoolean(`dicts.all.${id}.selectionLang.french`)
    mergeBoolean(`dicts.all.${id}.selectionLang.spanish`)
    mergeBoolean(`dicts.all.${id}.selectionLang.deutsch`)
    mergeBoolean(`dicts.all.${id}.selectionLang.others`)
    if (dict['options']) {
      forEach(dict['options'], (value, opt) => {
        if (isNumber(value)) {
          mergeNumber(`dicts.all.${id}.options.${opt}`)
        } else if (isBoolean(value)) {
          mergeBoolean(`dicts.all.${id}.options.${opt}`)
        } else if (isString(value)) {
          mergeString(`dicts.all.${id}.options.${opt}`)
        }
      })
    }
  })

  return base

  function mergeSelectedDicts (path: string): void {
    const selected = get(oldProfile, [path, 'selected'])
    if (Array.isArray(selected)) {
      if (selected.length === 0) {
        set(base, [path, 'selected'], [])
      } else {
        const allDict = get(base, [path, 'all'])
        const arr = selected.filter(id => allDict[id])
        if (arr.length > 0) {
          set(base, [path, 'selected'], arr)
        }
      }
    }
  }

  function mergeNumber (path: string): void {
    return merge(path, isNumber)

  }

  function mergeString (path: string): void {
    return merge(path, isString)
  }

  function mergeBoolean (path: string): void {
    return merge(path, isBoolean)
  }

  function merge (path: string, predicate: (val) => boolean): void {
    const val = get(oldProfile, path)
    if (predicate(val)) {
      set(base, path, val)
    }
  }
}
