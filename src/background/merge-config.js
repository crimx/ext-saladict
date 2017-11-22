import AppConfig from 'src/app-config'

/**
 * @param {object} config - old config befroe extension update
 * @return {object} old config merged into default config
 */
export default function mergeConfig (config) {
  var base = new AppConfig()
  if (config.active !== undefined) { base.active = Boolean(config.active) }
  if (/^(icon|direct|double|ctrl)$/i.test(config.mode)) { base.mode = config.mode.toLowerCase() }
  if (typeof config.doubleClickDelay === 'number' && !isNaN(config.doubleClickDelay)) {
    base.doubleClickDelay = config.doubleClickDelay
  }
  if (config.tripleCtrl !== undefined) { base.tripleCtrl = Boolean(config.tripleCtrl) }
  if (config.language) {
    Object.keys(base.language).forEach(k => {
      if (config.language[k] !== undefined) { base.language[k] = Boolean(config.language[k]) }
    })
  }

  if (config.autopron) {
    if (config.autopron.cn) {
      const id = config.autopron.cn.dict
      if (base.dicts.all[id]) {
        base.autopron.cn.dict = id
      }
    }
    if (config.autopron.en) {
      const id = config.autopron.en.dict
      if (base.dicts.all[id]) {
        base.autopron.en.dict = id
      }
      if (/^(uk|us)$/i.test(config.autopron.en.accent)) {
        base.autopron.en.accent = config.autopron.en.accent.toLowerCase()
      }
    }
  }

  if (config.dicts) {
    if (Array.isArray(config.dicts.selected)) {
      let selected = config.dicts.selected.filter(id => base.dicts.all[id])
      if (selected.length > 0) { base.dicts.selected = selected }
    }
    if (config.dicts.all) {
      Object.keys(base.dicts.all).forEach(id => {
        let dict = config.dicts.all[id]
        if (!dict) { return }
        let baseDict = base.dicts.all[id]
        if (!String(dict.page)) { baseDict.page = String(dict.page) }
        if (dict.defaultUnfold !== undefined) { baseDict.defaultUnfold = Boolean(dict.defaultUnfold) }
        if (!isNaN(Number(dict.preferredHeight))) { baseDict.preferredHeight = Number(dict.preferredHeight) }
        if (dict.showWhenLang) {
          Object.keys(baseDict.showWhenLang).forEach(opt => {
            if (typeof dict.showWhenLang[opt] === 'boolean') {
              baseDict.showWhenLang[opt] = dict.showWhenLang[opt]
            }
          })
        }
        if (dict.options) {
          Object.keys(baseDict.options).forEach(opt => {
            if (typeof dict.options[opt] === 'boolean') {
              baseDict.options[opt] = dict.options[opt]
            } else if (!isNaN(dict.options[opt])) {
              baseDict.options[opt] = Number(dict.options[opt])
            }
          })
        }
      })
    }
  }

  if (config.contextMenu) {
    if (Array.isArray(config.contextMenu.selected)) {
      if (config.contextMenu.selected.length <= 0) {
        base.contextMenu.selected = []
      } else {
        let selected = config.contextMenu.selected.filter(id => base.contextMenu.all[id])
        if (selected.length > 0) { base.contextMenu.selected = selected }
      }
    }

    // added at v5.20.0, enable by default
    if (!config.contextMenu.all['youdao_page_translate']) {
      base.contextMenu.selected.push('youdao_page_translate')
    }
  }

  return base
}
