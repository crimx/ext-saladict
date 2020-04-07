import React, { FC } from 'react'
import { Dispatch } from 'redux'
import { useSelector, useDispatch } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { Button } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { newWord } from '@/_helpers/record-manager'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { StoreState, StoreAction } from '@/content/redux/modules'
import { PreviewIcon } from './PreviewIcon'

import './_style.scss'

export const BtnPreview: FC = () => {
  const { t } = useTranslate('options')
  const show = !useSelector(pickIsShowDictPanel)
  const dispatch = useDispatch<Dispatch<StoreAction>>()

  return (
    <CSSTransition
      classNames="btn-preview-fade"
      mountOnEnter
      unmountOnExit
      appear
      in={show}
      timeout={500}
    >
      <div>
        <Button
          className="btn-preview"
          title={t('previewPanel')}
          shape="circle"
          size="large"
          icon={<PreviewIcon />}
          onClick={async e => {
            const { x, width } = e.currentTarget.getBoundingClientRect()
            // panel will adjust the postion itself
            dispatch({ type: 'OPEN_PANEL', payload: { x: x + width, y: 80 } })
            dispatch({
              type: 'SEARCH_START',
              payload: {
                word: newWord({ text: await getWordOfTheDay() }),
                noHistory: true
              }
            })
          }}
        />
      </div>
    </CSSTransition>
  )
}

export const BtnPreviewMemo = React.memo(BtnPreview)

function pickIsShowDictPanel(state: StoreState): boolean {
  return state.isShowDictPanel
}
