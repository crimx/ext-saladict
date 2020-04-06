import React, { FC } from 'react'
import { Button } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { PreviewIcon } from './PreviewIcon'

import './_style.scss'

export interface BtnPreviewProps {
  show: boolean
  onClick: () => void
}

export const BtnPreview: FC<BtnPreviewProps> = () => {
  const { t } = useTranslate('options')

  return (
    <Button
      className="btn-preview"
      title={t('previewPanel')}
      shape="circle"
      size="large"
      icon={<PreviewIcon />}
    />
  )
}

export const BtnPreviewMemo = React.memo(BtnPreview)
