import React, { FC } from 'react'
import { Select } from 'antd'
import { TFunction } from 'i18next'

export type LineBreakOption = '' | 'n' | 'p' | 'br' | 'space'

export interface LineBreakProps {
  t: TFunction
  value: LineBreakOption
  onChange: (value: LineBreakOption) => void
}

export const LineBreak: FC<LineBreakProps> = ({ t, value, onChange }) => (
  <Select value={value} style={{ width: 210 }} onChange={onChange}>
    <Select.Option value="">{t('export.linebreak.default')}</Select.Option>
    <Select.Option value="n">{t('export.linebreak.n')}</Select.Option>
    <Select.Option value="br">{t('export.linebreak.br')}</Select.Option>
    <Select.Option value="p">{t('export.linebreak.p')}</Select.Option>
    <Select.Option value="space">{t('export.linebreak.space')}</Select.Option>
  </Select>
)

export const LineBreakMemo = React.memo(LineBreak)
