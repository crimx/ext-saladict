import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { Button } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { StoreState } from '@/content/redux/modules'
import { PreviewIcon } from './PreviewIcon'

import './_style.scss'

export const BtnPreview: FC = () => {
  const { t } = useTranslate('options')
  const show = !useSelector(pickIsShowDictPanel)

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
          onClick={openDictPanel}
        />
      </div>
    </CSSTransition>
  )
}

export const BtnPreviewMemo = React.memo(BtnPreview)

function pickIsShowDictPanel(state: StoreState): boolean {
  return state.isShowDictPanel
}

async function openDictPanel(e: React.MouseEvent<HTMLButtonElement>) {
  const { x, width } = e.currentTarget.getBoundingClientRect()
  message.self.send({
    type: 'SELECTION',
    payload: {
      word: newWord({ text: await getWordOfTheDay() }),
      self: true, // selection inside dict panel is always avaliable
      instant: true,
      mouseX: x + width,
      mouseY: 80,
      dbClick: true,
      shiftKey: true,
      ctrlKey: true,
      metaKey: true,
      force: true
    }
  })
}
