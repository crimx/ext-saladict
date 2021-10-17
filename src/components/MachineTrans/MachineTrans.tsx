import React, {
  FC,
  useState,
  useCallback,
  useLayoutEffect,
  useRef
} from 'react'
import { useSubscription } from 'observable-hooks'
import Speaker from '@/components/Speaker'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { DictID } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { MachineTranslateResult } from './engine'
import { Trans, useTranslate } from '@/_helpers/i18n'

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

const TSpeaker = React.memo<{
  result: MachineTranslateResult<DictID>
  source: 'searchText' | 'trans'
}>(({ result, source }) => (
  <Speaker
    src={
      result[source].tts === '#'
        ? () => {
            console.log({
              type: 'DICT_ENGINE_METHOD',
              payload: {
                id: result.id,
                method: 'getTTS',
                args: [
                  result[source].paragraphs.join(' '),
                  source === 'trans' ? result.tl : result.sl
                ]
              }
            })
            return message.send<'DICT_ENGINE_METHOD', string>({
              type: 'DICT_ENGINE_METHOD',
              payload: {
                id: result.id,
                method: 'getTTS',
                args: [
                  result[source].paragraphs.join(' '),
                  source === 'trans' ? result.tl : result.sl
                ]
              }
            })
          }
        : result[source].tts
    }
  />
))

/** text with a speaker at the beginning */
const TText = React.memo<{
  result: MachineTranslateResult<DictID>
  source: 'searchText' | 'trans'
  lang: string
}>(({ result, source, lang }) => (
  <div className={'MachineTrans-Lines'}>
    <TSpeaker result={result} source={source} />
    {result[source].paragraphs.map((line, i) => (
      <p key={i} className={`MachineTrans-lang-${lang}`}>
        {line}
      </p>
    ))}
  </div>
))

const TTextCollapsable = React.memo<{
  result: MachineTranslateResult<DictID>
  source: 'searchText' | 'trans'
  lang: string
}>(({ result, source, lang }) => {
  const [collapse, setCollapse] = useState(false)
  const expand = useCallback(() => setCollapse(false), [setCollapse])

  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (collapse || !containerRef.current) return

    // count lines

    if (containerRef.current.querySelectorAll('p').length > 1) {
      // multiple paragraphs
      setCollapse(true)
      return
    }

    const text = containerRef.current.querySelector('p span')
    if (text && text.getClientRects().length > 1) {
      // multiple lines
      setCollapse(true)
      return
    }
  }, [])

  return (
    <div ref={containerRef} className={'MachineTrans-Lines'}>
      <TSpeaker result={result} source={source} />
      {collapse ? (
        <div
          className={`MachineTrans-Lines-collapse MachineTrans-lang-${lang}`}
        >
          <button onClick={expand}>
            {result[source].paragraphs.join(' ')}
          </button>
        </div>
      ) : (
        result[source].paragraphs.map((line, i) => (
          <p key={i} className={`MachineTrans-lang-${lang}`}>
            <span>{line}</span>
          </p>
        ))
      )}
    </div>
  )
})

export type MachineTransProps = ViewPorps<MachineTranslateResult<DictID>>

/** Template for machine translations */
export const MachineTrans: FC<MachineTransProps> = props => {
  const { tl, sl } = props.result
  const [slState, setSlState] = useState<
    MachineTransProps['result']['slInitial']
  >(props.result.slInitial)

  useSubscription(props.catalogSelect$, ({ key, value }) => {
    switch (key) {
      case 'showSl':
        setSlState('full')
        break
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

  if (props.result.requireCredential) {
    return renderCredential()
  }

  return (
    <div
      className={
        rtlLangs.has(sl) || rtlLangs.has(tl)
          ? 'MachineTrans-has-rtl'
          : undefined
      }
    >
      <div className="MachineTrans-Text">
        {slState === 'full' ? (
          <TText result={props.result} source="searchText" lang={sl} />
        ) : slState === 'collapse' ? (
          <TTextCollapsable
            result={props.result}
            source="searchText"
            lang={sl}
          />
        ) : null}
        <TText result={props.result} source="trans" lang={tl} />
      </div>
    </div>
  )
}

function renderCredential() {
  const { t } = useTranslate('content')
  return (
    <Trans message={t('machineTrans.login')}>
      <a
        href={browser.runtime.getURL('options.html?menuselected=DictAuths')}
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        {t('machineTrans.dictAccount')}
      </a>
    </Trans>
  )
}
