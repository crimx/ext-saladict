import React, { FC, useState } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import SwitchTransition from 'react-transition-group/SwitchTransition'
import { debounce } from 'rxjs/operators'
import { timer } from 'rxjs'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import Speaker from '@/components/Speaker'
import {
  ViewPorps,
  MachineTranslateResult
} from '@/components/dictionaries/helpers'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { hover } from '@/_helpers/observables'

type TTextSource =
  | MachineTranslateResult<DictID>['searchText']
  | MachineTranslateResult<DictID>['trans']

/** text with a speaker at the beginning */
const TText: FC<{ source: TTextSource }> = ({ source }) =>
  source.text ? (
    <div className="MachineTrans-Lines">
      <Speaker src={source.audio} />
      {source.text.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  ) : null

/** Template for machine translations */
export const MachineTrans: FC<
  ViewPorps<MachineTranslateResult<DictID>>
> = props => {
  const { trans, searchText, langcodes, tl, sl } = props.result
  const { t } = useTranslate(['content', 'langcode'])

  const [isShowLang, setShowLang] = useState(false)
  const [onMouseOverOut, isShowLang$] = useObservableCallback<
    boolean,
    React.MouseEvent<HTMLElement>
  >(events$ =>
    hover(events$).pipe(debounce(isOver => (isOver ? timer(500) : timer(800))))
  )
  useSubscription(isShowLang$, setShowLang)

  return (
    <div>
      <div className="MachineTrans-Text">
        <TText source={trans} />
        {searchText.text.length <= 100 ? (
          <TText source={searchText} />
        ) : (
          <div>
            <details>
              <summary>{t('machineTrans.stext')}</summary>
              <TText source={searchText} />
            </details>
          </div>
        )}
      </div>

      <div className="MachineTrans-LangSwitchWrap">
        <SwitchTransition>
          <CSSTransition
            key={isShowLang ? 'select' : 'button'}
            classNames="MachineTrans-LangSwitch"
            timeout={100}
          >
            {isShowLang ? renderLangSwitch : renderLangSwitchBtn}
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  )

  function renderLangSwitchBtn() {
    return (
      <button
        className="MachineTrans-LangSwitchBtn"
        onClick={() => setShowLang(true)}
        onMouseOver={onMouseOverOut}
        onMouseLeave={onMouseOverOut}
      >
        {t('machineTrans.switch')}
      </button>
    )
  }

  function renderLangSwitch() {
    return (
      <div
        className="MachineTrans-LangSwitch"
        onMouseOver={onMouseOverOut}
        onMouseLeave={onMouseOverOut}
      >
        <div className="MachineTrans-LangSwitch_Titles">
          <span>{`${t('machineTrans.tl')}: `}</span>
          <span>{`${t('machineTrans.sl')}: `}</span>
        </div>
        <div className="MachineTrans-LangSwitch_Selects">
          <select name="tl" value={tl} onChange={handleLangChanged}>
            {langcodes.map(code => (
              <option key={code} value={code}>
                {code} {t('langcode:' + code)}
              </option>
            ))}
          </select>
          <select name="sl" value={sl} onChange={handleLangChanged}>
            <option key="auto" value="auto">
              {t('machineTrans.auto')}
            </option>
            {langcodes.map(code => (
              <option key={code} value={code}>
                {code} {t('langcode:' + code)}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  function handleLangChanged(e: React.ChangeEvent<HTMLSelectElement>) {
    props.searchText({
      id: props.result.id,
      payload: {
        sl,
        tl,
        [e.currentTarget.name]: e.currentTarget.value
      }
    })
  }
}
