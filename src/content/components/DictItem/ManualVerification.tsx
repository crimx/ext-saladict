import React, { FC } from 'react'
import { useTranslate } from '@/_helpers/i18n'
import { ManualVerificationResult } from '@/components/dictionaries/helpers'

export const ManualVerification: FC<{
  result: ManualVerificationResult
}> = ({ result }) => {
  const { t } = useTranslate('content')

  return (
    <div className="dictManualVerification">
      <h2>{t('manualVerification.title')}</h2>
      <p>{t('manualVerification.message')}</p>
      <a href={result.url} target="_blank" rel="nofollow noopener noreferrer">
        {t('manualVerification.openPage')}
      </a>
    </div>
  )
}
