import { appConfigFactory, AppConfig } from '@/app-config'
import _ from 'lodash'

export function mergeConfig (config?: AppConfig, base?: AppConfig): AppConfig {
  if (!config) {
    return appConfigFactory()
  }

  switch (config.version) {
    case 6: return config
    default: return mergeHistorical(config, base)
  }
}

export default mergeConfig

function mergeHistorical (config: AppConfig, baseConfig?: AppConfig): AppConfig {
  const base = baseConfig ? JSON.parse(JSON.stringify(baseConfig)) : appConfigFactory()

  mergeBoolean('active')
  mergeBoolean('noTypeField')
  mergeBoolean('animation')

  merge('langCode', val => /^(zh-CN|zh-TW|en)$/.test(val))

  mergeNumber('panelWidth')
  mergeNumber('panelMaxHeightRatio')
  mergeNumber('fontSize')
  mergeBoolean('pdfSniff')
  mergeBoolean('searhHistory')
  mergeBoolean('newWordSound')

  mergeBoolean('mode.icon')
  mergeBoolean('mode.direct')
  mergeBoolean('mode.double')
  mergeBoolean('mode.ctrl')

  mergeBoolean('pinMode.direct')
  mergeBoolean('pinMode.double')
  mergeBoolean('pinMode.ctrl')

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

  mergeSelectedDicts('dicts')
  mergeSelectedDicts('contextMenus')

  _.forEach(base.dicts.all, (dict, id) => {
    mergeBoolean(`dicts.all.${id}.defaultUnfold`)
    mergeNumber(`dicts.all.${id}.preferredHeight`)
    mergeBoolean(`dicts.all.${id}.selectionLang.eng`)
    mergeBoolean(`dicts.all.${id}.selectionLang.chs`)
    if (dict['options']) {
      _.forEach(dict['options'], (value, opt) => {
        if (_.isNumber(value)) {
          mergeNumber(`dicts.all.${id}.options.${opt}`)
        } else if (_.isBoolean(value)) {
          mergeBoolean(`dicts.all.${id}.options.${opt}`)
        }
      })
    }
  })

  return base

  function mergeSelectedDicts (path: string): void {
    const selected = _.get(config, [path, 'selected'])
    if (Array.isArray(selected)) {
      const allDict = _.get(base, [path, 'all'])
      const arr = selected.filter(id => allDict[id])
      if (arr.length > 0) {
        _.set(base, [path, 'selected'], arr)
      }
    }
  }

  function mergeNumber (path: string): void {
    return merge(path, _.isNumber)
  }

  function mergeBoolean (path: string): void {
    return merge(path, _.isBoolean)
  }

  function merge (path: string, predicate: (val) => boolean): void {
    const val = _.get(config, path)
    if (predicate(val)) {
      _.set(base, path, val)
    }
  }
}
