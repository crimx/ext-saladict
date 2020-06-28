import React, { FC } from 'react'
import { Button } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { useSelector } from '@/options/redux/modules'

/**
 * Move the button out as independent component to reduce
 * re-rendering of the whole component.
 */
export const SaveBtn: FC = () => {
  const { t } = useTranslate('common')
  const uploadStatus = useSelector(state => state.uploadStatus)

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
