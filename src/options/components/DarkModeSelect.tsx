import React, { FC } from 'react'
import { Select } from 'antd'
import {
  DarkMode,
  DARK_MODE_LIGHT,
  DARK_MODE_DARK,
  DARK_MODE_FOLLOW
} from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'

interface DarkModeSelectProps {
  value?: DarkMode
  onChange?: (value: DarkMode) => void
}

export const DarkModeSelect: FC<DarkModeSelectProps> = props => {
  const { t } = useTranslate('options')
  const value = props.value || DARK_MODE_FOLLOW

  return (
    <Select value={value} onChange={props.onChange}>
      <Select.Option value={DARK_MODE_LIGHT}>
        {t('config.opt.darkMode.light')}
      </Select.Option>
      <Select.Option value={DARK_MODE_DARK}>
        {t('config.opt.darkMode.dark')}
      </Select.Option>
      <Select.Option value={DARK_MODE_FOLLOW}>
        {t('config.opt.darkMode.follow')}
      </Select.Option>
    </Select>
  )
}

export default DarkModeSelect
