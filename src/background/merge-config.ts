import { appConfigFactory, AppConfig } from '@/app-config'
import _ from 'lodash'

/**
 * @param {object} config - old config befroe extension update
 * @return {object} old config merged into default config
 */
export function mergeConfig (config?): Promise<AppConfig> {
  if (!config) {
    return initConfig()
  }

  switch (config.version) {
    case 6:
      return browser.storage.sync.set({ config })
        .then(() => config)
    default: return mergeHistorical(config)
  }
}

export default mergeConfig

function initConfig (): Promise<AppConfig> {
  const storageObj = { config: appConfigFactory() }

  return browser.storage.sync.set(storageObj)
    .then(() => storageObj.config)
}

function mergeHistorical (config): Promise<AppConfig> {
  const base = appConfigFactory()

  ;[
    'active',
    'pdfSniff',
    'searhHistory',
    'newWordSound',
    'mode.icon',
    'mode.direct',
    'mode.double',
    'mode.ctrl',
    'pinMode.direct',
    'pinMode.double',
    'pinMode.ctrl',
  ].forEach(mergeBoolean)

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
    _.forEach(dict.options, (value, opt) => {
      if (_.isNumber(value)) {
        mergeNumber(`dicts.all.${id}.options.${opt}`)
      } else if (_.isBoolean(value)) {
        mergeBoolean(`dicts.all.${id}.options.${opt}`)
      }
    })
  })

  return browser.storage.sync.set({ config: base })
    .then(() => base)

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
