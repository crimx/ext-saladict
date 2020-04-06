import React, { FC, useEffect } from 'react'
import { FrownOutlined } from '@ant-design/icons'
import { message } from '@/_helpers/browser-api'

export const EntryError: FC = () => {
  useEffect(() => {
    message.self.send({ type: 'CLOSE_PANEL' })
  }, [])

  return (
    <div
      style={{
        height: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <FrownOutlined
        style={{ fontSize: 80, color: '#eb2f96', marginBottom: 10 }}
      />
      <h1>Entry Not Found</h1>
    </div>
  )
}
