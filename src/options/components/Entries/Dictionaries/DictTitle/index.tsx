import React, { FC } from 'react'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
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
    <span className="saladict-dict-title">
      <span>
        <img
          className="saladict-dict-title-icon"
          src={require('@/components/dictionaries/' + dictID + '/favicon.png')}
          alt={`logo ${title}`}
        />
        <a
          className="saladict-dict-title-link"
          href="#"
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            openDictSrcPage(dictID, dictLangs)
          }}
        >
          {title}
        </a>
      </span>
      <span>
        {dictLangs.split('').map((c, i) =>
          +c ? (
            <span className="saladict-dict-langs-char" key={langCodes[i]}>
              {t(`dict.lang.${langCodes[i]}`)}
            </span>
          ) : null
        )}
      </span>
    </span>
  )
}

export const DictTitleMemo = React.memo(DictTitle)

function openDictSrcPage(dictID: DictID, dictLangs: string) {
  const text = +dictLangs[0]
    ? 'salad'
    : +dictLangs[1] || +dictLangs[2]
    ? '沙拉'
    : +dictLangs[3]
    ? 'サラダ'
    : +dictLangs[4]
    ? '샐러드'
    : 'salad'

  message.send({
    type: 'OPEN_DICT_SRC_PAGE',
    payload: {
      id: dictID,
      text
    }
  })
}
