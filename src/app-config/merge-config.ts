import { getDefaultConfig, AppConfig, AppConfigMutable } from '@/app-config'
import { defaultAllDicts } from './dicts'

import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import set from 'lodash/set'
import { isFirefox } from '@/_helpers/saladict'

export default mergeConfig

export function mergeConfig(
  oldConfig: AppConfig,
  baseConfig?: AppConfig
): AppConfig {
  const base: AppConfigMutable = baseConfig
    ? JSON.parse(JSON.stringify(baseConfig))
    : getDefaultConfig()

  /* ----------------------------------------------- *\
      Pre-merge Patch Start
  \* ----------------------------------------------- */
  let oldVersion = oldConfig.version

  if (oldVersion < 13) {
    ;(oldConfig as AppConfigMutable).showedDictAuth = true
  }

  if (oldVersion <= 9) {
    oldVersion = 10
    ;['mode', 'pinMode', 'panelMode', 'qsPanelMode'].forEach(mode => {
      base[mode].holding.shift = false
      base[mode].holding.ctrl = !!oldConfig[mode]['ctrl']
      base[mode].holding.meta = !!oldConfig[mode]['ctrl']
      delete oldConfig[mode]['ctrl']
    })
  }

  rename('tripleCtrlPreload', 'qsPreload')
  rename('tripleCtrlAuto', 'qsAuto')
  rename('tripleCtrlLocation', 'qsLocation')
  rename('tripleCtrlStandalone', 'qsStandalone')
  rename('tripleCtrlHeight', 'qssaHeight')
  rename('tripleCtrlSidebar', 'qssaSidebar')
  rename('tripleCtrlPageSel', 'qssaPageSel')
  /* ----------------------------------------------- *\
      Pre-merge Patch End
  \* ----------------------------------------------- */

  Object.keys(base).forEach(key => {
    switch (key) {
      case 'langCode':
        merge('langCode', val => /^(zh-CN|zh-TW|en)$/.test(val))
        break
      case 'pdfWhitelist':
      case 'pdfBlacklist':
      case 'whitelist':
      case 'blacklist':
        merge(key, val => Array.isArray(val))
        break
      case 'searhHistory':
      case 'searchHistory':
        base.searchHistory = oldConfig[key]
        break
      case 'searhHistoryInco':
      case 'searchHistoryInco':
        base.searchHistoryInco = oldConfig[key]
        break
      case 'mode':
      case 'pinMode':
      case 'panelMode':
      case 'qsPanelMode':
        if (key === 'mode') {
          mergeBoolean('mode.icon')
        }
        mergeBoolean(`${key}.direct`)
        mergeBoolean(`${key}.double`)
        mergeBoolean(`${key}.holding.alt`)
        mergeBoolean(`${key}.holding.shift`)
        mergeBoolean(`${key}.holding.ctrl`)
        mergeBoolean(`${key}.holding.meta`)
        mergeBoolean(`${key}.instant.enable`)
        merge(`${key}.instant.key`, val =>
          /^(direct|ctrl|alt|shift)$/.test(val)
        )
        mergeNumber(`${key}.instant.delay`)
        break
      case 'qsPreload':
        merge(
          'qsPreload',
          val => val === '' || val === 'clipboard' || val === 'selection'
        )
        break
      case 'qsLocation':
        merge(
          'qsLocation',
          val =>
            val === 'CENTER' ||
            val === 'TOP' ||
            val === 'RIGHT' ||
            val === 'BOTTOM' ||
            val === 'LEFT' ||
            val === 'TOP_LEFT' ||
            val === 'TOP_RIGHT' ||
            val === 'BOTTOM_LEFT' ||
            val === 'BOTTOM_RIGHT'
        )
        break
      case 'baPreload':
        merge(
          'baPreload',
          val => val === '' || val === 'clipboard' || val === 'selection'
        )
        break
      case 'ctxTrans':
        forEach(base.ctxTrans, (value, key) => {
          mergeBoolean(`ctxTrans.${key}`)
        })
        break
      case 'language':
        forEach(base.language, (value, key) => {
          mergeBoolean(`language.${key}`)
        })
        break
      case 'autopron':
        merge('autopron.cn.dict', id => defaultAllDicts[id])
        merge('autopron.en.dict', id => defaultAllDicts[id])
        merge('autopron.en.accent', val => val === 'us' || val === 'uk')
        merge('autopron.machine.dict', id => defaultAllDicts[id])
        merge(
          'autopron.machine.src',
          val => val === 'trans' || val === 'searchText'
        )
        break
      case 'contextMenus':
        forEach(oldConfig.contextMenus.all, (dict, id) => {
          if (typeof dict === 'string') {
            // default menus
            if (base.contextMenus.all[id]) {
              mergeString(`contextMenus.all.${id}`)
            }
          } else {
            // custom menus
            mergeString(`contextMenus.all.${id}.name`)
            mergeString(`contextMenus.all.${id}.url`)
          }
        })
        mergeSelectedContextMenus('contextMenus')
        break
      case 'dictAuth':
        merge('dictAuth', Boolean)
        break
      default:
        switch (typeof base[key]) {
          case 'string':
            mergeString(key)
            break
          case 'boolean':
            mergeBoolean(key)
            break
          case 'number':
            mergeNumber(key)
            break
          default:
            console.error(
              new Error(`merge config: missing handler for '${key}'`)
            )
        }
        break
    }
  })

  /* ----------------------------------------------- *\
      Post-merge Patch Start
  \* ----------------------------------------------- */
  oldVersion = oldConfig.version

  if (oldVersion <= 10) {
    oldVersion = 11
    base.contextMenus.selected.unshift('view_as_pdf')
  }
  if (oldVersion <= 11) {
    oldVersion = 12
    base.blacklist.push([
      '^https://stackedit.io(/.*)?$',
      'https://stackedit.io/*'
    ])
  }
  if (oldVersion <= 13) {
    oldVersion = 14
    if (!isFirefox && !base.contextMenus.selected.includes('caiyuntrs')) {
      base.contextMenus.selected.unshift('caiyuntrs')
    }
  }

  if (oldConfig.language['minor'] === false) {
    base.language.japanese = false
    base.language.korean = false
    base.language.french = false
    base.language.spanish = false
    base.language.deutsch = false
  }

  if (base.panelMaxHeightRatio < 1) {
    base.panelMaxHeightRatio = Math.round(base.panelMaxHeightRatio * 100)
  }
  /* ----------------------------------------------- *\
      Post-merge Patch End
  \* ----------------------------------------------- */

  return base

  function rename(oldName: string, newName: string): void {
    if (
      !Object.prototype.hasOwnProperty.call(oldConfig, newName) &&
      Object.prototype.hasOwnProperty.call(oldConfig, oldName)
    ) {
      ;(oldConfig as AppConfigMutable)[newName] = oldConfig[oldName]
    }
  }

  function mergeSelectedContextMenus(path: string): void {
    const selected = get(oldConfig, [path, 'selected'])
    if (Array.isArray(selected)) {
      if (selected.length === 0) {
        set(base, [path, 'selected'], [])
      } else {
        const allContextMenus = get(base, [path, 'all'])
        const arr = selected.filter(id => allContextMenus[id])
        if (arr.length > 0) {
          set(base, [path, 'selected'], arr)
        }
      }
    }
  }

  function mergeNumber(path: string): void {
    return merge(path, isNumber)
  }

  function mergeString(path: string): void {
    return merge(path, isString)
  }

  function mergeBoolean(path: string): void {
    return merge(path, isBoolean)
  }

  function merge(path: string, predicate: (val) => boolean): void {
    const val = get(oldConfig, path)
    if (predicate(val)) {
      set(base, path, val)
    }
  }
}
