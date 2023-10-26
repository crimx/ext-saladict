import {
  _getConjugation,
  _getContentEle,
  _getEtymology,
  _getExamples,
  _getExpaining,
  _getGroupsEles,
  _getMeaningEles,
  _getMeaningGroupEles,
  _getPartOfSpeech,
  _getPhoneticAudio,
  _getPhoneticEles,
  _getPhoneticSymbol,
  _getPrEle,
  _getSectionTitle,
  _getSectionsEles,
  _getSyllable,
  _getSynonyms,
  _getTitle
} from '@/components/dictionaries/merriamwebster/engine'
import { cases } from './testCases'
// import getDefaultProfile from '@/app-config/profiles'

describe('Dict/MerriamWebster/engine', () => {
  // const profile = getDefaultProfile()
  // const options = profile.dicts.all.merriamwebster.options

  let multiGroup: Element
  let multiSyllable: Element

  beforeAll(() => {
    multiGroup = _getContentEle(cases.multiGroup.dom())
    multiSyllable = _getContentEle(cases.multiSyllable.dom())
  })

  it('should return right number of groups', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    expect(groupEles1.length).toBe(2)

    const groupEles2 = _getGroupsEles(multiSyllable)
    expect(groupEles2.length).toBe(1)
  })

  it('should returns correct synonyms', () => {
    const synonyms1 = _getSynonyms(multiGroup)
    expect(synonyms1).toStrictEqual(cases.multiGroup.expect.synonyms)

    const synonyms2 = _getSynonyms(multiSyllable)
    expect(synonyms2).toStrictEqual(cases.multiSyllable.expect.synonyms)
  })

  it('should returns correct etymology', () => {
    const etymology1 = _getEtymology(multiGroup)
    expect(etymology1).toStrictEqual(cases.multiGroup.expect.etymology)

    const etymology2 = _getEtymology(multiSyllable)
    expect(etymology2).toStrictEqual(cases.multiSyllable.expect.etymology)
  })

  it('should returns correct group title', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const title = _getTitle(v)
      expect(title).toEqual(gexp1.groups[i].title)
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const title = _getTitle(v)
      expect(title).toEqual(gexp2.groups[i].title)
    })
  })

  it('should returns correct part of speech', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const pos = _getPartOfSpeech(v)
      expect(pos).toEqual(gexp1.groups[i].pos)
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const pos = _getPartOfSpeech(v)
      expect(pos).toEqual(gexp2.groups[i].pos)
    })
  })

  it('should returns correct conjugation', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const conj = _getConjugation(v)
      expect(conj).toEqual(gexp1.groups[i].conjugation)
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const conj = _getConjugation(v)
      expect(conj).toEqual(gexp2.groups[i].conjugation)
    })
  })

  it.todo('should returns correct forms')

  it('should returns correct syllable', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const syllable = _getSyllable(pEles)
        expect(syllable).toEqual(gexp1.groups[i].pr?.syllable)
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const syllable = _getSyllable(pEles)
        expect(syllable).toEqual(gexp2.groups[i].pr?.syllable)
      }
    })
  })

  it('should returns right number of phonetics', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          expect(pts.length).toEqual(gexp1.groups[i].pr?.phonetics.length)
        }
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          expect(pts.length).toEqual(gexp2.groups[i].pr?.phonetics.length)
        }
      }
    })
  })

  it('should returns correct phonetic symbol', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          pts.forEach((v, j) => {
            expect(_getPhoneticSymbol(v)).toEqual(
              gexp1.groups[i].pr?.phonetics[j].symbol
            )
          })
        }
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          pts.forEach((v, j) => {
            expect(_getPhoneticSymbol(v)).toEqual(
              gexp2.groups[i].pr?.phonetics[j].symbol
            )
          })
        }
      }
    })
  })

  it('should returns correct phonetic audio', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          pts.forEach((v, j) => {
            expect(_getPhoneticAudio(v)).toEqual(
              gexp1.groups[i].pr?.phonetics[j].audio
            )
          })
        }
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const pEles = _getPrEle(v)
      if (pEles) {
        const pts = _getPhoneticEles(pEles)
        if (pts) {
          pts.forEach((v, j) => {
            expect(_getPhoneticAudio(v)).toEqual(
              gexp2.groups[i].pr?.phonetics[j].audio
            )
          })
        }
      }
    })
  })

  it('should returns right number of sections', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v, i) => {
      const sEles = _getSectionsEles(v)
      if (sEles) {
        expect(sEles.length).toEqual(gexp1.groups[i].sections?.length)
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v, i) => {
      const sEles = _getSectionsEles(v)
      if (sEles) {
        expect(sEles.length).toEqual(gexp2.groups[i].sections?.length)
      }
    })
  })

  it('should returns correct section title', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          expect(_getSectionTitle(v2)).toEqual(
            gexp1.groups[i].sections[j].title
          )
        })
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          expect(_getSectionTitle(v2)).toEqual(
            gexp2.groups[i].sections[j].title
          )
        })
      }
    })
  })

  it('should returns right number of meaning group elements', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          expect(_getMeaningGroupEles(v2)?.length).toEqual(
            gexp1.groups[i].sections[j].meaningGroups.length
          )
        })
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          expect(_getMeaningGroupEles(v2)?.length).toEqual(
            gexp2.groups[i].sections[j].meaningGroups.length
          )
        })
      }
    })
  })

  it('should returns right number of meaning elements', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              expect(_getMeaningEles(v3)?.length).toEqual(
                gexp1.groups[i].sections[j].meaningGroups[n].length
              )
            })
        })
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              expect(_getMeaningEles(v3)?.length).toEqual(
                gexp2.groups[i].sections[j].meaningGroups[n].length
              )
            })
        })
      }
    })
  })

  it('should returns correct explaining', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              const ms = _getMeaningEles(v3)
              if (ms)
                ms.forEach((v4, o) => {
                  expect(_getExpaining(v4)).toEqual(
                    gexp1.groups[i].sections[j].meaningGroups[n][o].explaining
                  )
                })
            })
        })
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              const ms = _getMeaningEles(v3)
              if (ms)
                ms.forEach((v4, o) => {
                  expect(_getExpaining(v4)).toEqual(
                    gexp2.groups[i].sections[j].meaningGroups[n][o].explaining
                  )
                })
            })
        })
      }
    })
  })

  it('should returns correct explaining', () => {
    const groupEles1 = _getGroupsEles(multiGroup)
    const gexp1 = cases.multiGroup.expect

    groupEles1.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              const ms = _getMeaningEles(v3)
              if (ms)
                ms.forEach((v4, o) => {
                  console.log(`i ${i} j ${j} n ${n} o ${o}`)
                  expect(_getExamples(v4)).toStrictEqual(
                    gexp1.groups[i].sections[j].meaningGroups[n][o].examples
                  )
                })
            })
        })
      }
    })

    const groupEles2 = _getGroupsEles(multiSyllable)
    const gexp2 = cases.multiSyllable.expect

    groupEles2.forEach((v1, i) => {
      const sEles = _getSectionsEles(v1)
      if (sEles) {
        sEles.forEach((v2, j) => {
          const mg = _getMeaningGroupEles(v2)
          if (mg)
            mg.forEach((v3, n) => {
              const ms = _getMeaningEles(v3)
              if (ms)
                ms.forEach((v4, o) => {
                  expect(_getExamples(v4)).toStrictEqual(
                    gexp2.groups[i].sections[j].meaningGroups[n][o].examples
                  )
                })
            })
        })
      }
    })
  })

  // it('should return correct result', () => {
  //   expect(getResult(cases.multiGroup.dom)).toStrictEqual(
  //     cases.multiGroup.expect
  //   )
  //   expect(getResult(cases.multiSyllable.dom)).toStrictEqual(
  //     cases.multiSyllable.expect
  //   )
  // })
})
