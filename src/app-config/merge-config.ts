import { getDefaultConfig, AppConfig, AppConfigMutable } from '@/app-config'
import { getAllDicts } from './dicts'

import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import set from 'lodash/set'

const defaultAllDicts = getAllDicts()

export default mergeConfig

export function mergeConfig(
  oldConfig: AppConfig,
  baseConfig?: AppConfig
): AppConfig {
  const base: AppConfigMutable = baseConfig
    ? JSON.parse(JSON.stringify(baseConfig))
    : getDefaultConfig()

  // pre-merge patch start
  let oldVersion = oldConfig.version

  if (oldVersion <= 9) {
    oldVersion = 10
    ;['mode', 'pinMode', 'panelMode', 'qsPanelMode'].forEach(mode => {
      base[mode].holding.shift = false
      base[mode].holding.ctrl = !!oldConfig[mode]['ctrl']
      base[mode].holding.meta = !!oldConfig[mode]['ctrl']
      delete oldConfig[mode]['ctrl']
    })
  }
  // pre-merge patch end

  mergeBoolean('active')
  mergeBoolean('analytics')
  mergeBoolean('noTypeField')
  mergeBoolean('animation')

  merge('langCode', val => /^(zh-CN|zh-TW|en)$/.test(val))

  mergeNumber('panelWidth')
  mergeNumber('panelMaxHeightRatio')
  mergeString('panelCSS')
  mergeNumber('fontSize')
  mergeBoolean('pdfSniff')
  merge('pdfWhiltelist', val => Array.isArray(val))
  merge('pdfBlacklist', val => Array.isArray(val))
  mergeBoolean('searhHistory')
  mergeBoolean('searhHistoryInco')
  mergeBoolean('newWordSound')
  mergeBoolean('editOnFav')
  mergeBoolean('searchSuggests')

  mergeBoolean('mode.icon')
  mergeBoolean('mode.direct')
  mergeBoolean('mode.double')
  mergeBoolean('mode.holding.shift')
  mergeBoolean('mode.holding.ctrl')
  mergeBoolean('mode.holding.meta')
  mergeBoolean('mode.instant.enable')
  merge('mode.instant.key', val => /^(direct|ctrl|alt|shift)$/.test(val))
  mergeNumber('mode.instant.delay')

  mergeBoolean('pinMode.direct')
  mergeBoolean('pinMode.double')
  mergeBoolean('pinMode.holding.shift')
  mergeBoolean('pinMode.holding.ctrl')
  mergeBoolean('pinMode.holding.meta')
  mergeBoolean('pinMode.instant.enable')
  merge('pinMode.instant.key', val => /^(direct|ctrl|alt|shift)$/.test(val))
  mergeNumber('pinMode.instant.delay')

  mergeBoolean('panelMode.direct')
  mergeBoolean('panelMode.double')
  mergeBoolean('panelMode.holding.shift')
  mergeBoolean('panelMode.holding.ctrl')
  mergeBoolean('panelMode.holding.meta')
  mergeBoolean('panelMode.instant.enable')
  merge('panelMode.instant.key', val => /^(direct|ctrl|alt|shift)$/.test(val))
  mergeNumber('panelMode.instant.delay')

  mergeBoolean('qsPanelMode.direct')
  mergeBoolean('qsPanelMode.double')
  mergeBoolean('qsPanelMode.holding.shift')
  mergeBoolean('qsPanelMode.holding.ctrl')
  mergeBoolean('qsPanelMode.holding.meta')
  mergeBoolean('qsPanelMode.instant.enable')
  merge('qsPanelMode.instant.key', val => /^(direct|ctrl|alt|shift)$/.test(val))
  mergeNumber('qsPanelMode.instant.delay')

  mergeBoolean('bowlHover')
  mergeNumber('doubleClickDelay')

  mergeBoolean('tripleCtrl')
  merge(
    'tripleCtrlPreload',
    val => val === '' || val === 'clipboard' || val === 'selection'
  )
  mergeBoolean('tripleCtrlAuto')
  merge('tripleCtrlLocation', val => val >= 0 && val <= 8)
  mergeBoolean('tripleCtrlStandalone')
  mergeNumber('tripleCtrlHeight')
  mergeString('tripleCtrlSidebar')
  mergeBoolean('tripleCtrlPageSel')

  merge(
    'baPreload',
    val => val === '' || val === 'clipboard' || val === 'selection'
  )
  mergeBoolean('baAuto')
  mergeString('baOpen')

  forEach(base.ctxTrans, (value, id) => {
    mergeBoolean(`ctxTrans.${id}`)
  })

  mergeBoolean('language.chinese')
  mergeBoolean('language.english')
  mergeBoolean('language.japanese')
  mergeBoolean('language.korean')
  mergeBoolean('language.french')
  mergeBoolean('language.spanish')
  mergeBoolean('language.deutsch')
  mergeBoolean('language.others')

  merge('autopron.cn.dict', id => defaultAllDicts[id])
  merge('autopron.en.dict', id => defaultAllDicts[id])

  merge('autopron.en.accent', val => val === 'us' || val === 'uk')

  merge('whiltelist', val => Array.isArray(val))
  merge('blacklist', val => Array.isArray(val))

  mergeSelectedContextMenus('contextMenus')

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

  // post-merge patch start
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
  // post-merge patch end

  return base

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
