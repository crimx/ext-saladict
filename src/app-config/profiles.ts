import { genUniqueKey } from '@/_helpers/uniqueKey'
import { getALlDicts } from './dicts'

export type MtaAutoUnfold = '' | 'once' | 'always' | 'popup'

export type ProfileMutable = ReturnType<typeof _getDefaultProfile>
export type Profile = Readonly<ProfileMutable>

export const getDefaultProfile: (id?: string) => Profile = _getDefaultProfile

export default getDefaultProfile

function _getDefaultProfile (id?: string) {
  return {
    id: id || genUniqueKey(),

    /** name of the config mode */
    name: `%%_default_%%`,

    /** auto unfold multiline textarea search box */
    mtaAutoUnfold: '' as MtaAutoUnfold,

    dicts: {
      /** default selected dictionaries */
      selected: [
        'bing', 'cambridge', 'youdao', 'urban', 'vocabulary',
        'google', 'sogou', 'zdic', 'guoyu', 'liangan', 'googledict'
      ] as Array<keyof ReturnType<typeof getALlDicts>>,
      // settings of each dict will be auto-generated
      all: getALlDicts()
    },
  }
}

export function genDefaultProfiles () {
  return [
    getDefaultProfile(),
    daily(),
    translation(),
    scholar(),
  ]
}

export function daily () {
  const profile = getDefaultProfile() as ProfileMutable
  profile.name = '%%_daily_%%'
  profile.dicts.selected = ['bing', 'cambridge', 'urban', 'vocabulary', 'macmillan', 'etymonline', 'google', 'sogou', 'zdic', 'guoyu', 'liangan', 'googledict']

  const allDict = profile.dicts.all
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5
  allDict.etymonline.defaultUnfold = false

  return profile
}

export function scholar () {
  const profile = getDefaultProfile() as ProfileMutable
  profile.name = '%%_scholar_%%'
  profile.dicts.selected = ['googledict', 'cambridge', 'cobuild', 'etymonline', 'macmillan', 'oald', 'websterlearner', 'google', 'sogou', 'zdic', 'guoyu', 'liangan']

  const allDict = profile.dicts.all
  allDict.macmillan.defaultUnfold = false
  allDict.oald.defaultUnfold = false
  allDict.websterlearner.defaultUnfold = false
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5

  return profile
}

export function translation () {
  const profile = getDefaultProfile() as ProfileMutable
  profile.name = '%%_translation_%%'
  profile.dicts.selected = ['google', 'sogou', 'youdao', 'zdic', 'guoyu', 'liangan']
  profile.mtaAutoUnfold = 'always'
  return profile
}
