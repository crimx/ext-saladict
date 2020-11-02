import { DeepReadonly } from '@/typings/helpers'
import { genUniqueKey } from '@/_helpers/uniqueKey'
import { getAllDicts } from './dicts'

export type MtaAutoUnfold = '' | 'once' | 'always' | 'popup' | 'hide'

export type ProfileMutable = ReturnType<typeof _getDefaultProfile>
export type Profile = DeepReadonly<ProfileMutable>

export interface ProfileID {
  id: string
  name: string
}

export type ProfileIDList = Array<ProfileID>

export const getDefaultProfile: (id?: string) => Profile = _getDefaultProfile

export default getDefaultProfile

export function _getDefaultProfile(id?: string) {
  return {
    version: 1,

    id: id || genUniqueKey(),

    /** auto unfold multiline textarea search box */
    mtaAutoUnfold: '' as MtaAutoUnfold,

    /** show waveform control panel */
    waveform: true,

    /** remember user manual dict folding on the same page */
    stickyFold: false,

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
        'zdic',
        'guoyu',
        'liangan',
        'googledict'
      ] as Array<keyof ReturnType<typeof getAllDicts>>,
      // settings of each dict will be auto-generated
      all: getAllDicts()
    }
  }
}

export function getDefaultProfileID(id?: string): ProfileID {
  return {
    id: id || genUniqueKey(),
    name: '%%_default_%%'
  }
}

export interface ProfileStorage {
  idItem: ProfileID
  profile: Profile
}

export function genProfilesStorage(): {
  profileIDList: ProfileIDList
  profiles: Profile[]
} {
  const defaultID = getDefaultProfileID()
  const defaultProfile = getDefaultProfile(defaultID.id)
  const sentenceStorage = sentence()
  const translationStorage = translation()
  const scholarStorage = scholar()
  const nihongoStorage = nihongo()

  return {
    profileIDList: [
      defaultID,
      sentenceStorage.idItem,
      translationStorage.idItem,
      scholarStorage.idItem,
      nihongoStorage.idItem
    ],
    profiles: [
      defaultProfile,
      sentenceStorage.profile,
      translationStorage.profile,
      scholarStorage.profile,
      nihongoStorage.profile
    ]
  }
}

export function sentence(): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_sentence_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = [
    'jukuu',
    'bing',
    'cnki',
    'renren',
    'eudic',
    'cobuild',
    'cambridge',
    'longman',
    'macmillan'
  ]

  const allDict = profile.dicts.all
  allDict.bing.options.tense = false
  allDict.bing.options.phsym = false
  allDict.bing.options.cdef = false
  allDict.bing.options.related = false
  allDict.bing.options.sentence = 9999
  allDict.cnki.options.dict = false
  allDict.eudic.options.resultnum = 9999
  allDict.macmillan.options.related = false
  allDict.longman.options.wordfams = false
  allDict.longman.options.collocations = false
  allDict.longman.options.grammar = false
  allDict.longman.options.thesaurus = false
  allDict.longman.options.examples = true
  allDict.longman.options.bussinessFirst = false
  allDict.longman.options.related = false

  return { idItem, profile }
}

export function scholar(): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_scholar_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = [
    'googledict',
    'cambridge',
    'cobuild',
    'etymonline',
    'cnki',
    'macmillan',
    'lexico',
    'websterlearner',
    'google',
    'youdaotrans',
    'zdic',
    'guoyu',
    'liangan'
  ]

  const allDict = profile.dicts.all
  allDict.macmillan.defaultUnfold = {
    matchAll: false,
    english: false,
    chinese: false,
    japanese: false,
    korean: false,
    french: false,
    spanish: false,
    deutsch: false,
    others: false
  }
  allDict.lexico.defaultUnfold = {
    matchAll: false,
    english: false,
    chinese: false,
    japanese: false,
    korean: false,
    french: false,
    spanish: false,
    deutsch: false,
    others: false
  }
  allDict.websterlearner.defaultUnfold = {
    matchAll: false,
    english: false,
    chinese: false,
    japanese: false,
    korean: false,
    french: false,
    spanish: false,
    deutsch: false,
    others: false
  }
  allDict.google.selectionWC.min = 5
  allDict.youdaotrans.selectionWC.min = 5

  return { idItem, profile }
}

export function translation(): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_translation_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = [
    'google',
    'tencent',
    'baidu',
    'caiyun',
    'youdaotrans',
    'zdic',
    'guoyu',
    'liangan'
  ]
  profile.mtaAutoUnfold = 'always'

  return { idItem, profile }
}

export function nihongo(): ProfileStorage {
  const idItem = getDefaultProfileID()
  idItem.name = '%%_nihongo_%%'

  const profile = getDefaultProfile(idItem.id) as ProfileMutable
  profile.dicts.selected = [
    'mojidict',
    'hjdict',
    'weblioejje',
    'weblio',
    'google',
    'tencent',
    'caiyun',
    'googledict',
    'wikipedia'
  ]
  profile.dicts.all.wikipedia.options.lang = 'ja'
  profile.waveform = false

  return { idItem, profile }
}
