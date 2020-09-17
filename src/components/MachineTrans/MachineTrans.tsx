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
const TText = React.memo<{
  source: TTextSource
  lang: string
}>(({ source, lang }) => (
  <div className={'MachineTrans-Lines'}>
    <Speaker src={source.tts} />
    {source.paragraphs.map((line, i) => (
      <p key={i} className={`MachineTrans-lang-${lang}`}>
        {line}
      </p>
    ))}
  </div>
))

const TTextCollapsable = React.memo<{
  source: TTextSource
  lang: string
}>(({ source, lang }) => {
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
      <Speaker src={source.tts} />
      {collapse ? (
        <div
          className={`MachineTrans-Lines-collapse MachineTrans-lang-${lang}`}
        >
          <button onClick={expand}>{source.paragraphs.join(' ')}</button>
        </div>
      ) : (
        source.paragraphs.map((line, i) => (
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
  const { trans, searchText, tl, sl } = props.result
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
          <TText source={searchText} lang={sl} />
        ) : slState === 'collapse' ? (
          <TTextCollapsable source={searchText} lang={sl} />
        ) : null}
        <TText source={trans} lang={tl} />
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
