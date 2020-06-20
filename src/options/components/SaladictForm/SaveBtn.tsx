import React, { FC } from 'react'
import { useObservableGetState } from 'observable-hooks'
import { uploadResult$$ } from '@/options/helpers/upload'
import { Button } from 'antd'
import { useTranslate } from '@/_helpers/i18n'

/**
 * Move the button out as independent component to reduce
 * re-rendering of the whole component.
 */
export const SaveBtn: FC = () => {
  const { t } = useTranslate('common')
  const uploading = useObservableGetState(uploadResult$$, false, 'loading')

  return (
    <Button type="primary" htmlType="submit" disabled={uploading}>
      {t('common:save')}
    </Button>
  )
}
