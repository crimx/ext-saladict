import { appConfigFactory, AppConfig, AppConfigMutable } from './'

export function defaultProfilesFactory (): AppConfig[] {
  return [
    appConfigFactory(),
    daily(),
    translation(),
    scholar(),
  ]
}

export function daily (): AppConfig {
  const config = appConfigFactory() as AppConfigMutable
  config.name = '%%_daily_%%'
  config.dicts.selected = ['bing', 'cambridge', 'urban', 'vocabulary', 'macmillan', 'etymonline', 'google', 'sogou', 'zdic', 'guoyu', 'liangan', 'googledict']

  const allDict = config.dicts.all
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5
  allDict.etymonline.defaultUnfold = false

  return config
}

export function scholar (): AppConfig {
  const config = appConfigFactory() as AppConfigMutable
  config.name = '%%_scholar_%%'
  config.dicts.selected = ['googledict', 'cambridge', 'cobuild', 'etymonline', 'macmillan', 'oald', 'websterlearner', 'google', 'sogou', 'zdic', 'guoyu', 'liangan']

  const allDict = config.dicts.all
  allDict.macmillan.defaultUnfold = false
  allDict.oald.defaultUnfold = false
  allDict.websterlearner.defaultUnfold = false
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5

  return config
}

export function translation (): AppConfig {
  const config = appConfigFactory() as AppConfigMutable
  config.name = '%%_translation_%%'
  config.dicts.selected = ['google', 'sogou', 'youdao', 'zdic', 'guoyu', 'liangan']
  config.mtaAutoUnfold = 'always'
  return config
}
