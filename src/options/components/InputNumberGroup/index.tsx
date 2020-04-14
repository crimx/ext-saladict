import React, { FC } from 'react'
import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'

import './_style.scss'

export interface InputNumberGroupProps extends InputNumberProps {
  suffix?: React.ReactNode
}

export const InputNumberGroup: FC<InputNumberGroupProps> = props => {
  const { suffix, ...restProps } = props
  return (
    <span className="input-number-group-wrapper">
      <span className="input-number-group">
        <InputNumber {...restProps} />
        {suffix && <span className="input-number-group-addon">{suffix}</span>}
      </span>
    </span>
  )
}
