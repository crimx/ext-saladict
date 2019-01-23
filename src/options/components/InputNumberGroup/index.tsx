import React from 'react'
import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'

import './_style.scss'

export interface InputNumberGroupProps extends InputNumberProps {
  suffix?: React.ReactNode
}

export class InputNumberGroup extends React.Component<InputNumberGroupProps> {
  render () {
    return (
      <span className='ant-input-group-wrapper ant-input-number-group-wrapper'>
        <span className='ant-input-wrapper ant-input-group'>
          <InputNumber {...this.props} />
          {!!this.props.suffix &&
            <span className='ant-input-group-addon'>{this.props.suffix}</span>
          }
        </span>
      </span>
    )
  }
}
