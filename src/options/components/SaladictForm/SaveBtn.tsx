import React, { FC } from 'react'
import { Button } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import { uploadStatus$ } from '@/options/helpers/upload'

/**
 * Move the button out as independent component to reduce
 * re-rendering of the whole component.
 */
export const SaveBtn: FC = () => {
  const { t } = useTranslate('common')
  const uploadStatus = useObservableState(uploadStatus$, 'idle')

  return (
    <Button
      type="primary"
      htmlType="submit"
      disabled={uploadStatus === 'uploading'}
    >
      {t('common:save')}
    </Button>
  )
}
