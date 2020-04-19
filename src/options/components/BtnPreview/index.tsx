import React, { FC } from 'react'
import { Dispatch } from 'redux'
import { useDispatch } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { Button } from 'antd'
import { StoreAction } from '@/content/redux/modules'
import { useTranslate } from '@/_helpers/i18n'
import { newWord } from '@/_helpers/record-manager'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { useIsShowDictPanel } from '@/options/helpers/panel-store'
import { PreviewIcon } from './PreviewIcon'

import './_style.scss'

export const BtnPreview: FC = () => {
  const { t } = useTranslate('options')
  const show = !useIsShowDictPanel()
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
