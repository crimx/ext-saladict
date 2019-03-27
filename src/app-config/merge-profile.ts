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
    // legacy
    const unfold = get(oldProfile, `dicts.all.${id}.defaultUnfold`)
    if (isBoolean(unfold)) {
      set(base, `dicts.all.${id}.defaultUnfold`, {
        chinese: unfold,
        english: unfold,
        japanese: unfold,
        korean: unfold,
        french: unfold,
        spanish: unfold,
        deutsch: unfold,
        others: unfold,
      })
    } else {
      mergeBoolean(`dicts.all.${id}.defaultUnfold.chinese`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.english`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.japanese`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.korean`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.french`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.spanish`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.deutsch`)
      mergeBoolean(`dicts.all.${id}.defaultUnfold.others`)
    }

    // legacy
    const chs = get(oldProfile, `dicts.all.${id}.selectionLang.chs`)
    if (isBoolean(chs)) {
      set(base, `dicts.all.${id}.selectionLang.chinese`, chs)
    } else {
      mergeBoolean(`dicts.all.${id}.selectionLang.chinese`)
    }
    const eng = get(oldProfile, `dicts.all.${id}.selectionLang.eng`)
    if (isBoolean(eng)) {
      set(base, `dicts.all.${id}.selectionLang.english`, eng)
    } else {
      mergeBoolean(`dicts.all.${id}.selectionLang.english`)
    }
    mergeBoolean(`dicts.all.${id}.selectionLang.japanese`)
    mergeBoolean(`dicts.all.${id}.selectionLang.korean`)
    mergeBoolean(`dicts.all.${id}.selectionLang.french`)
    mergeBoolean(`dicts.all.${id}.selectionLang.spanish`)
    mergeBoolean(`dicts.all.${id}.selectionLang.deutsch`)
    mergeBoolean(`dicts.all.${id}.selectionLang.others`)

    mergeNumber(`dicts.all.${id}.preferredHeight`)
    mergeNumber(`dicts.all.${id}.selectionWC.min`)
    mergeNumber(`dicts.all.${id}.selectionWC.max`)

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

  /*-----------------------------------------------*\
      Patch
  \*-----------------------------------------------*/
  // hjdict changed korean location
  if (base.dicts.all.hjdict.options.chsas as string === 'kor') {
    base.dicts.all.hjdict.options.chsas = 'kr'
  }

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
