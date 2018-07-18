import { appConfigFactory, AppConfig, AppConfigMutable } from '@/app-config'
import forEach from 'lodash/forEach'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import get from 'lodash/get'
import set from 'lodash/set'

export function mergeConfig (config?: AppConfig, base?: AppConfig): AppConfig {
  if (!config) {
    return appConfigFactory()
  }

  return mergeHistorical(config, base)
}

export default mergeConfig

function mergeHistorical (config: AppConfig, baseConfig?: AppConfig): AppConfig {
  const base: AppConfigMutable = baseConfig
    ? JSON.parse(JSON.stringify(baseConfig))
    : appConfigFactory()

  mergeBoolean('active')
  mergeBoolean('noTypeField')
  mergeBoolean('animation')

  merge('langCode', val => /^(zh-CN|zh-TW|en)$/.test(val))

  mergeNumber('panelWidth')
  mergeNumber('panelMaxHeightRatio')
  mergeNumber('fontSize')
  mergeBoolean('pdfSniff')
  mergeBoolean('searhHistory')
  mergeBoolean('searhHistoryInco')
  mergeBoolean('newWordSound')
  mergeBoolean('editOnFav')

  mergeBoolean('mode.icon')
  mergeBoolean('mode.direct')
  mergeBoolean('mode.double')
  mergeBoolean('mode.ctrl')
  mergeBoolean('mode.instant.enable')
  merge('mode.instant.key', val => val === 'direct' || val === 'ctrl' || val === 'alt')
  mergeNumber('mode.instant.delay')

  mergeBoolean('pinMode.direct')
  mergeBoolean('pinMode.double')
  mergeBoolean('pinMode.ctrl')
  mergeBoolean('pinMode.instant.enable')
  merge('pinMode.instant.key', val => val === 'direct' || val === 'ctrl' || val === 'alt')
  mergeNumber('pinMode.instant.delay')

  mergeBoolean('panelMode.direct')
  mergeBoolean('panelMode.double')
  mergeBoolean('panelMode.ctrl')
  mergeBoolean('panelMode.instant.enable')
  merge('panelMode.instant.key', val => val === 'direct' || val === 'ctrl' || val === 'alt')
  mergeNumber('panelMode.instant.delay')

  mergeNumber('doubleClickDelay')

  mergeBoolean('tripleCtrl')
  merge('tripleCtrlPreload', val => val === '' || val === 'clipboard' || val === 'selection')
  mergeBoolean('tripleCtrlAuto')
  merge('tripleCtrlLocation', val => val >= 0 && val <= 8)

  merge('baPreload', val => val === '' || val === 'clipboard' || val === 'selection')
  mergeBoolean('baAuto')

  mergeBoolean('language.chinese')
  mergeBoolean('language.english')

  merge('autopron.cn.dict', id => base.dicts.all[id])
  merge('autopron.en.dict', id => base.dicts.all[id])
  merge('autopron.en.accent', val => val === 'us' || val === 'uk')

  merge('whiltelist', val => Array.isArray(val))
  merge('blacklist', val => Array.isArray(val))

  mergeSelectedDicts('dicts')
  mergeSelectedDicts('contextMenus')

  forEach(base.dicts.all, (dict, id) => {
    mergeString(`dicts.all.${id}.page`)
    mergeBoolean(`dicts.all.${id}.defaultUnfold`)
    mergeNumber(`dicts.all.${id}.preferredHeight`)
    mergeNumber(`dicts.all.${id}.selectionWC.min`)
    mergeNumber(`dicts.all.${id}.selectionWC.max`)
    mergeBoolean(`dicts.all.${id}.selectionLang.eng`)
    mergeBoolean(`dicts.all.${id}.selectionLang.chs`)
    if (dict['options']) {
      forEach(dict['options'], (value, opt) => {
        if (isNumber(value)) {
          mergeNumber(`dicts.all.${id}.options.${opt}`)
        } else if (isBoolean(value)) {
          mergeBoolean(`dicts.all.${id}.options.${opt}`)
        }
      })
    }
  })

  forEach(base.contextMenus.all, (dict, id) => {
    mergeString(`contextMenus.all.${id}`)
  })

  // patch
  switch (config.version) {
    case 6:
      base.dicts.all.google.selectionWC.max = 999999999999999
      base.dicts.all.youdao.selectionWC.max = 999999999999999
      break
    case 7:
      if (config['panelDbSearch'] === 'double') {
        base.panelMode.double = true
      } else if (config['panelDbSearch'] === 'ctrl') {
        base.panelMode.ctrl = true
      }
      break
    default:
      break
  }

  return base

  function mergeSelectedDicts (path: string): void {
    const selected = get(config, [path, 'selected'])
    if (Array.isArray(selected)) {
      const allDict = get(base, [path, 'all'])
      const arr = selected.filter(id => allDict[id])
      if (arr.length > 0) {
        set(base, [path, 'selected'], arr)
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
    const val = get(config, path)
    if (predicate(val)) {
      set(base, path, val)
    }
  }
}
