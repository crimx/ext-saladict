import React, { FC } from 'react'
import { useTranslate } from '@/_helpers/i18n'
import { DictID } from '@/app-config'

import './_style.scss'

export interface DictTitleProps {
  dictID: DictID
  /** Supported languages */
  dictLangs: string
}

const langCodes = ['en', 'zhs', 'zht', 'ja', 'kor', 'fr', 'de', 'es'] as const

export const DictTitle: FC<DictTitleProps> = ({ dictID, dictLangs }) => {
  const { t } = useTranslate(['options', 'dicts'])
  const title = t(`dicts:${dictID}.name`)

  return (
    <span>
      <img
        className="saladict-dict-title-icon"
        src={require('@/components/dictionaries/' + dictID + '/favicon.png')}
        alt={`logo ${title}`}
      />
      {title}
      {dictLangs.split('').map((c, i) =>
        +c ? (
          <span className="saladict-dict-langs-char" key={langCodes[i]}>
            {t(`dict.lang.${langCodes[i]}`)}
          </span>
        ) : null
      )}
    </span>
  )
}

export const DictTitleMemo = React.memo(DictTitle)
