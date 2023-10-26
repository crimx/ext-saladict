import { MerriamWebsterResultV2 } from '@/components/dictionaries/merriamwebster/engine'
import fs from 'fs'
import path from 'path'

export const cases = {
  multiGroup: {
    dom: () => {
      const data = fs.readFileSync(path.join(__dirname, '/response/add.html'), {
        encoding: 'utf-8'
      })
      return new DOMParser().parseFromString(data, 'text/html')
    },
    expect: {
      groups: [
        {
          title: 'add',
          pos: 'verb',
          pr: {
            phonetics: [
              {
                symbol: 'ˈad',
                audio:
                  'https://media.merriam-webster.com/audio/prons/en/us/mp3/a/add00001.mp3'
              }
            ]
          },
          conjugation: 'added; adding; adds',
          sections: [
            {
              title: 'transitive verb',
              meaningGroups: [
                [
                  {
                    explaining:
                      ': to join or unite so as to bring about an increase or improvement',
                    examples: [
                      'adds 60 acres to his land',
                      'wine adds a creative touch to cooking'
                    ]
                  }
                ],
                [
                  {
                    explaining: ': to say further : append',
                    examples: [
                      'Do you have anything else to add to the discussion?'
                    ]
                  }
                ],
                [
                  {
                    explaining:
                      ': to combine (numbers) into an equivalent simple quantity or number'
                  }
                ],
                [
                  {
                    explaining: ': to include as a member of a group',
                    examples: [`Don't forget to add me in.`]
                  }
                ]
              ]
            },
            {
              title: 'intransitive verb',
              meaningGroups: [
                [
                  {
                    explaining: ': to perform addition'
                  },
                  {
                    explaining: ': to come together or unite by addition',
                    examples: [
                      'The facts added together to support his theory.'
                    ]
                  }
                ],
                [
                  {
                    explaining: ': to serve as an addition',
                    examples: ['The movie will add to his fame.']
                  },
                  {
                    explaining: ': to make an addition',
                    examples: ['added to her savings']
                  }
                ]
              ]
            }
          ],
          forms: ['addable[adjective]']
        },
        {
          title: 'ADD',
          pos: 'abbreviation',
          sections: [
            {
              meaningGroups: [
                [
                  {
                    explaining: 'American Dialect Dictionary'
                  }
                ],
                [
                  {
                    explaining: 'attention deficit disorder'
                  }
                ]
              ]
            }
          ]
        }
      ],
      synonyms: [
        ['Verb', ['adjoin', 'annex', 'append', 'subjoin', 'tack (on)']]
      ],
      etymology: [
        [
          'Verb',
          `Middle English adden, borrowed from Anglo-French adder, borrowed from Latin addere, from ad- ad- + -dere \"to put, place,\" going back to a reduced ablaut grade of Indo-European *dheh1-  — more at do entry 1`
        ]
      ]
    } as MerriamWebsterResultV2
  },
  multiSyllable: {
    dom: () => {
      const data = fs.readFileSync(
        path.join(__dirname, '/response/transitive.html'),
        {
          encoding: 'utf-8'
        }
      )
      return new DOMParser().parseFromString(data, 'text/html')
    },
    expect: {
      groups: [
        {
          title: 'transitive',
          pos: 'adjective',
          pr: {
            syllable: 'tran·​si·​tive',
            phonetics: [
              {
                symbol: 'ˈtran(t)-sə-tiv',
                audio:
                  'https://media.merriam-webster.com/audio/prons/en/us/mp3/t/transi17.mp3'
              },
              {
                symbol: 'ˈtran-zə-'
              },
              {
                symbol: 'ˈtran(t)s-tiv'
              }
            ]
          },
          sections: [
            {
              meaningGroups: [
                [
                  {
                    explaining:
                      ': characterized by having or containing a direct object',
                    examples: ['a transitive verb']
                  }
                ],
                [
                  {
                    explaining:
                      ': being or relating to a relation with the property that if the relation holds between a first element and a second and between the second element and a third, it holds between the first and third elements',
                    examples: ['equality is a transitive relation']
                  }
                ],
                [
                  {
                    explaining:
                      ': of, relating to, or characterized by transition'
                  }
                ]
              ]
            }
          ],
          forms: [
            'transitively[adverb]',
            'transitiveness[noun]',
            'transitivity[noun]'
          ]
        }
      ],
      etymology: [
        [
          '',
          'Late Latin transitivus, from Latin transitus, past participle of transire'
        ]
      ]
    } as MerriamWebsterResultV2
  }
}
