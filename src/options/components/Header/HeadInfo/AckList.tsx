import React from 'react'
import { List } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { acknowledgement } from '@/options/acknowledgement'

export const AckList = React.memo(() => {
  const { t } = useTranslate('options')
  return (
    <List
      dataSource={acknowledgement.map((ack, i) => (
        <div key={i}>
          <a href={ack.href} rel="nofollow noopener noreferrer" target="_blank">
            {ack.name}
          </a>{' '}
          {t(`headInfo.acknowledgement.${ack.locale}`)}
        </div>
      ))}
      renderItem={item => <List.Item>{item}</List.Item>}
    />
  )
})
