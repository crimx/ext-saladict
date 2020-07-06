import React, { FC } from 'react'
import { useSubscription } from 'observable-hooks'
import Speaker from '@/components/Speaker'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { DictID } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { MachineTranslateResult } from './engine'

type TTextSource =
  | MachineTranslateResult<DictID>['searchText']
  | MachineTranslateResult<DictID>['trans']

const rtlLangs = new Set([
  'ar', // Arabic
  'ara', // Arabic
  'az', // Azerbaijani
  'fa', // Persian
  'he', // Hebrew
  'iw', // Hebrew
  'ku', // Kurdish
  'ug', // Uighur
  'ur' // Urdu
])

/** text with a speaker at the beginning */
const TText = React.memo(
  ({ source, lang }: { source: TTextSource; lang: string }) => (
    <div className={'MachineTrans-Lines'}>
      <Speaker src={source.tts} />
      {source.paragraphs.map((line, i) => (
        <p key={i} className={`MachineTrans-lang-${lang}`}>
          {line}
        </p>
      ))}
    </div>
  )
)

export type MachineTransProps = ViewPorps<MachineTranslateResult<DictID>>

/** Template for machine translations */
export const MachineTrans: FC<MachineTransProps> = props => {
  const { trans, searchText, tl, sl } = props.result

  useSubscription(props.catalogSelect$, ({ key, value }) => {
    switch (key) {
      case 'sl':
      case 'tl':
        props.searchText({
          id: props.result.id,
          payload: {
            sl,
            tl,
            [key]: value
          }
        })
        break
      case 'copySrc':
        message.send({
          type: 'SET_CLIPBOARD',
          payload: props.result.searchText.paragraphs.join('\n')
        })
        break
      case 'copyTrans':
        message.send({
          type: 'SET_CLIPBOARD',
          payload: props.result.trans.paragraphs.join('\n')
        })
        break
      default:
        break
    }
  })

  return (
    <div
      className={
        rtlLangs.has(sl) || rtlLangs.has(tl)
          ? 'MachineTrans-has-rtl'
          : undefined
      }
    >
      <div className="MachineTrans-Text">
        <TText source={searchText} lang={sl} />
        <TText source={trans} lang={tl} />
      </div>
    </div>
  )
}
