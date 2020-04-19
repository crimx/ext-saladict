import React, { FC } from 'react'
import { Select, Slider, Switch } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictModalForm } from '@/options/components/SaladictModalForm'
import { pixelSlideFormatter } from '@/options/components/SaladictForm'
import { searchMode } from '../SearchModes/searchMode'

export interface StandaloneModalProps {
  show: boolean
  onClose: () => void
}

export const StandaloneModal: FC<StandaloneModalProps> = ({
  show,
  onClose
}) => {
  const { t } = useTranslate(['options', 'common'])
  const { availHeight } = window.screen

  return (
    <SaladictModalForm
      title={t(getConfigPath('tripleCtrlStandalone'))}
      visible={show}
      onClose={onClose}
      items={[
        {
          name: getConfigPath('tripleCtrlSidebar'),
          children: (
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              <Select.Option value="left">{t('locations.LEFT')}</Select.Option>
              <Select.Option value="right">
                {t('locations.RIGHT')}
              </Select.Option>
            </Select>
          )
        },
        {
          name: getConfigPath('tripleCtrlHeight'),
          hide: values => values[getConfigPath('tripleCtrlSidebar')],
          children: (
            <Slider
              tipFormatter={pixelSlideFormatter}
              min={250}
              max={availHeight}
              marks={{ 250: '250px', [availHeight]: `${availHeight}px` }}
            />
          )
        },
        {
          name: getConfigPath('tripleCtrlPageSel'),
          valuePropName: 'checked',
          children: <Switch />
        },
        searchMode('qsPanelMode', t)
      ]}
    />
  )
}
