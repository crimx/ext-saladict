import { DeepReadonly } from '@/typings/helpers'
import { genUniqueKey } from '@/_helpers/uniqueKey'
import { getALlDicts } from './dicts'

export type MtaAutoUnfold = '' | 'once' | 'always' | 'popup'

export type ProfileMutable = ReturnType<typeof _getDefaultProfile>
export type Profile = DeepReadonly<ProfileMutable>

export interface ProfileID {
  id: string
  name: string
}

export type ProfileIDList = Array<ProfileID>

export const getDefaultProfile: (id?: string) => Profile = _getDefaultProfile

export default getDefaultProfile

export function _getDefaultProfile (id?: string) {
  return {
    id: id || genUniqueKey(),

    /** auto unfold multiline textarea search box */
    mtaAutoUnfold: '' as MtaAutoUnfold,

    dicts: {
      /** default selected dictionaries */
      selected: [
        'bing',
        'cobuild',
        'cambridge',
        'youdao',
        'urban',
        'vocabulary',
        'google',
        'sogou',
        'zdic',
        'guoyu',
        'liangan',
        'googledict',
      ] as Array<keyof ReturnType<typeof getALlDicts>>,
      // settings of each dict will be auto-generated
      all: getALlDicts()
    },
  }
}

export function getDefaultProfileID (id?: string): ProfileID {
  return {
    id: id || genUniqueKey(),
    name: '%%_default_%%',
  }
}

export interface ProfileStorage {
  idItem: ProfileID
  profile: Profile
}

export function genProfilesStorage (): {
  profileIDList: ProfileIDList
  profiles: Profile[]
} {
  const defaultID = getDefaultProfileID()
  const defaultProfile = getDefaultProfile(defaultID.id)
  const dailyStorage = daily()
  const translationStorage = translation()
  const scholarStorage = scholar()

  return {
    profileIDList: [
      defaultID,
      dailyStorage.idItem,
      translationStorage.idItem,
      scholarStorage.idItem,
    ],
    profiles: [
      defaultProfile,
      dailyStorage.profile,
      translationStorage.profile,
      scholarStorage.profile,
    ]
  }
}

export function daily (): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_daily_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = ['bing', 'cambridge', 'urban', 'vocabulary', 'macmillan', 'etymonline', 'google', 'sogou', 'zdic', 'guoyu', 'liangan', 'googledict']

  const allDict = profile.dicts.all
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5
  allDict.etymonline.defaultUnfold = false

  return { idItem, profile }
}

export function scholar (): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_scholar_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = ['googledict', 'cambridge', 'cobuild', 'etymonline', 'macmillan', 'oald', 'websterlearner', 'google', 'sogou', 'zdic', 'guoyu', 'liangan']

  const allDict = profile.dicts.all
  allDict.macmillan.defaultUnfold = false
  allDict.oald.defaultUnfold = false
  allDict.websterlearner.defaultUnfold = false
  allDict.google.selectionWC.min = 5
  allDict.sogou.selectionWC.min = 5

  return { idItem, profile }
}

export function translation (): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_translation_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = ['google', 'sogou', 'baidu', 'youdao', 'zdic', 'guoyu', 'liangan']
  profile.mtaAutoUnfold = 'always'

  return { idItem, profile }
}
